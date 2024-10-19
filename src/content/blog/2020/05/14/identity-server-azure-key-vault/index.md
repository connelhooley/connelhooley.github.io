---
title: Integrating Identity Server 4 With Azure Key Vault
time: 21:00:00
description: This article contains a small code snippet that allows you to use Azure Key Vault as your signing credential store in Identity Server 4, including rotating key support.
languages:
  - C#
technologies:
  - IdentityServer4
  - AzureKeyFault
  - AspNetCore
---

# Background

I'm building a personal project using `IdentityServer4` to authenticate an API that is invoked from an SPA. I wanted to store the certificates I am using to sign my JWTs in `Azure Key Vault`. Key Vault supports rotating certificates, so I wanted to implement that in the solution, so I didn't have to remember to restart the application whenever the keys rotated.

I found a discussion on GitHub [here][github-issue] that had some code snippets on how to do it. Below is my implementation, hopefully this will be helpful to someone.

> **Disclaimer**: all of the code in this article comes as is, without guarantee. I take no responsibility for its use. Please ensure this code is reviewed by your security engineers before use.

# Credential Store

This is the class that stores the certificates. It uses a `MemoryCache` instance to store the currently active certificate and also any secondary certificates. It does a call to get the latest certificates once a day.

When a new certificate is added, it is initially added as a secondary certificate for 1 day, before being set as the primary certificate. This is so that when the switch happens, hopefully clients will have the new certificate already and will be able to verify JWTs signed with it.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;
using IdentityServer4.Models;
using IdentityServer4.Stores;
using Microsoft.Azure.KeyVault;
using Microsoft.Azure.KeyVault.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.certificates;

namespace Example
{
    public sealed class AzureKeyVaultSigningCredentialsStore : ISigningCredentialStore, IValidationKeysStore
    {
        private const string MemoryCacheKey = "OAuthCerts";
        private const string SigningAlgorithm = SecurityAlgorithms.RsaSha256;

        private readonly SemaphoreSlim _cacheLock;
        private readonly KeyVaultClient _keyVaultClient;
        private readonly IMemoryCache _cache;
        private readonly IKeyVaultConfig _keyVaultConfig;

        public AzureKeyVaultSigningCredentialsStore(KeyVaultClient keyVaultClient, IKeyVaultConfig keyVaultConfig, IMemoryCache cache)
        {
            _keyVaultClient = keyVaultClient;
            _keyVaultConfig = keyVaultConfig;
            _cache = cache;

            // MemoryCache.GetOrCreateAsync does not appear to be thread safe:
            // https://github.com/aspnet/Caching/blob/56447f941b39337947273476b2c366b3dffde565/src/Microsoft.Extensions.Caching.Abstractions/MemoryCacheExtensions.cs#L92-L106
            _cacheLock = new SemaphoreSlim(1);
        }

        public async Task<SigningCredentials> GetSigningCredentialsAsync()
        {
            await _cacheLock.WaitAsync();
            try
            {
                var (active, _) = await _cache.GetOrCreateAsync(MemoryCacheKey, RefreshCacheAsync);
                return active;
            }
            finally
            {
                _cacheLock.Release();
            }
        }

        public async Task<IEnumerable<SecurityKeyInfo>> GetValidationKeysAsync()
        {
            await _cacheLock.WaitAsync();
            try
            {
                var (_, secondary) = await _cache.GetOrCreateAsync(MemoryCacheKey, RefreshCacheAsync);
                return secondary;
            }
            finally
            {
                _cacheLock.Release();
            }
        }

        private async Task<(SigningCredentials active, IEnumerable<SecurityKeyInfo> secondary)> RefreshCacheAsync(ICacheEntry cache)
        {
            cache.AbsoluteExpiration = DateTime.Now.AddDays(1);
            var enabledCertificateVersions = await GetAllEnabledCertificateVersionsAsync(_keyVaultClient, _keyVaultConfig.KeyVaultName, _keyVaultConfig.KeyVaultCertificateName);
            var active = await GetActiveCertificateAsync(_keyVaultClient, _keyVaultConfig.KeyVaultRolloverHours, enabledCertificateVersions);
            var secondary = await GetSecondaryCertificatesAsync(_keyVaultClient, enabledCertificateVersions);

            return (active, secondary);

            static async Task<List<CertificateItem>> GetAllEnabledCertificateVersionsAsync(KeyVaultClient keyVaultClient, string keyVaultName, string certName)
            {
                // Get all the certificate versions
                var certificateVersions = await keyVaultClient.GetCertificateVersionsAsync($"https://{keyVaultName}.vault.azure.net/", certName);

                // Find all enabled versions of the certificate and sort them by creation date in decending order
                return certificateVersions
                    .Where(certVersion => certVersion.Attributes.Enabled == true)
                    .Where(certVersion => certVersion.Attributes.Created.HasValue)
                    .OrderByDescending(certVersion => certVersion.Attributes.Created)
                    .ToList();
            }

            static async Task<SigningCredentials> GetActiveCertificateAsync(KeyVaultClient keyVaultClient, int rollOverHours, List<CertificateItem> enabledCertificateVersions)
            {
                // Find the first certificate version that is older than the rollover duration
                var rolloverTime = DateTimeOffset.UtcNow.AddHours(-rollOverHours);
                var filteredEnabledCertificateVersions = enabledCertificateVersions
                    .Where(certVersion => certVersion.Attributes.Created < rolloverTime)
                    .ToList();
                if (filteredEnabledCertificateVersions.Any())
                {
                    return new SigningCredentials(
                        await GetCertificateAsync(keyVaultClient, filteredEnabledCertificateVersions.First()),
                        SigningAlgorithm);
                }
                else if (enabledCertificateVersions.Any())
                {
                    // If no certificates older than the rollover duration was found, pick the first enabled version of the certificate (this can happen if it's a newly created certificate)
                    return new SigningCredentials(
                        await GetCertificateAsync(keyVaultClient, enabledCertificateVersions.First()),
                        SigningAlgorithm);
                }
                else
                {
                    // No certificates found
                    return default;
                }
            }

            static async Task<List<SecurityKeyInfo>> GetSecondaryCertificatesAsync(KeyVaultClient keyVaultClient, List<CertificateItem> enabledCertificateVersions)
            {
                var keys = await Task.WhenAll(enabledCertificateVersions.Select(item => GetCertificateAsync(keyVaultClient, item)));
                return keys
                    .Select(key => new SecurityKeyInfo { Key = key, SigningAlgorithm = SigningAlgorithm })
                    .ToList();
            }

            static async Task<X509SecurityKey> GetCertificateAsync(KeyVaultClient keyVaultClient, CertificateItem item)
            {
                var certificateVersionBundle = await keyVaultClient.GetCertificateAsync(item.Identifier.Identifier);
                var certificatePrivateKeySecretBundle = await keyVaultClient.GetSecretAsync(certificateVersionBundle.SecretIdentifier.Identifier);
                var privateKeyBytes = Convert.FromBase64String(certificatePrivateKeySecretBundle.Value);
                var certificateWithPrivateKey = new X509Certificate2(privateKeyBytes, (string)null, X509KeyStorageFlags.MachineKeySet);
                return new X509SecurityKey(certificateWithPrivateKey);
            }
        }
    }
}
```

# DI

Once you have added the store to your solution you can register it in .NET Core DI like so:

```csharp
using System.Diagnostics.CodeAnalysis;
using IdentityServer4.Stores;
using Microsoft.Azure.KeyVault;
using Microsoft.Azure.Services.AppAuthentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Clients.ActiveDirectory;

namespace Example
{
    public static class AzureKeyVaultServiceCollectionExtensions
    {
        // Uses MSI (Managed Service Identity)
        public static IServiceCollection AddKeyVaultSigningCredentials(this IServiceCollection @this)
        {
            var azureServiceTokenProvider = new AzureServiceTokenProvider();
            var authenticationCallback = new KeyVaultClient.AuthenticationCallback(azureServiceTokenProvider.KeyVaultTokenCallback);
            var keyVaultClient = new KeyVaultClient(authenticationCallback);
            @this.AddMemoryCache();
            @this.AddSingleton(keyVaultClient);
            @this.AddSingleton<AzureKeyVaultSigningCredentialsStore>();
            @this.AddSingleton<ISigningCredentialStore>(services => services.GetRequiredService<AzureKeyVaultSigningCredentialsStore>());
            @this.AddSingleton<IValidationKeysStore>(services => services.GetRequiredService<AzureKeyVaultSigningCredentialsStore>());
            return @this;
        }

        // Uses Client Credentials (client id and secret)
        public static IServiceCollection AddKeyVaultSigningCredentials(this IServiceCollection @this, string clientId, string clientSecret)
        {
            var azureServiceTokenProvider = new AzureServiceTokenProvider();
            var keyVaultClient = new KeyVaultClient(async (authority, resource, scope) =>
            {
                // Taken from https://docs.microsoft.com/en-us/azure/key-vault/secrets/quick-create-net-v3
                var adCredential = new ClientCredential(clientId, clientSecret);
                var authenticationContext = new AuthenticationContext(authority, null);
                return (await authenticationContext.AcquireTokenAsync(resource, adCredential)).AccessToken;
            });

            @this.AddMemoryCache();
            @this.AddSingleton(keyVaultClient);
            @this.AddSingleton<AzureKeyVaultSigningCredentialsStore>();
            @this.AddSingleton<ISigningCredentialStore>(services => services.GetRequiredService<AzureKeyVaultSigningCredentialsStore>());
            @this.AddSingleton<IValidationKeysStore>(services => services.GetRequiredService<AzureKeyVaultSigningCredentialsStore>());
            return @this;
        }
    }
```

# Config

You can then register the `IKeyVaultConfig` interface in DI however you do your app config:

```csharp
public interface IKeyVaultConfig
{
    string KeyVaultName { get; }

    string KeyVaultCertificateName { get; }

    int KeyVaultRolloverHours { get; }
}
```

[github-issue]: https://github.com/damienbod/IdentityServer4AspNetCoreIdentityTemplate/issues/30
