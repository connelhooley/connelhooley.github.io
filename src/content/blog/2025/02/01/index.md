---
title: Automated Testing
draft: true
time: 00:00:00
description: Automated testing is an art not a science, but following some principles will help you fall into a pit of success.
languages:
  - C#
---

# What Makes a Good Test

There are 3 main characteristics that can be used as principles for writing high quality tests.

## Speed

Quicker tests result in smaller feedback loops. The quicker you know something is broken, the quicker you can fix it. Automated tests should be executed in PR monitors and build pipelines. Reducing the time these take to run increases how often you can deploy. Depending on how the build agents are hosted it can save costs. Faster tests helps with running live unit testing tools such as [NCrunch](https://www.ncrunch.net).

## Targeted

Test names should describe what is being tested. When a test fails, its error message should explain exactly why. Modifying code should not break non-related tests.

## Reliable

It is vital tests are deterministic. They should always return the same results. Tests that only sometimes fail are known as being "flaky". Flaky tests that vary per execution can hide bugs if the execution path with the bug is not always executed. They can fail PR monitors where the test that is failing does not relate to the contents of the PR.

## Coverage

Tests should cover all business logic in the application.

# Writing Testable Code

Functional programming has the concept of "pure" functions. Regardless of the programming paradigm you're using, understanding this concept will help you write more testable code. Pure functions have the following characteristics:

1. **They must be deterministic:** If a function is called with the same inputs it much always return the same results. E.g. like addition in maths. 1 + 1 is **always** 2.
2. **They must have no side-effects:** The function must not modify any state that is not private to that function. The function should remain untouched and it should not impact "the real world" in any way. E.g. by making any network traffic, writing to console or logging. CPU and memory usage caused from running a function is not taken into account when determine if it is pure.

The following function is pure:

``` csharp
public static string FormatName(string first, string last)
{
  var i = 0;
  i++;
  return $"{first} {last}";
}
```

It always returns the same result for the same first name and last name. The only state it modifies is private to the function. It does not impact the real world.

The following function is not pure:

``` csharp
public static void PrintName(string first, string last)
{
  Console.WriteLine($"{first} {last}");
}
```

It is not pure because it impacts the real world. When you run this method you will see the console get written to. Methods that do not return a value are usually not pure.

If a function has another function (or interface) passed into it as an input, it is assumed the input is pure and therefore the function that accepts it is pure too. The following function is still pure:

``` csharp
public static async Task<string> GetName(IUserRepo userRepo, string userId)
{
  var user = userRepo.Get(userId);
  return $"{user.FirstName} {user.LastName}";
}
```

Even though the implementation of `IUserRepo` will likely not be pure, we can't guarantee that so the `GetName` method remains pure.

The following method however, is no longer pure:

``` csharp
public static async Task<string> GetName(UserDbRepo userRepo, string userId)
{
  var user = userRepo.Get(userId);
  return $"{user.FirstName} {user.LastName}";
}
```

This is because we swapped out the interface for a concrete implementation. The `UserDbRepo` concrete class connects to a database which impacts the real world via network traffic. This means the function is no longer pure.

Due to the characteristics of pure functions described above, they are easy to test. Using functional paradigms typically results in an architecture where you push all of your non-pure functions to the edges of your application. The centre becomes lots of pure functions calling each other.

An example of such architecture is the [Hexagonal](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) pattern.

CREATE DIAGRAM HERE

Grouping together your business logic in pure functions and isolating non-pure functions to the edge of your system really helps to make the code testable.

Using functional programming makes this easier, but it is still possible with other paradigms.

# Writing Tests

TDD

Fake it till you make it

## Test Structure

AAA

SUT

Test naming conventions

Error messages

Single assertion

## Mocking

There are two types of dependencies to mock.

### Queries

Set up mock to only returning data if valid inputs are given.

## #Commands

Assert that mock is given correct inputs.

### Call Orders

Use callbacks to determine the order that calls are made.
