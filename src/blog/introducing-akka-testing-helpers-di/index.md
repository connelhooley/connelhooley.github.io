---
title: "UPDATE: Introducing Akka Testing Helpers"
date: 2017-09-30 18:00:00 +0000
description: Introduction to my new Akka testing NuGet package.
languages:
  - C#
technologies:
  - Akka.NET
---

# Introduction

Myself and my colleagues found actors inside a hierarchy difficult to unit test when we began working on our first Akka production code base. I would like to first discuss why we found it difficult before presenting my solution.

# The problem

When unit testing, we wanted to mock out all children and parent actors, and for integration tests we wanted to mock out only some of the children and parents.

This [Petabridge blog post][petabridge-testing-children] describes how to unit test a parent-child relationship with the following example:

```csharp
public class ChildActor : ReceiveActor
{
    public ChildActor()
    {
        ReceiveAny(o => Sender.Tell("hello!"));
    }
}

public class ParentActor : ReceiveActor
{
    public ParentActor()
    {
        var child = Context.ActorOf(Props.Create(() => new ChildActor()));
        ReceiveAny(o => child.Forward(o));
    }
}

[TestFixture]
public class ParentGreeterSpecs : TestKit
{
    [Test]
    public void Parent_should_create_child()
    {
        // verify child has been created by sending parent a message
        // that is forwarded to child, and which child replies to sender with
        var parentProps = Props.Create(() => new ParentActor());
        var parent = ActorOfAsTestActorRef<ParentActor>(parentProps, TestActor);
        parent.Tell("this should be forwarded to the child");
        ExpectMsg("hello!");
    }
}
```

Although this example seems fine, if the `ChildActor` had its own children, then this test could potentially run code in those children and every single actor underneath them. Take the following actor hierarchy (where actor `C` has an interface injected into it rather than having its own children):

![Actor hierarchy][actor-hierarchy]

Using the Petabridge method to test actor `D`, the actors being tested look like this:

![Actor hierarchy highlighted where testing actor D][actor-hierarchy-testing-d]

It would be much better to mock out the children and just test actor `D` like this:

![Actor hierarchy highlighted where testing actor D with mocks][actor-hierarchy-testing-d-mocks]

The Petabridge blog post also describes [how to replace your actors with mock versions, such as the `BlackHoleActor`][petabridge-testing-black-hole] using the following example:

```csharp
public IdentityManagerActor(IActorRef authenticationActor)
{
    _authenticator = authenticationActor;

    Receive<CreateUser>(create =>
    {
        var senderClosure = Sender;

        // this actor needs it create user request to be authenticated
        // within 2 seconds or this operation times out & cancels
        // the Task returned by Ask<>
        _authenticator.Ask<UserResult>(create, TimeSpan.FromSeconds(2))
            .ContinueWith(tr =>
            {
                if (tr.IsCanceled || tr.IsFaulted)
                    return new UserResult(false);

                return tr.Result;
            }).PipeTo(senderClosure);
    });
}

// other code omitted for brevity...

[Test]
public void IdentityManagerActor_should_fail_create_user_on_timeout()
{
    // the BlackHoleActor will NEVER respond to any message sent to it
    // which will force the CreateUser request to time out
    var blackhole = Sys.ActorOf(BlackHoleActor.Props);
    var identity = Sys.ActorOf(Props.Create(() => new IdentityManagerActor(blackhole)));

    identity.Tell(new CreateUser());
    var result = ExpectMsg<UserResult>().Successful;
    Assert.False(result);
}
```

Although again this example seems fine, it results in losing the actor hierarchy. If you create two root actors from your `ActorSystem` and then inject one into another, then the actors are siblings rather than parent and child.

This Petabridge blog post also describes how to unit test a child actor's SupervisorStrategy with the following example:

```csharp
[Test]
public void OddEvenActor_should_throw_exception_on_bad_input()
{
    // create coordinator, which spins up odd/even child actors
    var coordinator = Sys.ActorOf(Props.Create(() => new OddEvenCoordinatorActor()), "coordinator");

    // assert we're set up right
    coordinator.Tell(1);
    coordinator.Tell(2);
    ExpectMsg<ValidInput>();
    ExpectMsg<ValidInput>();

    // test
    var even = ActorSelection("akka://test/user/coordinator/even").ResolveOne(TimeSpan.FromSeconds(5)).Result;
    var odd = ActorSelection("akka://test/user/coordinator/odd").ResolveOne(TimeSpan.FromSeconds(5)).Result;

    // expect exception
    EventFilter.Exception<BadDataException>().Expect(2, () =>
    {
        even.Tell(1);
        odd.Tell(2);
    });
}

// omitted for brevity...

[Test]
public void OddEvenCoordinatorActor_should_stop_child_on_bad_data()
{
    // create coordinator, which spins up odd/even child actors
    var coordinator = Sys.ActorOf(Props.Create(() => new OddEvenCoordinatorActor()), "coordinator");

    // assert we're set up right
    coordinator.Tell(1);
    coordinator.Tell(2);
    ExpectMsg<ValidInput>();
    ExpectMsg<ValidInput>();

    // test
    var even = ActorSelection("akka://test/user/coordinator/even").ResolveOne(TimeSpan.FromSeconds(5)).Result;
    var odd = ActorSelection("akka://test/user/coordinator/odd").ResolveOne(TimeSpan.FromSeconds(5)).Result;

    // even & odd should be killed when parent's SupervisorStrategy kicks in
    Watch(even);
    Watch(odd);

    // we cover BadDataShutdown being sent in another test
    IgnoreMessages(msg => msg is BadDataShutdown);

    // even & odd should be killed when parent's SupervisorStrategy kicks in
    even.Tell(1);
    ExpectTerminated(even);
    odd.Tell(2);
    ExpectTerminated(odd);
}
```

Although once again this example seems fine, it is an integration test (by the blog post's own admission) as it tests multiple actors in the same test. Also if you take the approach of testing the side affects of the SupervisorStrategy then you end up testing the Akka framework more than your own actors. For example if you have a SupervisorStrategy of the type AllForOneStrategy that has a retry limit of 10, then using this technique you need to watch an actor restart 10 times before you can assert it does not restart an 11th time, when really all we want to do is test how the SupervisorStrategy is configured.

# About the solution

If you want to maintain the actor hierarchy then you must create children inside the parent. This is where DI comes to the rescue. Akka makes it easy to modify how child actors are resolved. This is done by implementing an interface called `DependencyResolver`. The interface takes in the `Type` of actor you want to create, and then performs some logic to create it. Dependency resolvers don't have to create the actor type that is requested, they can return any actor type. This makes it possible to create a simple dependency resolver that always returns mock actors regardless of the type is asked for.

The `TestProbe` is a great testing class in Akka that you can use as a mock actor. They allow you to assert if they have received a certain message. You can also modify their behaviour using an object called `AutoPilot`. This makes it a perfect class to return from a `DependencyResolver`.

Child actors are created asynchronously. This means that when running a test to assert that an actor has created a child, then it is very possible that your assertion could be ran before the child is created. This kind of async issue can crop up when running unit tests on slow build servers. Akka has a class called `TestLatch` that allows you to block a thread until an event has happened a certain amount of times. This makes it a perfect mechanism for waiting until the required number of children have been resolved. The benefit of a TestLatch compared to other vanilla .NET threading classes is that is adheres to various Akka config values, such as `timefactor` and `default-timeout`.

# The solution

My unit testing solution registers a custom `DependencyResolver` that replaces all resolved children with `TestProbe` instances. It uses a `TestLatch` to ensure that the expected number of children have been created before running any assertions.

My NuGet package wraps all this up in a way that is super easy to consume. The resolver keeps track of all the test probes so you can access them once your SUT (System Under Test) has been created.

## Example 1 - Creating Children & Sending Them Messages

Below is an example test class that checks if an actor creates children with the correct name and type and forwards the correct messages to them:

```csharp
using Akka.Actor;
using Akka.DI.Core;
using Akka.TestKit.Xunit2;
using FluentAssertions;
using Xunit;

namespace ConnelHooley.AkkaTestingHelpers.MediumTests.UnitTestFrameworkTests.Examples
{
    public class Examples1 : TestKit
    {
        public Examples1() : base(AkkaConfig.Config) { }

        public class ChildActor : ReceiveActor { }

        public class ParentActor : ReceiveActor
        {
            public ParentActor()
            {
                var child1 = Context.ActorOf(Context.DI().Props<ChildActor>(), "child-actor-1");
                var child2 = Context.ActorOf(Context.DI().Props<ChildActor>(), "child-actor-2");
                child1.Tell("hello actor 1");
                child2.Tell(42);
            }
        }

        [Fact]
        public void ParentActor_Constructor_CreatesChildWithCorrectTypeAndName()
        {
            //act
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<ParentActor>(this, 2);

            //assert
            framework
                .ResolvedType("child-actor-1")
                .Should().Be<ChildActor>();
        }

        [Fact]
        public void ParentActor_Constructor_SendsChildCorrectMessage()
        {
            //act
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<ParentActor>(this, 2);

            //assert
            framework
                .ResolvedTestProbe("child-actor-1")
                .ExpectMsg("hello actor 1");
        }
    }
}
```

Firstly, we create a settings object using the static Empty property. The settings object is used to register custom handlers for each of your child actors, we'll see an example of what these are later. Once you have a settings object you can create the framework by passing in:

- A `TestKit` instance
- The number of children you expect the sut actor to create in its constructor.
- If your sut actor does not have a default constructor then you must also provide a `Props` object.

Once you have created the framework can query it for any of the following, based on the child's expected name:

- The resolved `TestProbe`. This is done by calling `ResolvedTestProbe`.
- The type of actor the parent asked for. This is done by calling `ResolvedType`.
- The `SupervisorStrategy` used to supervise the child. This is done by calling `ResolvedSupervisorStrategy`.

In this example we used `ResolvedType` to assert the correct type was resolved and `ResolvedTestProbe` to assert that a child is sent the correct message.

## Example 2 - Handling Child Replies

Below is an example that configures the child actor to reply to messages, and then asserts that a mock is given the replied message:

```csharp
using Akka.Actor;
using Akka.DI.Core;
using Akka.TestKit.Xunit2;
using Moq;
using Xunit;

namespace ConnelHooley.AkkaTestingHelpers.MediumTests.UnitTestFrameworkTests.Examples
{
    public class Examples2 : TestKit
    {
        public Examples2() : base(AkkaConfig.Config) { }

        public class ChildActor : ReceiveActor
        {
            public class ModifiedSave
            {
                public string Value { get; }

                public ModifiedSave(string value)
                {
                    Value = value;
                }
            }
        }

        public interface IRepository
        {
            void Save(string value);
        }

        public class ParentActor : ReceiveActor
        {
            public ParentActor(IRepository repo)
            {
                var child = Context.ActorOf(Context.DI().Props<ChildActor>(), "child-actor-1");
                Receive<Save>(s => child.Tell(s));
                Receive<ChildActor.ModifiedSave>(s => repo.Save(s.Value));
            }

            public class Save
            {
                public string Value { get; }

                public Save(string value)
                {
                    Value = value;
                }
            }
        }

        [Fact]
        public void ParentActor_ReceiveSaveMessage_StoresModifiedSaveMessageFromChildInRepo()
        {
            //arrange
            Mock<IRepository> repoMock = new Mock<IRepository>();
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .RegisterHandler<ChildActor, ParentActor.Save>(s => new ChildActor.ModifiedSave(s.Value.ToUpper()))
                .CreateFramework<ParentActor>(this, Props.Create(() => new ParentActor(repoMock.Object)), 1);

            //act
            framework.Sut.Tell(new ParentActor.Save("hello world"));

            //assert
            AwaitAssert(() => repoMock.Verify(repo => repo.Save("HELLO WORLD"), Times.Once));
        }
    }
}
```

The `ParentActor` in this example doesn't have a parameterless constructor, so a props object must be given to the `CreateFramework` method. This props object is used to inject the mock into the actor.

When creating the `UnitTestFramework` object you can register _handlers_. A handler is a method that is ran when a particular type of actor receives a particular type of message. This example registers a handler that runs whenever a `ChildActor` receives a `ParentActor.Save` message. The handler returns an upper case `ChildActor.ModifiedSave` message. The returned message is then sent back to the actor that sent the original message.

## Example 3 - Supervisor

The example below demonstrates how to check that an actor sends a message to its parent/supervisor:

```csharp
using Akka.Actor;
using Akka.TestKit.Xunit2;
using Xunit;

namespace ConnelHooley.AkkaTestingHelpers.MediumTests.UnitTestFrameworkTests.Examples
{
    public class Examples3 : TestKit
    {
        public Examples3() : base(AkkaConfig.Config) { }

        public class DummyActor : ReceiveActor
        {
            public DummyActor()
            {
                Receive<string>(s =>
                {
                    Context.Parent.Tell(s.ToUpper());
                });
            }
        }

        [Fact]
        public void DummyActor_ReceiveStringMessage_SendsUpperCaseStringMessageToSupervisor()
        {
            //arrange
            UnitTestFramework<DummyActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<DummyActor>(this);

            //act
            framework.Sut.Tell("hello world");

            //assert
            framework.Supervisor.ExpectMsg("HELLO WORLD");
        }
    }
}
```

When the framework creates the sut actor, it creates it with a `TestProbe` as its parent, which you can access using the Supervisor property. This ensures you know the sut actor is sending messages to its parent and not back the sender.

## Example 4 - SupervisorStrategy

The following example demonstrates how to check that an actor creates its children with the correct `SupervisorStrategy`.

```csharp
using System;
using System.Threading;
using Akka.Actor;
using Akka.DI.Core;
using Akka.TestKit.Xunit2;
using FluentAssertions;
using Xunit;

namespace ConnelHooley.AkkaTestingHelpers.MediumTests.UnitTestFrameworkTests.Examples
{
    public class Examples4 : TestKit
    {
        public Examples4() : base(AkkaConfig.Config) { }

        public class ParentActor : ReceiveActor
        {
            public ParentActor()
            {
                Thread.Sleep(5);
                Context.ActorOf(
                    Context.DI().Props<ChildActor>(),
                    "child-1");
                Context.ActorOf(Context
                    .DI().Props<ChildActor>().WithSupervisorStrategy(new AllForOneStrategy(
                        3,
                        500,
                        exception => Directive.Escalate)),
                    "child-2");
            }

            protected override SupervisorStrategy SupervisorStrategy() =>
                new OneForOneStrategy(
                    1,
                    1000,
                    exception => Directive.Stop);
        }

        public class ChildActor : ReceiveActor { }

        [Fact]
        public void ParentActor_Constructor_CreatesChild1WithOneForOneStrategy()
        {
            //act
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<ParentActor>(this, 2);

            //assert
            framework.ResolvedSupervisorStrategy("child-1")
                .Should().BeOfType<OneForOneStrategy>();
        }

        [Fact]
        public void ParentActor_Constructor_CreatesChild1WithCorrectMaxNumberOfRetries()
        {
            //act
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<ParentActor>(this, 2);

            //assert
            framework.ResolvedSupervisorStrategy("child-1")
                .As<OneForOneStrategy>().MaxNumberOfRetries
                .Should().Be(1);
        }

        [Fact]
        public void ParentActor_Constructor_CreatesChild1WithCorrectTimeout()
        {
            //act
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<ParentActor>(this, 2);

            //assert
            framework.ResolvedSupervisorStrategy("child-1")
                .As<OneForOneStrategy>().WithinTimeRangeMilliseconds
                .Should().Be(1000);
        }

        [Fact]
        public void ParentActor_Constructor_CreatesChild1WithCorrectDecider()
        {
            //act
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<ParentActor>(this, 2);

            //assert
            framework.ResolvedSupervisorStrategy("child-1")
                .As<OneForOneStrategy>().Decider.Decide(new Exception())
                .Should().Be(Directive.Stop);
        }

        [Fact]
        public void ParentActor_Constructor_CreatesChild2WithOneForOneStrategy()
        {
            //act
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<ParentActor>(this, 2);

            //assert
            framework.ResolvedSupervisorStrategy("child-2")
                .Should().BeOfType<AllForOneStrategy>();
        }

        [Fact]
        public void ParentActor_Constructor_CreatesChild2WithCorrectMaxNumberOfRetries()
        {
            //act
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<ParentActor>(this, 2);

            //assert
            framework.ResolvedSupervisorStrategy("child-2")
                .As<AllForOneStrategy>().MaxNumberOfRetries
                .Should().Be(3);
        }

        [Fact]
        public void ParentActor_Constructor_CreatesChild2WithCorrectTimeout()
        {
            //act
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<ParentActor>(this, 2);

            //assert
            framework.ResolvedSupervisorStrategy("child-2")
                .As<AllForOneStrategy>().WithinTimeRangeMilliseconds
                .Should().Be(500);
        }

        [Fact]
        public void ParentActor_Constructor_CreatesChild2WithCorrectDecider()
        {
            //act
            UnitTestFramework<ParentActor> framework = UnitTestFrameworkSettings
                .Empty
                .CreateFramework<ParentActor>(this, 2);

            //assert
            framework.ResolvedSupervisorStrategy("child-2")
                .As<AllForOneStrategy>().Decider.Decide(new Exception())
                .Should().Be(Directive.Escalate);
        }
    }
}
```

When a child is created the framework stores the SupervisorStrategy that was given in the Props object for that child (such as "child-2" in the example above). If no SupervisorStrategy is given in the Props object, then the parent's private SupervisorStrategy property is returned (such as "child-1" in the example above).

# Get it on NuGet

You can install the package on NuGet using the following command or usual methods:

> Install-Package ConnelHooley.AkkaTestingHelpers

> **NOTE**: The package used to called ConnelHooley.AkkaTestingHelpers.DI, please use the new name if you're using the old one.

<a href="https://github.com/connelhooley/AkkaTestingHelpers" class="button-major" target="_BLANK"><i class="fab fa-github"></i>&nbsp;View the source code on GitHub</a>

# What's next

~~I am looking to migrate from .NET framework to .NET standard. I will also provide documentation on GitHub. I have also started a resolver for integration tests so will update when that is finished.~~

I have migrated the package to .NET Standard 1.6. Additional documentation is also available on [GitHub][github]. I have also created a `BasicResolver` class for integration tests which is also documented on GitHub.

[petabridge-testing-children]: https://petabridge.com/blog/how-to-unit-test-akkadotnet-actors-akka-testkit/#how-do-i-test-a-parentchild-relationship

{:target="\_BLANK"}

[github]: https://github.com/connelhooley/AkkaTestingHelpers

{:target="\_BLANK"}

[petabridge-testing-black-hole]: https://petabridge.com/blog/how-to-unit-test-akkadotnet-actors-akka-testkit/#example

{:target="\_BLANK"}

[actor-hierarchy]: {{"/assets/images/introducing-akka-testing-helpers-di/actor-hierarchy.png" | absolute_url }}

[actor-hierarchy-testing-d]: {{"/assets/images/introducing-akka-testing-helpers-di/actor-hierarchy-testing-d.png" | absolute_url }}

[actor-hierarchy-testing-d-mocks]: {{"/assets/images/introducing-akka-testing-helpers-di/actor-hierarchy-testing-d-mocks.png" | absolute_url }}
