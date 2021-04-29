---
draft: true
title: Custom Typescript Clients Using NSwag
date: 2020-05-14 10:00:00 +0000
description: NSwag is an awesome tool for generating request/response models and HTTP clients automatically by using Swagger/Open API docs. In this article I show you can totally customise the output of this tool to taylor the generated clients to your needs.
languages:
- C#
- TypeScript
technologies:
- NSwag
---

If you return a 200 or 404 from a service, all of the models have optional properties:

``` ts
export interface ExampleResponse {
    /** The description of the first property. */
    property1?: string | undefined;
    /** The description of the second property. */
    property2?: number;
}
```

I would prefer this wasn't the case as if I return 200 from my API I want to trust the data it returns.

Another thing you can't do is ignore certain types of client. My use-case was that I had an API Controller that I wanted to generated C# clients for, but not TypeScript. Without using a custom generator I don't think that's possible.

Another issue is that that whenever a 4XX or 5XX status code is returned, the generated client throws an exception. I would prefer to use pattern matching to cover different response codes, which I'll go through later.

Finally the generated clients don't support react hooks, so every time I use one I have to wrap it up in a `useEffect` method. I would prefer this to be part of the client to remove boilerplate code.

Create a new class library project:

``` bash
dotnet new console -o "./ClientGenerator"  
```

Install the `NSwag.CodeGeneration.TypeScript` NuGet package:

``` bash
cd "./ClientGenerator"
dotnet add NSwag.CodeGeneration.TypeScript
```

And place the following code as `Program.cs`:

``` csharp
using System;
using System.Threading.Tasks;
using NSwag;
using NSwag.CodeGeneration.TypeScript;

namespace ClientGenerator
{
    internal static class Program
    {
        private static async Task Main(string[] args)
        {
            var document = await OpenApiDocument.FromUrlAsync("http://localhost:5001/swagger/v1/swagger.json");
            var settings = new TypeScriptClientGeneratorSettings
            {
                ClassName = "{controller}Client",
            };

            var generator = new CustomTypeScriptClientGenerator(document, settings);
            var code = generator.GenerateFile();
            Console.WriteLine(code);
            Console.ReadLine();
        }
    }
}
```

Create a new class called `CustomTypeScriptClientGenerator`:

``` csharp
```