---
title: Automated Testing
draft: true
time: 00:00:00
description: Automated testing is an art not a science, but following some principles will help you fall into a pit of success.
languages:
  - C#
---

# What Makes a Good Test

There are 4 main areas that can be used as principles for writing high quality tests.

## Coverage

Tests should cover as much of the application as possible.

## Speed

Quicker tests result in smaller feedback loops. The quicker you know something is broken, the quicker you can fix it. Automated tests should be executed in PR monitors and build pipelines. Reducing the time these take to run increases how often you can deploy. Depending on how the build agents are hosted it can save costs. Faster tests helps with running live unit testing tools such as [NCrunch](https://www.ncrunch.net).

## Specificity

Tests should be targeted and specific regarding what they are covering. When a test fails, it should be clear why. Modifying code should not break unrelated tests.

## Reliability

It is vital tests are deterministic. They should always return the same results. Tests that only sometimes fail are known as being "flaky". Flaky tests that vary per execution can hide bugs if the execution path with the bug is not always executed. They can fail PR monitors where the test that is failing does not relate to the contents of the PR.

# Writing Testable Code

Lets look at some of the patterns we can use to write code that is more testable.

## Pure Functions

Functional programming has the concept of "pure" functions. Regardless of the programming paradigm you're using, understanding this concept will help you write more testable code. Pure functions have the following characteristics:

1. **They must be deterministic:** If a function is called with the same inputs it much always return the same results. E.g. like addition in maths. 1 + 1 is *always* 2.
2. **They must have no side-effects:** The function must not modify any state that is not private to that function. The function should remain untouched and it should not impact "the real world" in any way. E.g. by making any network traffic, writing to console or logging. CPU and memory usage caused from running a function is not taken into account when determine if it is pure.

The following function is pure:

```csharp
public static string FormatName(string first, string last)
{
  var i = 0;
  i++;
  return $"{first} {last}";
}
```

It always returns the same result for the same first name and last name. The only state it modifies is private to the function. It does not impact the real world.

The following function is not pure:

```csharp
public static void PrintName(string first, string last)
{
  Console.WriteLine($"{first} {last}");
}
```

It is not pure because it impacts the real world. When you run this method you will see the console get written to. Methods that do not return a value are usually not pure.

If a function has another function (or interface) passed into it as an input, it is assumed the input is pure and therefore the function that accepts it is pure too. The following function is still pure:

```csharp
public static async Task<string> GetName(IUserRepo userRepo, string userId)
{
  var user = userRepo.Get(userId);
  return $"{user.FirstName} {user.LastName}";
}
```

Even though the implementation of `IUserRepo` will likely not be pure, we can't guarantee that so the `GetName` method remains pure.

The following method however, is no longer pure:

```csharp
public static async Task<string> GetName(UserDbRepo userRepo, string userId)
{
  var user = userRepo.Get(userId);
  return $"{user.FirstName} {user.LastName}";
}
```

This is because we swapped out the interface for a concrete implementation. The `UserDbRepo` concrete class connects to a database which impacts the real world via network traffic. This means the function is no longer pure.

## Testable Architectures

Due to the characteristics of pure functions described above, they are easy to test. Using functional paradigms typically results in an architecture where you push all of your non-pure functions to the edges of your application. The centre becomes lots of pure functions calling each other.

An example of such architecture is the [Hexagonal](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) pattern.

Grouping together your business logic in pure functions and isolating non-pure functions to the edge of your system really helps to make the code testable.

![A diagram in a hand drawn style. It shows a box with non-pure areas on its edges and the pure areas in its centre.](./functional-architecture.svg)

Using functional paradigms makes this easier, but it is still possible with other paradigms like object-oriented.

# Writing Unit Tests

We've covered how we can write testable code, lets look at the tests themselves now.

We'll start with unit tests. Each pure component at the centre of our architecture should be unit tested. The definition of what a unit is can vary but defining it as a class in OOP[^oop] languages and a function in FP[^fp] languages is the most common practice.

# Test Names

Having descriptive and consistent test names helps ensure tests are [specific](#specificity) (one of the previously mentioned principles). It's not important what convention you use, it's just important you have one to ensure consistency across the code base.

It is common practice to think of and write BDD[^bdd] tests as GWTs[^gwt]. Almost all unit tests fall into the following 3 categories and we can map each of them into the same GWT structure to gain specific and consistent test names.

## Non-Static Methods/Properties
1. The type being tested and any descriptions of relevant constructor params or states the class needs to be in (*given*)
2. The method/property being tested and any relevant arguments (*when*)
3. The expected result (*then*)

Some examples:
- `UriWithValidUriString_AbsolutePathGetter_ShouldReturnEntirePathWithOutQueryStringParams`
- `ListWithNoItems_Single_ShouldThrow`
- `ListWithItems_SingleWithPredicateThatDoesNotMatchAnItem_ShouldThrow`
- `ListWithItems_SingleWithPredicateThatDoesMatchAnItem_ShouldReturnMatchedItem`
- `UserManager_GetUser_ShouldReturnUserFromUserRepository`
- `UserManager_GetUser_ShouldLogAnInfoMessage`
- `UserManager_ModeSetter_ShouldLogInfoMessage`
- `NetworkCredentialWithNoValues_UserNameGetter_ShouldReturnNull`
- `NetworkCredentialWithNoValues_UserNameSetterWithValidValue_ShouldNotThrow`
- `NetworkCredentialWithUserNamePopulatedViaSetter_UserNameGetter_ShouldReturnPreviouslySetValue`

**Note:** The only thing you can test for in a setter is whether it throws or whether there was a side-effect. Setter tests should be paired with getter tests that ensure the correct value is returned after setting. The last method or property you invoke on a class is the thing you are testing. It is up to you to decide whether to test getters and setters, if they are auto generated you can make a case for not testing them.

## Static Methods/Properties
1. The type being tested (*given*)
2. The method/property being tested and any relevant arguments (*when*)
3. The expected result (*then*)

Some examples:
- `String_JoinWithSeparatorAndMultipleParams_ShouldReturnStringWithTheSeparatorBetweenEachItem`
- `String_JoinWithSeparatorAndEmptyParams_ShouldReturnEmptyString`
- `String_JoinWithSeparatorAndEmptyParams_ShouldReturnEmptyString`

## Constructor Tests
1. The type being tested (*given*)
2. The constructor being tested and any relevant arguments (*when*)
3. The expected result (*then*)

Some examples:
- `UriConstructorWithMissingProtocol_ShouldThrow`
- `UriConstructorWithValidUri_ShouldNotThrow`
- `UserManagerConstructorWithNullUserRepository_ShouldThrow`
- `UserManagerConstructorWithNonNullUserRepository_ShouldNotThrow`
- `UserManagerConstructor_ShouldLogInfoMessage`

**Note:** The only thing you can test for in a constructor is whether it throws or whether there was a side-effect.

# Test Structure

Once you have your test names we can start writing the tests. It is common practice to write unit tests in the AAA format:

1. Arrange (*given*)
2. Act (*when*)
3. Assert (*then*)

I always find it useful to add code comments documenting these areas. When testing an instance of a class I also always name the variable that is being tested "sut" - System Under Test. I always call the variable that is being validated "result".

The examples below use [XUnit](https://xunit.net/), [NSubstitute](https://nsubstitute.github.io/) and [Shouldly](https://docs.shouldly.org/)

```csharp
[Fact]
public void UserManager_GetUser_ShouldReturnUserFromUserRepository()
{
  // Arrange
  var userRepo = Substitute.For<IUserRepository>();
  userRepo
    .GetUserById("some-user-id")
    .Returns(new User("some-user-id", "Some first name", "Some last name"));
  var sut = new UserManager(userRepo, Substitute.For<ILogger>());

  // Act
  var result = sut.GetUser("some-user-id");

  // Assert
  result.ShouldSatisfyAllConditions(
    () => result.Id.ShouldBe("some-user-id"),
    () => result.FirstName.ShouldBe("Some first name"),
    () => result.LastName.ShouldBe("Some last name"));
}
```

Not all tests need an arrange. For tests that assert exceptions, I create an `Action` or `Func<T>` variable called "act", I then assert the delegate. This ensures the code still follows the AAA structure:

```csharp
[Fact]
public void UserManagerConstructorWithNullUserRepository_ShouldThrow()
{
  // Act
  Action act = () => new UserManager(null, Substitute.For<ILogger>());

  // Assert
  act.ShouldThrow<ArgumentNullException>();
}
```

Error messages

Single assertion

## Mocking

There are two types of dependencies to mock.

### Queries

Set up mock to only returning data if valid inputs are given.

### Commands

Assert that mock is given correct inputs.

### Call Orders

Use callbacks to determine the order that calls are made.

## TDD

I'm a big advocate TDD[^tdd]. When "doing" TDD you write the test first. Writing the test first results in simple and easy to read tests. You are documenting *what* you want to happen, and not *how*. As you start passing the tests you tweak the *implementation* that is looking to pass the test.

When writing the implementation first, it is very easy to fall into the trap of tweaking the tests to get them passing. You begin to mark your own homework. It is easy to say to your self, the code looks right lets write a test to cover this. TDD stops you being distracted with the implementation (the *how*) and keeps you focussed on the requirements (the *what*) ensuring you build the right thing.

The most common pitfall I see with non-TDD tests is the growth of complexity over time. You may have class and some tests that are fine, so you add to the implementation and add some tests to cover what you added. If you repeat this a few times the the test class grows to thousands of lines, the test set ups are complex and the implementation has hidden complexity. Hidden complexity is what I refer to when code looks neat and tidy and easy to understand but actually there are a large number of execution paths through the class and lots of dependencies.

**TDD is a design tool**, which is it biggest benefit. Yes you can write tests after the fact (or get AI to do it 😒) but you lose the benefit of the tests telling you the code is getting too complex. With TDD you start to write the test based on the requirements and if you start to find the test is getting complex, that means your implementation is even more complex, you just don't see it yet. **Tests show signs of being complex earlier than implementations.**

When doing TDD I like to start off by writing all of my test names out using a naming convention (as discussed previously [here](#test-names)). I then write the code for a test, see it fail, then pass it, then clean up the code if required (known the as red-green-refactor workflow). Repeat the process for all tests and until everything is covered.

## Fake It Till You Make It

Faking it till you make it is TDD workflow where you aim to mock requirements in dependencies. You then pass that test, repeat the process for the implementations for each mocked dependency. This ensures your tests are simple and your implemenations are easy to read and easy to extend. It is an art not a science as it can result in "combinatorial explosion" which is when your code base contains lots of small classes which increases complexity.

Lets demonstrate this with an example. The example below documents some technical requirements for an endpoint that is hit when a purchase form is submitted:

- If the current date is Black Friday
  - Apply a discount using form values
- Call payment service using form values
- If the payment service is successful:
  - Call customer service
  - If the customer service is successful:
    - Call the product service using form values and payment response
    - If the product service is successful:
      - Log a message
      - Call the email service using the response from the product service
      - Return a success response
    - If the product service is unsuccessful:
      - Log an error
      - Return a failure response
  - If the customer service is unsuccessful:
    - Log an error
    - Return a failure response
- If the payment service is unsuccessful:
  - Log an error
  - Return a failure response

We start off by writing tests for the "root" or "top" pure component.

```csharp

```

When listing some requirements, we write interfaces for each part of the requirements. We then implement those mocks and do the same thing again, until there are no more interfaces to mock.

[^tdd]: Test driven development
[^oop]: Object orientated programming
[^fp]: Functional programming
[^bdd]: Business driven development
[^gwt]: Given when then
