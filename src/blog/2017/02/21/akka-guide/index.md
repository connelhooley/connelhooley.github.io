---
title: Akka Guide
time: 21:00:00
description: Full introductory guide to Akka.NET
languages:
  - C#
technologies:
  - Akka.NET
presentation: /akka-guide
---

# Background

Akka is an actor framework. We'll cover what that means [in the next section](#actor-model). [Akka.NET][akka.net] is a .NET port of the Scala [Akka][akka] framework. Akka.NET is an open source project that is actively maintained by the community. [Petabridge][petabridge] is one of the main contributors. This guide starts off by describing the actor model, and then goes onto to give some examples of how Akka.NET implements the actor model.

This guide only covers the basics of the actor model and Akka.NET. Basic knowledge of C# is assumed.

# Actor Model

The actor model is a way of structuring an application. Instead of classes calling each other directly, they communicate via **messages** via a framework. Classes that communicate in this manner are called **Actors**. A common analogy is that your application is a factory, your actors are your staff and messages are jobs that need doing.

| Things you can do with actors                                | How this relates to traditional C#                                                                                                                                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actors talk to each other by sending messages to each other. | Think of an actor as a function and the message as its parameters. When an actor sends a message to another actor, think of this as one function calling another. |
| An actor can also send its self a message.                   | Think of this as a function calling itself recursively.                                                                                                           |

Actors only ever process one message at a time. They have a message inbox/queue that they store messages in until they are ready to process their next message. Actors can only talk to other actors via the sending of messages. When processing a message an actor can modify its own internal private state, but not the state of other actors.

The creation of actors and the sending of messages is done via a framework. There are lots of actor model frameworks, Akka is just one of them.

The actor model gives the following benefits:

- Actors are **thread safe**. Due to only processing one message at a time)
- Actors are **asynchronous**. Sending a message to another actor does not block the thread.
- Actors live in a hierarchy which is great for **error handling**. We'll cover that [in the next section](#actor-hierarchy).
- The actor model promotes **scalable** and more loosely coupled systems. Since actors only communicate via messages it is easy to spin up lots of actors to do more work as and when they're needed.

## Actor Hierarchy

One of the best features of the actor model is the actor hierarchy. An actor can create other actors. All actors like within the _Actor System_. When an actor creates another actor the newly created actor is the _child_ actor and the actor that created it is the _parent_ actor. This results in the application having a tree-like structure as follows:

![Actor hierarchy][actor-hierarchy]

When an actor throws an unhandled exception the parent actor must decide what to do. It has three options:

- Restart all its child actors
- Just restart the failing child actor
- Escalate the error to its parent actor, who in turn has to the same three options.

| Things you can do with actors                                        | How this relates to traditional C#                    |
| -------------------------------------------------------------------- | ----------------------------------------------------- |
| Actors restart their child actors when an unhandled exception occurs | This is used instead of traditional try-catch blocks. |

Actors should always delegate "dangerous" work it child actors.

## Actor References

You never instantiate an actor directly, you only ever hold a reference to it.

![Actor ref][actor-ref]

All actor references are the same regardless of which actor it points to. You can send an actor reference a message and the framework then ensures it reaches the correct actor's queue/inbox. This ensures that:

- You cannot access or modify the internal state of that actor.
- The only way to interact with that actor is to send it a message.

These are two of the most important rules of the actor model and actor references ensure that these rules are always followed.

Actor references are also updated when an actor fails. If a parent restarts an actor the actor reference is still valid and the framework simply sends messages to the new restarted instance.

![Actor ref new instance][actor-ref-new]

# Akka.NET

Now it's time to see how Akka.NET allows us to use the actor model in C#.

## Actor System

If actors are created by other actors how do you create your first actor? Akka.NET has an object called the [ActorSystem][akka-system]. The system is an object you only create once per application. It is your entry point into Akka. The system can create actors. Since these actors do not have a parent actor they are referred to as _root_ actors.

When creating a system, you must give it a name. It is possible to have actors on two different systems talk to each other over a network. The name is then used for routing purposes. Until you require such functionality don't worry about what name you give to your system.

Below is an example of a console application that starts an actor system and then shuts it down when `CTRL + C` is pressed. You will need install the Akka NuGet package. Run the following command in the Package Manager Console `Install-Package Akka`.

```csharp
using System;
using Akka.Actor;

namespace AkkaExamples
{
    internal class Program
    {
        private static ActorSystem _system;

        private static void Main(string[] args)
        {
            _system = ActorSystem.Create("example-name");
            Console.CancelKeyPress += (sender, eventArgs) =>
            {
                eventArgs.Cancel = true; // Cancelling the event prevents the process terminating too early
                _system.Terminate();
            };
            _system.WhenTerminated.Wait();
        }
    }
}
```

Notice we don't use the system's constructor. This is a running theme throughout the Akka framework. Most Akka classes have a "Create" instantiation method.

If you run this code you will see a warning stating the "NewtonSoftJsonSerializer has been detected as a default serializer". This warning is nothing to worry about.

## Instantiating Actors

Instantiating an actor in Akka can be done in one of two places:

- In the ActorSystem (for creating _root_ actors)
- Inside Actors (for creating _child_ actors)

To create an actor you need to use the [ActorOf][akka-actor-of] method. This method is available in both the ActorSystem and inside actors themselves. The ActorOf method takes a [Props][akka-props] object and a name for the actor.

The actor name is used for routing as mentioned [previously](#actor-system). Unlike the ActorSystem however, the name is optional for Actors. If you do not provide one, Akka will assign it a GUID as a name at runtime. It is recommended to give your actors a meaningful and descriptive name. It is also worth mentioning that an actor cannot have two children with the same name.

The Props object takes a C# expression in its create method. Akka uses this expression when it starts an Actor. It also uses to it to create new instances when restarting failed actors, hence why it takes an expression and not just an instance of the actor you're instantiating.

| Things you can do with actors                       | How this relates to traditional C#                      |
| --------------------------------------------------- | ------------------------------------------------------- |
| Actors create other actors by creating Prop objects | This used instead of classes "newing" up other classes. |

The below example instantiates a root actor of a type we haven't created yet called "ExampleRootActor".

```csharp
using System;
using Akka.Actor;

namespace AkkaExamples
{
    internal class Program
    {
        private static ActorSystem _system;

        private static void Main(string[] args)
        {
            _system = ActorSystem.Create("example-name");
            Console.CancelKeyPress += (sender, eventArgs) =>
            {
                eventArgs.Cancel = true;
                _system.Terminate();
            };

            //Create root actor
            IActorRef rootActor = _system.ActorOf(Props.Create(() => new ExampleRootActor()), "example-root-actor-name");

            _system.WhenTerminated.Wait();
        }
    }
}
```

Note how the result of the ActorOf method is not the actor type we created. It is an [IActorRef][akka-actor-ref]. As discussed previously the actor reference hides any of the ExampleRootActor's internal state (regardless of whether it is public or private) and the only way to interact with the newly created root actor is to send it messages.

## Sending Messages to Actors

Firstly we need to create a message object. Messages are:

- Simple [POCO][poco] classes
- Immutable
- Serialisable
- Small (if you need to send a very large object between two actors, send a unique identifier such as the object's database ID instead of the large object itself)

Below is an example of a simple message called "ExampleMessage".

```csharp
namespace AkkaExamples
{
    public class ExampleMessage
    {
        public ExampleMessage(string exampleData)
        {
            ExampleData = exampleData;
        }

        public string ExampleData { get; }
    }
}
```

Using constructor injection with public getters is the standard way of creating an immutable message.

Now we can use our actor ref to send the message to our root actor. We do this using the [tell][akka-tell] method.

```csharp
...

IActorRef rootActor = _system.ActorOf(Props.Create(() => new ExampleRootActor()), "example-root-actor-name");

// Send message to root actor via actor ref
rootActor.Tell(new ExampleMessage("Example message information"));

...
```

The Tell method is "fire and forget". It does not block the thread or wait for a response.

## Writing your own Actors

To create your own actor you need to create a C# class and inherit from one of the Akka [actor base][akka-actor-base] classes. The [ReceiveActor][akka-receive-actor] class is the best general purpose base actor that should fulfil your needs the majority of the time.

There are extensions to the Akka framework whereby you must inherit from different base classes when you want to use them. For example if you want your actors to persist their state in a database, you can use the [Akka.Persistence][akka-persistent-actors-docs] extension. To use this extension, you must inherit from the [PersistentActor][akka-persistent-actor] base class in the actors where you want such functionality. This guide will only focus on creating standard actors with the before mentioned ReceiveActor base class.

When creating a receive actor you must configure the actor inside its constructor by telling it what function to call when it receives a certain type of object as a message. Below is an example.

```csharp
using System;
using Akka.Actor;

namespace AkkaExamples
{
    public class ExampleRootActor : ReceiveActor
    {
        public ExampleRootActor()
        {
            // Run the following lambda when a message of the type ExampleMessage is sent to this actor
            Receive<ExampleMessage>(m => Console.WriteLine(m.ExampleData));
        }

        public class ExampleMessage
        {
            public string ExampleData { get; }

            public ExampleMessage(string exampleData)
            {
                ExampleData = exampleData;
            }
        }
    }
}
```

You use the [Receive][akka-receive] method inherited from the ReceiveActor base class to assign a lambda that is to be ran whenever a message of a particular type is received by the actor. For the remainder of this guide we will refer to these lambdas as _receive callbacks_. Unfortunately, you cannot use C# method groups in the Receive method call due to some of the overloads on the Receive method.

Actors simply ignore messages that they do not have a receive callback registered for.

If a class matches the type of two receive callbacks (e.g. if there are two receive callbacks for the same type or for if a type matches two callbacks through inheritance) then only the callback that is registered first is called.

## Creating Child Actors

To create a child actor from inside an actor you use the [Actor Context][akka-context] object. When an actor is created inside the actor system, Akka initialises certain properties on the actor. This is another reason why we create Props objects to create actors rather than just newing them up. The context is one of those properties that is populated for us by the framework.

The Context exposes the same ActorOf method we saw in the ActorSystem [previously](#instantiating-actors). Below is an example of creating a child actor we haven't written yet called "ExampleChildActor" and then sending it a message.

```csharp
using Akka.Actor;

namespace AkkaExamples
{
    public class ExampleRootActor : ReceiveActor
    {
        private readonly IActorRef _exampleActorRef;

        public ExampleRootActor()
        {
            // Create child actor
            _exampleActorRef = Context.ActorOf(Props.Create(() => new ExampleChildActor()), "example-child-actor");
            // send child actor a message
            _exampleActorRef.Tell(new ExampleMessage("Example message information"));
        }
    }
}
```

## Sending Messages to the Parent Actor

You can use the [Parent][akka-context-parent] property on an actor's context object to obtain an actor ref to its parent (the actor that created it). You can then use this to send messages to the parent actor. Below is an example where we send a message called "ExampleSuccessMessage" to the actor's parent.

```csharp
using System;
using Akka.Actor;

namespace AkkaExamples
{
    public class ExampleChildActor : ReceiveActor
    {
        public ExampleChildActor()
        {
            Receive<ExampleMessage>(m => {
                // Process message
                Console.WriteLine(exampleMessage.ExampleData);

                // Send a new message to parent actor
                Context.Parent.Tell(new ExampleSuccessMessage());
            });
        }

        public class ExampleSuccessMessage { }
    }
}
```

## Sending Messages to the Current Actor

Just as you can send messages to the parent, you can also send messages to the current actor that is processing the message. This is called sending messages to _Self_. Below is an example where we send a message of the type "ExampleSelfMessage" to the current actor when we receive a message of the type "ExampleMessage".

```csharp
using System;
using Akka.Actor;

namespace AkkaExamples
{
    public class ExampleSelfTellActor : ReceiveActor
    {
        public ExampleSelfTellActor()
        {
            Receive<ExampleMessage>(m => ReceiveExampleMessage(m));
            Receive<ExampleSelfMessage>(m => ReceiveExampleSelfMessage(m));
        }

        private void ReceiveExampleMessage(ExampleMessage exampleMessage)
        {
            // Process message
            Console.WriteLine(exampleMessage.ExampleData);

            // Send a new message to self
            Self.Tell(new ExampleSelfMessage());
        }

        private void ReceiveExampleSelfMessage(ExampleSelfMessage exampleSelfMessage)
        {
            // TODO Process message sent to self here
        }

        public class ExampleMessage
        {
            public ExampleMessage(string exampleData)
            {
                ExampleData = exampleData;
            }

            public string ExampleData { get; }
        }

        private class ExampleSelfMessage { }
    }
}
```

One of the more common reasons for doing this is that doing so uses the actor's message queue/inbox. When you send a message to yourself the message is put at the back of the message queue meaning the actor can get through some of the other messages in the queue before dealing with the message you just sent to yourself. Actors do not differentiate between messages sent from other actors or themselves.

I tend to nest message classes inside the actor class that predominantly uses them. This makes it clear where the message is used most. This also allows you to make the message class private when the message type is only sent to and from the actor itself, therefore preventing it from being used in other actors. If a message is used by multiple actors then I place them in their own namespace.

## Replying to Messages

Just as you can send messages to the parent actor and yourself, you can also send messages to the actor that sent you the message you're currently processing. This is called _replying_ to a message. In the example below we send a message of the type "ExampleReplyMessage" back to any actors that send us a message of the type "ExampleMessage".

```csharp
using System;
using Akka.Actor;

namespace AkkaExamples
{
    public class ExampleReplyActor : ReceiveActor
    {
        public ExampleReplyActor()
        {
            Receive<ExampleMessage>(m => {
                // Process message
                Console.WriteLine(exampleMessage.ExampleData);

                // Send a new message to the actor that the sent current message to this actor
                Context.Sender.Tell(new ExampleReplyMessage());
            });
        }

        public class ExampleMessage
        {
            public ExampleMessage(string exampleData)
            {
                ExampleData = exampleData;
            }

            public string ExampleData { get; }
        }

        public class ExampleReplyMessage { }
    }
}
```

## Receiving Replied Messages

If when sending a message to an actor, you expect a reply back, you can use the [Ask][akka-ask] method. This simply returns a C# Task that resolves when the target actor replies with a message of the desired type. It essentially allows you to request a message from the target actor and await a response, a bit like a HTTP request/response. In the example below we:

- Create a child actor in the constructor
- Set up a receive callback that:
  - Sends the child actor an ExampleRequestMessage
  - Blocks the thread until the child actor replies with an ExampleResponseMessage

```csharp
using System;
using System.Threading.Tasks;
using Akka.Actor;

namespace AkkaExamples
{
    public class ExampleAskActor : ReceiveActor
    {
        private readonly IActorRef _exampleReplyActorRef;

        public ExampleAskActor()
        {
            ReceiveAsync<Start>(ReceiveStartAsync);
            _exampleReplyActorRef = Context.ActorOf(Props.Create(() => new ExampleReplyActor()), "example-reply-actor-name");
        }

        private async Task ReceiveStartAsync(Start start)
        {
            ExampleReplyActor.ExampleResponseMessage result = await _exampleReplyActorRef.Ask<ExampleReplyActor.ExampleResponseMessage>(new ExampleReplyActor.ExampleRequestMessage("Hello, World"));

            // The following will print "Successfully replying to message: Hello, World"
            Console.WriteLine(result.ExampleData);
        }

        public class Start { }
    }
}
```

Notice that it is possible to use async receive callbacks using the [ReceiveAsync][akka-receive-async] method. This is required to await the Task returned from the Ask method. Due to having different overloads compared to the synchronous Receive method, you can use method groups with the ReceiveAsync method.

Also note that you don't have to use the Ask method to receive messages that are a reply. You can also treat them just like any other message and simply receive them as normal, as described [previously](#writing-your-own-akka-actors).

## Behaviours

An actor can reallocate its receive callbacks at run time. When an actor changes the callbacks it is currently using, it is said to be _switching behaviours_. To switch behaviours you use the [Become][akka-become] method. Below is an example.

```csharp
using Akka.Actor;

namespace AkkaExamples
{
    public class ExampleBehaviourActor : ReceiveActor
    {
        public ExampleBehaviourActor()
        {
            Become(Starting);
        }

        private void Starting()
        {
            Receive<ExampleMessageType1>(m => {
                //TODO Do something with first message type that would make actor ready for second message type
                Become(Started);
            });
        }

        private void Started()
        {
            Receive<ExampleMessageType2>(m => {
                //TODO Do something with second message type
            });
        }

        public class ExampleMessageType1 { }

        public class ExampleMessageType2 { }
    }
}
```

The above example has two states: Starting and Started. The actor becomes _Starting_ when it is constructed. In this behaviour the actor only processes messages of the type "ExampleMessageType1". When the actor receives a message of the type "ExampleMessageType1" it becomes _Started_. In this behaviour the actor only processes messages of the type "ExampleMessageType2".

This results in an actor that :

- Must receive a message of the type "ExampleMessageType1" before it will process messages of the type "ExampleMessageType2".
- Will ignore all messages of type "ExampleMessageType1" apart from the first one it receives.

It is important to note that receive callbacks from previous behaviours are not carried over to new behaviours.

## Stashing Messages

Stashing is often used in conjunction with [behaviours](#behaviours). It allows you to store messages temporarily in memory until you're ready to process them. To implement stashing in your actor you must implement the [IWithUnboundedStash][akka-unbounded-stash] interface. The interface itself simply contains a public property for an [IStash][akka-stash] object. Akka then watches for actors that implement this interface when it creates them in the ActorOf method. If it sees an Actor that implements the interface it populates the IStash property for you.

To achieve _stashing_ we use two methods on the Stash property:

- The [Stash][akka-stash-stash] method places the current message that is being processed in the Stash.
- The [UnstashAll][akka-stash-unstash-all] method places all the messages currently in the stash at the beginning of the actor's message inbox/queue. Below is an example.

```csharp
using Akka.Actor;

namespace AkkaExamples
{
    public class ExampleStashActor : ReceiveActor, IWithUnboundedStash
    {
        public IStash Stash { get; set; } // Property to implement IWithUnboundedStash

        public ExampleStashActor()
        {
            Become(Starting);
        }

        private void Starting()
        {
            Receive<ExampleMessageType1>(m => {
                //TODO Do something with first message type that would make actor ready for second message type
                Become(Started);
            });
            Receive<ExampleMessageType2>(m => Stash.Stash()); // Stash ExampleMessageType2 while starting
        }

        private void Started()
        {
            Receive<ExampleMessageType2>(m => {
                //TODO: do something with second message type
            });
            Stash.UnstashAll(); // Unstash stashed messages when started
        }

        public class ExampleMessageType1 { }

        public class ExampleMessageType2 { }
    }
}
```

The above example results in an actor that stores all messages of the type "ExampleMessageType2" in its stash until it receives a message of the type "ExampleMessageType1" whereby it unstashes all of the previously stashed messages. The messages are then processed in the same order as to which they were sent. It is important to note that unstashed messages get put at the front of the queue. Petabridge explains this really well in their bootcamp [here][akka-unstashing].

## Using Async Functions in Akka

If you want to use a C# async function in your actor, but don't want to block the thread like [ReceiveAsync][akka-receive-async] does, then you can _pipe_ a task's result into a message that is sent to an actor.

This is done using the [PipeTo][akka-pipe-to] method. PipeTo is an extension method on the Task object. This means you can use it on pretty much all async functions in C#. It allows you to send the result of a task to an actor.

This is the most common and recommended way of using async functions in Akka. In-fact, ReceiveAsync is a relatively new feature in Akka - and before that - piping was the only way to use async functions in Akka. Below is an example:

```csharp
using System;
using System.Threading.Tasks;
using Akka.Actor;

namespace AkkaExamples
{
    public class ExamplePipeToActor : ReceiveActor
    {
        public ExamplePipeToActor(IThingyDoer thingyDoer)
        {
            Receive<ExampleRequestMessage>(m => {
                thingyDoer
                    .DoAsync(request.ExampleData)
                    .ContinueWith(
                        task => new ExampleResponseMessage(task.Result),
                        TaskContinuationOptions.ExecuteSynchronously)
                    .PipeTo(Self);
            });
            Receive<ExampleResponseMessage>(m => {
                Console.WriteLine(response.ExampleData);
            });
        }

        public class ExampleRequestMessage
        {
            public ExampleRequestMessage(string exampleData)
            {
                ExampleData = exampleData;
            }

            public string ExampleData { get; }
        }

        private class ExampleResponseMessage
        {
            public ExampleResponseMessage(string exampleData)
            {
                ExampleData = exampleData;
            }

            public string ExampleData { get; }
        }
    }
}
```

In the above example, we call an async function when we receive an ExampleRequestMessage. We use ContinueWith to map the task's completed result to a message type. We then use the PipeTo function to _pipe_ the message to ourselves. Doing this does not block the thread and simply places an immutable message in our inbox when the task completes.

One import thing to note is that the [context][akka-context] property is only valid when an actor is processing a message. If you try and access the context in an async callback then an exception is thrown. This is because the async callbacks are ran later on and the actor could be in the middle of processing a different message by then. If you need to access the context in any of your async callbacks, close over them so you don't need to use the context in your callbacks. There is a great blog post about async in Akka that covers this and more by Petabridge that you can find [here][akka-async].

## Bells & Whistles

Below is an example that covers everything we have covered so far (and one thing we haven't) in one actor:

```csharp
using System.Net.Http;
using Akka.Actor;

namespace AkkaExamples
{
    public class DownloadActor : ReceiveActor, IWithUnboundedStash
    {
        private HttpClient _client;

        public DownloadActor()
        {
            Become(Idle);
        }

        public IStash Stash { get; set; }

        protected override void PreStart()
        {
            _client = new HttpClient();
            base.PreStart();
        }

        protected override void PostStop()
        {
            _client.Dispose();
            base.PostStop();
        }

        private void Idle()
        {
            Receive<Download>(start =>
            {
                _client
                    .GetAsync(start.Url)
                    .PipeTo(
                        Self,
                        Self,
                        httpRes => new DownloadComplete(httpRes.Content),
                        exception => new DownloadFailure());
                Become(Downloading);
            });
        }

        private void Downloading()
        {
            ReceiveAsync<DownloadComplete>(async download =>
            {
                string content = await download.Content.ReadAsStringAsync();
                Context.Parent.Tell(new DownloadResult(content));
                Stash.UnstashAll();
                Become(Idle);
            });
            Receive<DownloadFailure>(failure =>
            {
                Context.Parent.Tell(failure);
                Stash.UnstashAll();
                Become(Idle);
            });
            Receive<Download>(start => Stash.Stash());
        }

        public class Download
        {
            public string Url { get; }

            public Download(string url)
            {
                Url = url;
            }
        }

        private class DownloadComplete
        {
            public HttpContent Content { get; }

            public DownloadComplete(HttpContent content)
            {
                Content = content;
            }
        }

        public class DownloadResult
        {
            public string Content { get; }

            public DownloadResult(string content)
            {
                Content = content;
            }
        }

        public class DownloadFailure { }
    }
}
```

The thing we haven't covered yet is _actor life cycle hooks_. This example uses them to create and dispose of a HTTP client when the actor is started and stopped. You can find out more about the actor life cycle in Akka [here][akka-life-cycle].

The above example:

- Stashes requests to download something when it is already in the middle of downloading something. It then goes back to the stashed messages when it is finished.
- Pipes the result of DownloadAsync to itself so the thread isn't blocked while it downloads.
- Uses ReceiveAsync and awaits ReadAsStringAsync rather than using piping. This keeps the code cleaner and piping messages around for something that should not take long can be overkill.
- Sends the parent actor a message when the download has succeeded or failed.
- Uses the overloaded version of [PipeTo][akka-pipe-to-2] that returns a different message when the task fails to complete.

## Documentation

The main sources of documentation and information for Akka.NET are:

- [The official docs][akka-docs]
- [The official API reference][akka-api-docs]
- [Petabridge blog][petabridge-blog]

When searching for Akka information online, ensure you always add "net" onto your searches otherwise you'll most probably get results that refer to the Scala version.

[akka]: http://akka.io/

[akka.net]: http://getakka.net/

[akka-api-docs]: http://api.getakka.net/docs/stable/html/5590F8C9.htm

[akka-docs]: http://getakka.net/docs/

[petabridge]: https://petabridge.com/

[petabridge-blog]: https://petabridge.com/blog/

[akka-system]: http://api.getakka.net/docs/stable/html/B0425D96.htm

[akka-actor-of]: http://api.getakka.net/docs/stable/html/C622B6E1.htm

[akka-props]: http://api.getakka.net/docs/stable/html/CA4B795B.htm

[akka-actor-ref]: http://api.getakka.net/docs/stable/html/56C46846.htm

[poco]: https://en.wikipedia.org/wiki/Plain_old_CLR_object

[akka-tell]: http://api.getakka.net/docs/stable/html/D0008D9.htm

[akka-actor-base]: http://api.getakka.net/docs/stable/html/DD956C95.htm

[akka-receive-actor]: http://api.getakka.net/docs/stable/html/B124B2AF.htm

[akka-persistent-actors-docs]: http://getakka.net/docs/persistence/persistent-actors

[akka-persistent-actor]: http://api.getakka.net/docs/stable/html/B124B2AF.htm

[akka-receive]: http://api.getakka.net/docs/stable/html/5C8C7532.htm

[akka-context]: http://api.getakka.net/docs/stable/html/CD4308E5.htm

[akka-context-parent]: http://api.getakka.net/docs/stable/html/88D6E91E.htm

[akka-ask]: http://api.getakka.net/docs/stable/html/88D6E91E.htm

[akka-receive-async]: http://api.getakka.net/docs/stable/html/6A92E9E6.htm

[akka-become]: http://api.getakka.net/docs/stable/html/2F03E8DE.htm

[akka-unbounded-stash]: http://api.getakka.net/docs/stable/html/B13D7126.htm

[akka-stash]: http://api.getakka.net/docs/stable/html/83B3E7F5.htm

[akka-stash-stash]: http://api.getakka.net/docs/stable/html/5227A101.htm

[akka-stash-unstash-all]: http://api.getakka.net/docs/stable/html/804DA779.htm

[akka-unstashing]: https://github.com/petabridge/akka-bootcamp/blob/master/src/Unit-2/lesson5/README.md#unstashing-the-entire-stash-at-once

[akka-life-cycle]: http://getakka.net/docs/Actor%20lifecycle

[akka-pipe-to]: http://api.getakka.net/docs/stable/html/29094973.htm

[akka-pipe-to-2]: http://api.getakka.net/docs/stable/html/6BE66425.htm

[akka-async]: https://petabridge.com/blog/akkadotnet-async-actors-using-pipeto/

[actor-hierarchy]: actor-hierarchy.png

[actor-ref]: actor-ref.png

[actor-ref-new]: actor-ref-new.png
