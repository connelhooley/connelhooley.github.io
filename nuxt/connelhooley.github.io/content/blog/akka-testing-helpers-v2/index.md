---
title: Akka Testing Helpers V2
date: 2018-10-05 17:00:00
description: Announcing Akka Testing Helpers V2
languages:
  - C#
technologies:
  - Akka.NET
---

# Introduction

For an introduction into what the Akka Testing Helpers project is, please see the solution's new [readme on GitHub][akka-testing-helpers-readme].

# Upgrading To V2

I have removed the versions of this package from NuGet that were versioned by date (for example `2018.3.6.2`) and uploaded a new package with the version `2.0.0`. This is to honour semantic versioning going forward.

# Breaking Changes

There are 2 tiny breaking changes between version `2018.3.6.2` and version `2.0.0`. A quick find and replace should be all that is needed. Now proper versioning is in place upgrades should be smoother in the future.

## RegisterHandler

The `RegisterHandler` method on the settings class is now called `RegisterChildHandler`.

```csharp
// Old:
UnitTestFrameworkSettings.Empty.RegisterHandler<ExampleActor, int>(i => i * 2));

// New:
UnitTestFrameworkSettings.Empty.RegisterChildHandler<ExampleActor, int>(i => i * 2));
```

## Supervisor

The `Supervisor` property has been renamed to `Parent`.

```csharp
// Old:
framework.Supervisor.Expect("hello world");

// New:
framework.Parent.Expect("hello world");
```

# New Features

There are 3 new features in version 2.0.0.

## Parent Handlers

You can now add handlers to the parent test probe:

```csharp
UnitTestFramework<SutActor> framework = UnitTestFrameworkSettings
    .Empty
    .RegisterParentHandler<Save>(s => new ModifiedSave(s.Value.ToUpper()))
    .CreateFramework<SutActor>(this);
```

The example above creates an instance of `SutActor` with a parent TestProbe that receives `Save` messages and replies with `ModifiedSave` messages.

## Unhandled Exceptions

You can now send a message into the SUT actor and wait for an exception to be thrown. There is also a new property on the UnitTestFramework that allows you to access unhandled exceptions.

```csharp
//arrange
Exception message = new ArithmeticException();
UnitTestFramework<SutActor> framework = UnitTestFrameworkSettings
    .Empty
    .CreateFramework<SutActor>(this);

//act
framework.TellMessageAndWaitForException(message);

//assert
framework.UnhandledExceptions.First().Should().BeSameAs(message);
```

The example above creates an instance of `SutActor`, then sends it a message. In this example the message is an exception and the `StuActor` throws any exceptions it receives. The `TellMessageAndWaitForException` method blocks the thread until the exception is thrown. The `UnhandledExceptions` property is then used to assert the correct exception is thrown.

This feature keeps inline with the framework's philosophy of removing hard-coded wait times.

## Delay

You can now block the current thread by a certain period of time. The main benefit of this feature is that it works like the rest of the Akka TestKit by multiplying the given duration by the configured timefactor.

```csharp
UnitTestFramework<SutActor> framework = UnitTestFrameworkSettings
    .Empty
    .CreateFramework<SutActor>(this);

// Sync
framework.Delay(TimeSpan.FromSeconds(1));

// Async
await framework.DelayAsync(TimeSpan.FromSeconds(1));
```

The above example blocks the thread by 3 seconds if the given TestKit instance has a `timefactor` of 3. Using this method allows you to modify all of your currently hard-coded delays by the `timefactor`.

[akka-testing-helpers-readme]: https://github.com/connelhooley/AkkaTestingHelpers

[old-blog-post]: /blog/2017/09/30/introducing-akka-testing-helpers-di
