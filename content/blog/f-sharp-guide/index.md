---
title: A C# Developer's Guide to F#
date: 2017-04-10 13:00:00
description: A brief introduction to F# from the point of view of a C# developer. This guide aims to get stuck straight into F# without too much functional theory.
languages:
  - F#
  - C#
---

# Introduction

There is a lot of information on the web regarding functional programming and F#, but I think very few articles are aimed at "modern" C# developers that use [Linq][linq] everyday and that are familiar with the [Action][action] and [Func][func] types.

In this guide we will walk through some of the basic aspects of writing code in F# from the point of view of a C# developer who is already familiar with some aspects of functional programming.

# Why F#?

_This section is purely my opinion so feel free to [skip it](#projects) and get stuck straight into F#._

Functional programming has been gaining more and more traction in recent years. The chances are if you're reading this article you're already well aware of this. You only have to look at the features that have been arriving in C# in recent years to see that almost all of them were available (or had alternatives) in F# first.

C# 7:

- Pattern matching (very basic)
- Tuples
- Deconstruction
- Local functions

C# 6:

- Import of static type members into namespace
- Exception filters

C# is becoming more and more functional with every release, but to me it feels like its being built upon a foundation that was never designed to be this functional. There are numerous features baked into the C# language that simply makes functional programming more difficult:

- Lack of true type inference
- Lack of immutability
- The void return type
- Statements instead of expressions
- Reliance on interfaces, inheritance and polymorphism

In my opinion, C#'s rapid evolution to become more functional will eventually lead fragmentation in the C# world. It's quite foreseeable to imagine a scenario where a project is written in an entirely functional manner in C# (using new future C# features). When a new developer (who is not accustomed to this way of working) joins the team, then that developer could find the code base difficult to understand and then and start writing traditional OO code. There is absolutely nothing wrong with OOP, but if all the code is written in one way and then other parts are written in another quite different way, then the reasonability and consistency of the code is affected.

F# offers a clean line in the sand between OO and functional. When working on an F# codebase you know the project you are working on is going to be written in a mostly functional manner. It is perfectly fine to write OO code in F# too, but its not the default way of doing things, so you're less likely to revert back to that way of thinking unless it suites the problem you're trying solve.

# Projects

Let's start off by looking at how to create an F# project in Visual Studio:

![Screenshot of Visual Studio when creating an F# solution][new-solution]

There is one important difference between F# and C# projects you should know about. The order of the files in the solution explorer is not alphabetical in F# projects, it is actually in the order in which they are compiled. If file B uses a function in file A, then file B must be below file A.

![Screenshot of Visual Studio solution explorer for an F# solution][solution-explorer]

Notice that because A was created after B, A is in-fact under B (not in alphabetical order). If B wants to use anything in A then you have to move it up the list, this is done via the context menu or by pressing `ALT + Up/Down` when it is selected in the explorer.

![Screenshot of Visual Studio project item context menu for an F# solution][project-item-context-menu]

This caught me out for quite a long time when I created my first F# project, as Visual Studio just tells you that the thing you are trying to use is not declared yet. This may sound really horrible but in my experience it has never caused me an issue once I realised what was going on.

Another important thing to note is that there are no folders in F# projects, when needed, code is segregated using projects in a solution.

`EDIT:` F# _does_ have support for folders in the language itself, but adding folders is currently unavailable from Visual Studio. The latest preview version of VS2017 (version 26412.01, you can find it [here][vs-2017-preview]) claims that it includes the ability in F# to "Move Up/Move Down on Solution folder nodes". I have tried this preview version and there is still no visible and obvious way to create folders in a project. I have also tried using the "add existing item" context menu option after creating a folder with an F# file inside it, but VS copies the file to the project folder. F# projects do not have a "show all files" button so that's not an option either.

There is also an extension for VS2015 that gives you extra F# features called [Visual F# Power Tools][power-tools]. This extension does have support for folders as described [here][power-tools-folders]. It must be noted however that even the makers of this extension disable folder support by default and state: "Because there are known issues with F# Project System in Visual F# Tools, folder organization may not work 100% correctly in all cases". The extension itself is also now deprecated, as stated on its [GitHub page][power-tools-github]: "This project is deprecated. All the functionality is being ported to Visual F# Tools, Visual Studio 2017 only".

So, whilst it is true that the F# language does have support for folders, the F# tooling in Visual Studio does not - yet. It is probably possible to have folders in other development environments (like [Ionide][ionide]) but since this article is aimed at existing C# developers, I won't be covering that here. I would personally avoid them anyway, as it just adds another layer of complexity to the ordering of files.

# Modules

Before you can write your first function you need a container to put them in. In F# functions are put into _modules_. Think of modules as static classes. The only difference between modules and static classes is that you can import a module into your current file just like you would a namespace.

This leaves you with a two tier mechanism for organising code in F#: namespaces and modules.

| Container | What can go in there                                                         |
| --------- | ---------------------------------------------------------------------------- |
| Module    | Functions, Values (value type or complex type), Modules, Classes, Interfaces |
| Namespace | Modules, Classes, Interfaces                                                 |

Namespaces are the top level tier and modules are the lower level tier.

As mentioned previously, modules can be imported into a file in the exact same way a namespace can in F#. So, for example if you have:

- A function called parse in a module called Maths.
- And Maths was in a namespace called Helpers.
- Then to use the function you can import "Helpers.Maths" into your file and use the parse function.

To add a module to an F# project use the "New Item..." context menu option, just as you would to add a class to a C# project. Somewhat confusingly there are two F# identical options in the dialogue box that appears:

![Screenshot of Visual Studio dialogue for adding a new F# file][add-new-file]

Use the first one (the second one is a Xamarin Android file).

Unfortunately if you're a ReSharper user you'll notice that they haven't included any F# templates in the "New from Template" menu yet.

# Functions

Now we know what to put our function inside of, we are now ready to write our own function. Below is a simple add function put inside in a module and a namespace:

```fsharp
namespace Helpers

module Maths =
    let add num1 num2 =
        num1 + num2
```

Lets go through this one line at a time:

`namespace Helpers` puts everything that is in this file into a namespace called _Helpers_.

`module Maths =` creates a module called _Maths_. Here we see one of the biggest differences between C# and F#. F# is **whitespace sensitive**. Notice everything inside the module is indented. Due to this there is no need for semi-colons or curly braces.

`let add num1 num2 =` declares a function. To declare any variable in F# the **let** keyword is used. F# values are **immutable** so using var (short for variable of course) does not make much sense. The next strange thing you will have noticed with this line is that there appears to be three values to the left of the equals sign. It is in-fact a single function. The first value is the name of the function (called _add_), the second value is the first parameter to the function ( called _num1_) and the third value is the second parameter to the function (called _num2_).

`num1 + num2` is the body of the function (notice how it is indented so the compiler knows it is part of the function declaration on the line above). There is no **return** keyword in the function body. This is because all functions in F# are single statement **expressions**. The C# equivalent to this is when you have a single statement lambda (the ones without curly braces). When you do this in C# you do not have to use the return keyword and it is the same here in F#.

Now we know our way around a function in F# we can take a look at the program file that is created for us by default in F# console projects.

```fsharp
[<EntryPoint>]
let main argv =
    printfn "%A" argv
    0 // return an integer exit code
```

`[<EntryPoint>]` is an F# attribute. The syntax is slightly different to C# where you only have the square brackets. This attribute is required for the main method in F#. The entry point in F# is important for two reasons:

- Firstly it is the only file that does not need to be in a module or namespace
- Secondly it must be the last file to be compiled. This means it has to be at the bottom of the project in the solution explorer.

`let main argv =` is a function declaration that takes in the command line arguments as its only parameter.

`printfn "%A" argv` writes the command line arguments to the console. `printfn` is much like Console.WriteLine combined with String.Format. Don't worry too much what _%A_ means for now, just know that it prints out a type's values. You can find more about the formatting tokens available in the printfn function [here][printfn]. We can also see the syntax for calling a function in F# on this line. Much like function declarations, parameters are separated by spaces with no need for commas and parenthesis. This line is almost equivalent to `Console.WriteLine(String.Format("{0}", argv))`.

`0` - the last line looks kind of strange but what is does is it returns 0 to the operating system to indicate the system terminated without an error. Much like you do when using the `Environment.Exit` method.

Functions can contain their own nested functions. This tends to be how you scope functions in F#, as opposed to making methods public, private or protected like in C#.

```fsharp
let printSignedIn username  =
    let print m =
        Console.WriteLine(DateTime.Now.ToShortDateString() + " " + m)
    print "Welcome"
    print ("You have successfully as " + username)
```

In the example above, the inner `print` function is only available inside the `printSignedIn` function. Indentation is again used to denote the contents of the inner function.

# Type Inference

The add function in the previous section takes in two integers, adds them together and then returns the result. Not once in that function however, do we mention the int primitive type (or any other type for that matter). This is due to a powerful feature in F# called type inference. C# of course has its own type inference. For example the `var` keyword in C# _infers_ the type being assigned to a variable. F#'s type inference on the other hand, is much more advanced.

The compiler will take a look at how the values are used in a function and then determine what the parameters and return type of the function should be.

Sometimes the compiler won't be able to infer the types. When this happens you must use **type annotations**. For example if a function takes in a list and calls the Linq extension method called Any on it, the compiler will not be able to deduce the type. Take the following example:

```fsharp
let anyItems items =
    items.Any()
```

The example above will not compile and will result in the following error:

> Lookup on object of indeterminate type based on information prior to this program point. **A type annotation may be needed** prior to this program point to constrain the type of the object. This may allow the lookup to be resolved.

Type annotations are when you tell the compiler what the type of a parameter or return value is, just like you do in C# already. The following example uses a type annotation:

```fsharp
open System.Linq
let anyItems (items: seq<string>) =
   items.Any()
```

In the example above we have _imported_ the System.Linq namespace. In F# the keyword to import a namespace or module is `open` instead of `using` like in C#.

Type annotations have two parts to their syntax:

- Firstly wrap the parameter in parenthesis
- Then place a colon inside the parenthesis
  - To the left of the colon is the name of the parameter
  - To the right of the colon is the type of the parameter

This is the other way round to C# where the type comes before the name.

You're also probably wondering what the `seq` type is. Seq is an alias for IEnumerable. It is short for sequence. I'm not quite sure why it is needed, but it sure is a lot easier to type than IEnumerable! We briefly cover collections [later](#collection-types).

Member methods (especially extension methods on generic types) usually break type inference. In F# you tend to stick to having lots of static functions in modules that take in a type and then return a modified instance of it when it is finished. Following this pattern results in far fewer type annotations and cleaner code. We'll see this in action later when we cover [piping](#pipe-operator).

# Generics

Sometimes it doesn't actually matter what the types of a function's parameters or return value is. For example take the following F# code:

```fsharp
let returnSecondParameter param1 param2 =
    param2
```

Now, I know this function is pretty useless but it demonstrates a particularly important aspect of F#. Since the compiler infers the types of the function's parameters and return type do not matter, this function is compiled as a generic function. The equivalent C# code would be:

```csharp
public TParam2 ReturnSecondParameter<TParam1, TParam2>(TParam1 param1, TParam2 param2) =>
    param2;
```

The big difference here being, in C# you have to go out of your way to _opt in_ to making a function generic. In F# however, you have to _opt out_ to make the function non-generic by using type annotations. Leaving it generic is usually for the best, as if the function doesn't need to be non-generic, why not open it up so it can be used with any type?

# Equality

In F# you only use a single equals sign for a comparison (as opposed to the double equals you will find in C#). Since values are immutable by default in F#, it is much more common to compare two values than to assign a new value to an existing value.

```fsharp
let isSumEven num1 num2 =
    let sum = num1 + num2
    sum % 2 = 0
```

In the above example:

- `let isSumEven num1 num2 =` assigns the following function to the add identifier
- `let sum = num1 + num2` assigns num1 + num1 to the sum identifier
- `sum % 2 = 0` compares if sum is equal

| When the equals symbol is used                         | What is does                                       |
| ------------------------------------------------------ | -------------------------------------------------- |
| Immediately after the let keyword and an identifier    | Assigns the following expression to the identifier |
| Immediately after the module keyword and an identifier | Assigns the indented code below to the module      |
| In any other expression                                | Compares two values                                |

It is also worth noting that the `<>` operator is used to say not equal to, unlike C# where is is `!=`.

# Mutability

F# values are immutable by default. Once you assign a value to an identifier in F#, you cannot modify it. In functional programming this is usually the desired behaviour for a number of reasons.

- It makes **concurrency** easier. It prevents a thread from changing another thread's objects.
- Makes code more **reasonable**. If values cannot be modified, code becomes much easier to read and follow, since you don't need to keep track of changes that are made to objects. If a function takes in an object you know that the function doesn't modify it.
- It becomes easier to make **fluent APIs** that read really well.

There are scenarios however, where you need an object to be mutable. One of these could be for performance reasons. If you have an array with a million items, you may not want to recreate an array of 999,999 items just remove one. You can make an object mutable in F# by using the `mutable` keyword:

```fsharp
let mutableValue () =
    let mutable x = 5
    x <- 10
    x
```

The above example creates a mutable value called x. It then uses the `<-` operator to assign a new value to it. It then returns the new value (10). The left arrow is used because a single equals sign is used for comparisons whenever you are not using the let or module keywords.

You should only make an object mutable when you have a really good reason for doing so, as immutability is one the corner stones of functional programming.

# Tuples

If you're keeping up to date with C# 7, then you will be aware of what tuples are. If you haven't though, tuples are ordered groups of values. If you have a list of integers you can have 0 to N integers. Tuples allow you to create an object that contains a finite amount of different types. For example you could create a tuple that contains an integer then a string and then another integer.

One of the main uses for tuples is that they allow you to return multiple values from a function without having to create a small POCO class to contain them.

In F# tuples are written using parenthesis with the items inside separated by commas. Below is an example of a function that returns a tuple that contains an integer and then a string:

```fsharp
let addTen num =
    (num+10, "The original value was " + num)
```

The example above returns the value with ten added to it in the tuple's first item, and a string containing the value in the tuple's second item.

Tuples can also be unpacked or _deconstructed_ when they are assigned to. Below is an example of how tuples are assigned to:

```fsharp
let result, message = addTen 20
```

In the above example, _result_ contains the integer in the first item of the tuple and _message_ contains the string in the second item of the tuple. Unpacking tuples is optional. You can always unpack the tuple later. This is demonstrated in the following example:

```fsharp
let resultAndMessage = addTen 20
let result, message = resultAndMessage
```

As you can see, using tuples is a very convenient way of returning multiple values from a function without having to create a small type and then extracting the values out of it. They also have another purpose in F# which we will cover [later](#currying).

# Unit

As mentioned previously, all functions in F# are expressions. Functions that return void cannot be used in expressions. As an example, you cannot use functions that return void in ternary expressions in C#. To demonstrate this point, the following C# code will not compile:

```csharp
class Program
{
    static void Main(string[] args)
    {
        args.Length > 0
            ? Console.WriteLine("hello")
            : Console.WriteLine("world");
    }
}
```

This is because expressions must have a return type. F# has a special type called **unit**. Unit is an empty value. You cannot do anything with the unit type, but since it is an actual value (unlike void which is the absence of a value) you can use it in expressions. Any methods that return void in C#, such as `Thread.Sleep` and `Console.WriteLine`, return unit when used in F#.

Unit is expressed in F# by using two brackets next to each other like this: `()`. It could be described as an empty tuple. Below is an example of an entirely pointless function that takes in unit and returns unit.

```fsharp
let returnUnit () =
    ()
```

If you want to disregard the returned value of a function and return unit instead, F# has a function called `ignore` that does this for you. For example `Console.ReadLine` returns a string but if we want our function to return unit, we can use the ignore function to _ignore_ the string returned from the ReadLine method and return unit instead.

```fsharp
let waitUntilEnter () =
   ignore (Console.ReadLine())
```

The waitUntilEnter function above returns the empty unit type rather than the string returned by the ReadLine method.

# Records

Records are immutable POCO classes that offer value based equality for free (as opposed to the reference based equality you get by default in C#). Below is an example of a record declaration:

```fsharp
type Person = {
    name: string
    age: int
}
```

To instantiate a record the following syntax is used:

```fsharp
let person = {
    name = "Connel"
    age = 26
}
```

The F# compiler infers the type for us. It looks through all the available types for any types that have both the "name" and "age" properties. Since there is only one, the compiler can successfully infer the type of this object to that of a _Person_ type. This is an example of how F# type inference is head and shoulders above C#'s.

If you have two records with the same properties then you can use type annotations to tell the compiler which one to use, although this is very rare. If you have two records with the exact same properties you should probably merge them. Since a record is a class it can be placed inside a namespace or module.

One of the best features of records is how they are compared. For example take the following F# code:

```fsharp
open System

type Person = {
    name: string
    age: int
}

[<EntryPoint>]
let main argv =
    let person1 = { name = "Connel"; age = 26 }
    let person2 = { name = "Hooley"; age = 26 }
    let person3 = { name = "Connel"; age = 26 }
    let isPerson1Person2 = person1 = person2
    let isPerson1Person3 = person1 = person3
    Console.WriteLine(isPerson1Person2) // prints false
    Console.WriteLine(isPerson1Person3) // prints true
    Console.WriteLine("Press enter to exit")
    let value = Console.ReadLine()
    0 // return an integer exit code
```

In the example above we have a main method that creates 3 Person records. The first and second Person records have a different name, whereas the first and third records have the same properties. Notice how comparing person1 and person3 results in "True" being printed. This is because records check for equality by comparing **all** of their properties. It does not perform a reference comparison like C# does. This is really useful for **unit testing**. It means we do not have to waste our time writing `Equals` implementations to actual perform a valid comparison. The majority of the time we only care if the values in an object are equal and not the reference.

Other things to note:

- If a record contains another record then the comparison "crawls" down the object, it is not a shallow comparison. If a record contains a list, then every item in the list is compared to ensure that the lists contain the same items. This can result in a performance drop so be mindful of this when checking if two complex records are equal.
- The new keyword is never required in F#.
- A semi-colon is used in the previous example to create a record on one line.

# If Expression

F# does not have a ternary operator, since everything is already an expression in F#. The F# equivalent to the C# ternary operator is the if expression. When using an if expression, all the branches of the expression must return the same type. For example:

```ocaml
module Helpers =
    let isConnel x =
        if x = "Connel" then
            "The value is Connel"
        else
            "The value is not Connel"
```

Like everything in F#, the if expression is whitespace sensitive so there is no need for curly braces or semi colons. The other main difference compared to C# is that there is no need to parenthesis around the condition and there is an additional _then_ keyword required.

Both parts of the expression above returns a string. If the else branch returned a boolean for example, the code would not compile.

# Let Expression

In C# it is not possible to declare variables in expressions. To combat this, F# has the let expression. We've seen the let expression in action quite a few times already but it is worth exploring how it works. The let expression works by binding the result of an expression to an identifier that can be used in the next expression.

> let [identifier] = [binding_expression] [usage_expression]

You can think of the let expression to be syntactical sugar for the following function in C#:

```csharp
public static void Bind<T>(Func<T> bindingExpression, Action<T> usageExpression)
{
    usageExpression(bindingExpression());
}
```

Therefore this F# code:

```fsharp
let a = 5
let b = a * 2
let c = a + b
Console.WriteLine(c);
```

Equates to this C# code:

```csharp
Bind(() => 5, a => // assign value of 5 to a
{
    Bind(() => a * 2, b => // assign value of a * 2 to b
    {
        Bind(() => a + b, c => // assign of a + b to c
        {
            Console.WriteLine(c);
        });
    });
});
```

# Function Signatures

In C# method signatures look like this (see [here][so-c-sharp-signature] for why I've included the return type if you're curious):

> int Add(int, int)

Or, if you wanted to take in a method that followed this notation as a parameter, you would need to take in an object of the type:

> Func<int, int, int>

F# has its own notation for a method's signature. The add function above has the following signature in F#:

> int -> int -> int

This F# signature appears to closely resemble the corresponding `Func` type in C#. The item on the far right is the return type, and the items to its left are the values you need to put in to get that return type out.

One F#'s nice features is that a function's signature is also its type, it isn't two different things like in C#.

Asterisks are used to denote tuples. The following example is the signature of a function that takes in an integer and returns a tuple with an integer as its first item and a string as its second item.

> int -> int \* string

Take the following F# function:

```fsharp
let doubleWhenTrue num predicate =
    if(predicate(num)) then
        num*2
    else
        num
```

The example above is a function that takes in another function as a parameter. The notion/type for this function is:

> int -> (int -> bool) -> int

Parenthesis are used to indicate the nested function that is a parameter. Parenthesis are also used to indicate a function that is returned. Take the following F# function:

```fsharp
let add num1 num2 =
    let sum = num1 + num2
    let returnFunction num =
        sum + num
    returnFunction
```

The example above is a function takes in two integers, adds them together and then returns another function that takes in another int and adds it to the sum of the previous two integers and returns the result. The notion/type for this function is:

int -> int -> (int -> int)

Please note that you would never usually write a function like that and would instead use [currying](#currying).

# Currying

One of the powerful features of F# that differentiates it from C# is its built-in currying. Currying is when you split a single function of N parameters into N separate functions. For example, if you take the following C# function type:

> Func<int, int, int, int>

Calling a function of this type would look like this: `int sum = addThreeNumbers(1,2,3);`

If you were to **curry** it, you would end up with a function of the following function type:

> Func<int, Func<int, Func<int, int\>\>\>

Calling this function would look like this: `int sum addThreeNumbersCurried(1)(2)(3);`

This generic function type is pretty confusing and long, and this is a major reason why F# (and functional programming in general) leans heavily on type inference.

In F# all functions are curried by default. For example take the following F# function:

```fsharp
let addTwoNumbers num1 num2 =
    num1 + num2
```

The above function takes in two parameters and adds them together. In F# you can actually call this function with just one parameter. Since the function is curried it returns a function that takes in a single integer and returns an integer.

```fsharp
let addTen = addTwoNumbers 10
let twelve = addTen 2
let fifteen = addTen 5
```

Calling a function without all of its parameters is called a **partial function application**. Due to F#'s built in currying, it is not possible to overload a function in F#. For example the following interface is perfectly valid in C#:

```csharp
public interface IMathsHelpers
{
    int Add(int num1);
    int Add(int num1, int num2);
}
```

In C#, the compiler knows that if you only provide one integer then it should call the first method and if you provide two then it should call the second method. In F# however, the compiler would not know whether you wanted to call the first method or **partially apply** the second method.

If you want to prevent a function from being partially applied, you can group together the inputs in a tuple. Since a tuple is a single value you must give all of the items inside the tuple at the same time. For example take the following F# method:

```fsharp
let addTwoNumbersTuple (num1, num2)=
    num1 + num2
```

This function takes a single tuple as its only parameter, instead of taking two separate integer values. The signature of this function is:

> int \* int -> int

As you can see there is only one arrow in the function type signature. An arrow indicates where a function type can be partially applied. The following would not compile as you need to provide the entire tuple: `let addFive = addTwoNumbersTuple 5`

Method overloads from C# types are still available in F#. Any function created outside of F# in .NET is exposed to an F# project as a function that has a single tuple as its input. This means you cannot partially apply a function created outside of F#. For example String.Format has the following overloaded signatures:

![Screenshot of String.Format overloads in an F# project][string-format-overloads]

Partially applying functions can also be used as a form of dependency management. Take the following C# example:

```csharp
public interface IBookingSystem
{
    bool IsRoomAvailable(int hotelId, DateTime dateTime);
    string GetBooking(int hotelId, DateTime dateTime);
}

public interface IEmailer
{
    bool EmailBooking(string emailAddress, string bookingId);
}

public class Hotel
{
    private readonly IBookingSystem _bookingSystem;
    private readonly IEmailer _emailer;
    private readonly int _hotelId;

    public Hotel(IBookingSystem bookingSystem, IEmailer emailer, int hotelId)
    {
        _bookingSystem = bookingSystem;
        _emailer = emailer;
        _hotelId = hotelId;
    }

    public bool BookRoom(string emailAddress, DateTime dateTime)
    {
        if (_bookingSystem.IsRoomAvailable(_hotelId, dateTime))
        {
            string bookingId = _bookingSystem.GetBooking(_hotelId, dateTime);
            _emailer.EmailBooking(emailAddress, bookingId);
            return true;
        }
        else
        {
            return false;
        }
    }
}
```

The hotel class takes in three dependencies in its constructor. It then takes in another two items in the book room method. In F# this would become one function like this:

```fsharp
module Hotel

open System

let bookRoom
    (isRoomAvailable: int->DateTime->bool)
    (getBooking: int->DateTime->string)
    (emailBooking:string->string->unit)
    (hotelId: int)
    (emailAddress: string)
    (dateTime: DateTime) =
        if isRoomAvailable hotelId dateTime then
            let bookingId = getBooking hotelId dateTime
            emailBooking emailAddress bookingId
            true
        else
            false
```

I've added type annotations to the function's parameters so you can see their types, although they aren't necessary and could be removed to make it easier to read. Instead of injecting interfaces into a class's constructor, you pass in any dependant functions as the function's first parameters. This means you can partially apply the function like so:

```fsharp
let createBooking = Hotel.bookRoom BookingSystem.isRoomAvailable BookingSystem.getBooking Email.emailBooking 5
```

In the line above, we call the `Hotel.bookRoom` function and only provide 4 out of its 6 parameters. This leaves us with a function with the following signature:

> string -> DateTime -> bool

The `BookRoom` method on the `Hotel` class in the C# code has the same signature. Partially applying functions results in code that is still perfectly testable. When testing the `Hotel.bookRoom` function, we can pass in any fake implementation for any of its dependencies. For example if we want to test what happens in our `Hotel.bookRoom` function when `isRoomAvailable` returns false, we can just pass in a function that always returns false.

This means we get fully unit testable code without the following overheads:

- Creating an interface for every class, just so it can be mocked
- No need for mocking frameworks at all
- No need for IOC frameworks to bind interfaces to their concrete implementations

# Lambdas

Obviously F# has support for lambdas. If a function takes in another function as a parameter, then you can pass in a lambda, rather than using a let expression to create a function and then passing that in.

```fsharp
let doubleWhenTrue num predicate =
    if(predicate(num)) then
        num*2
    else
        num
let x = doubleWhenTrue 5 (fun i -> i % 2 = 0)
```

The lambda above is `(fun i -> i % 2 = 0)`. Lambdas:

- Are wrapped in parenthesis
- Start with the `fun` keyword
- Use a skinny arrow, rather than the fat arrow like in C#

# Discriminated Unions

In C#, if you want a function to take in one of several types you can use polymorphism or method overloads. As we have just covered, method overloads are not available to F# functions and records and tuples do not support inheritance. In F# discriminated unions tend to be used instead. A discriminated union type is like an enum of types. An instance of a discriminated union can be any _one_ of the types in the enum. Below is an example of a discriminated union:

```fsharp
type State =
| Error of Exception
| Info of string
| Warning of int * string
```

An instance of the State type above can be an Error, Info or Warning. These identifiers are called **union cases**. In the above example the Error union case is an exception, the Info union case is a string, and the Warning union case is a tuple that contains an integer and a string. The following three functions all return the same `State` type.

```fsharp
let createError () = Error(Exception(""))
let createInfo () = Info("Example info text here")
let createWarning () = Warning(9, "Example warning text here")
```

As you can see each union case has its own constructor that you must put the values into for that union case. Union cases can also be empty. When used like this they are much like an enum:

```fsharp
type State =
 | Error
 | Info
 | Warning
```

```fsharp
let createError () = Error
let createInfo () = Info
let createWarning () = Warning
```

Whereas inheritance in C# offers the flexibility of a tree like structure, where objects inherit properties from their parents, discriminated unions offer a more flat structure, where objects do not share properties from their parent.

Discriminated unions are combined with [pattern matching](#match-expression-pattern-matching) to form the most common way of managing flow control in F# applications.

# Match Expression (Pattern Matching)

The match expression and pattern matching are massive topics in their own right, and I will only be scratching the surface here. The match expression can be thought of as a more powerful switch statement. Below is an example of a match expression:

```fsharp
type State =
    | Error of Exception
    | Info of string
    | Warning of int * string

let getStateMessage state =
    match state with
    | Error(ex) -> "Error message: " + ex.Message
    | Info(message) -> "Info message: " + message
    | Warning(num, message) -> "Warning message: " + message
```

The function above takes in a `State` discriminated union and then performs pattern matching on it:

- If the state is an Error union case, it runs the following expression `"Error message: " + ex.Message`
- If the state is an Info union case, it runs the following expression `"Info message: " + message`
- If the state is a Warning union case, it runs the following expression `"Warning message: " + message`

Just like the if expression, the match expression must return the same type from all of its branches. For the example above, all three branches in the match expression must return a string. If one of them tried to return an integer the code would not compile.

A match expression unpacks or _deconstructs_ the union cases it matches on. If you look at the error branch `Error(ex) -> "Error message: " + ex.Message` you can see that the expression that is ran has access to the exception inside the Error union case.

Match expressions should be **exhaustive**. This means that no matter what value of a particular type is given to the expression, there should always be a branch that matches on that value. The match statement can perform pattern matching against any type, not just discriminated unions, as shown in the following example:

```fsharp
let matchNumbers x =
    match x with
    | 9 -> "I was given 9"
```

The function above takes in an integer and performs pattern matching on it. If x matches the value of 9 then a string is returned. If the integer is not 9 however, a runtime exception will be thrown. This is because the match expression is not **exhaustive**. The above function actually generates a compile time warning:

> Incomplete pattern matches on this expression. For example, the value '0' may indicate a case not covered by the pattern(s).

The compiler even gives you an example of a value that does not match! Match expressions have a concept similar to the `default` statement found in C# `switch` statements. The underscore wild-card in F# matches against any object. The following example is exhaustive:

```fsharp
let matchNumbers x =
    match x with
    | 9 -> "I was given 9"
    | _ -> "I was not given 9"
```

You can also use a conditional expression to match against a certain type when a certain condition is true. The following example demonstrates this:

```fsharp
let processAge age =
    match age with
    | age when age < 18 -> "Child: " + age
    | age when age > 65 -> "OAP:" + age
    | age -> "Adult: " + age
```

As you can see, the `when` keyword can be used to add a condition to a branch. For example `age when age < 18` only matches when age is below 18. This example also demonstrates how to have a branch that matches any value, whilst still using that value in the branch's expression. When you match with the underscore wild-card, you cannot access the value that is matched against in the expression to the right of the arrow. To match against any value simply give the value a name. This branch `age -> "Adult: " + age` matches against any integer and gives it the name _age_. Age is then available in the expression to the right of the arrow.

Since match is an expression and therefore returns a value, it would not make sense for match expression branches to _fall through_ to other matched expressions. The only expression that is ran is the first one that matches, therefore the order of the branches is important. This is why F# does not have an equivalent of the `break` keyword found in C#'s `switch` statements.

# Exceptions

Exceptions in F# are like discriminated unions with a single union case. Below is an example of an F# exception type, whose contents is a tuple that contains a string in its first item, and a record in its second item.

```fsharp
exception InvalidPerson of string * Person
```

To throw an exception the `raise` keyword is used.

```fsharp
exception InvalidName of string
exception InvalidAge of int

let validate person =
    if person.name <> "Connel" then
        raise(InvalidName(person.name))
    else if person.age < 18 then
        raise(InvalidAge(person.age))
    else
        person
```

The raise keyword can also throw .NET exceptions created outside of F#:

```fsharp
let validate person =
    if person.name <> "Connel" && person.age < 18 then
        raise(InvalidOperationException())
```

# Try Expression

The try expression is used in F# to catch thrown exceptions. It has a very similar syntax to the match expression:

```fsharp
exception InvalidName of string
exception InvalidAge of int

let validate person =
    if person.name <> "Connel" then
        raise(InvalidName(person.name))
    else if person.age < 18 then
        raise(InvalidAge(person.age))

let print person =
    try
        validate person
        Console.WriteLine("Person is valid")
    with
    | InvalidName(name) -> Console.WriteLine("Person is not named connel, person is named" + name)
    | InvalidAge(age) -> Console.WriteLine("Person is under 18, person is " + age.ToString() + " years old")
```

Pattern matching does not work as nicely with exceptions created outside of F#. To match none F# exceptions you have to use the `:?` operator, which checks the type of an object. It is the F# equivalent of the `is` keyword in C#.

```fsharp
let divide num1 num2 =
    try
        (num1 / num2)
    with
    | :? DivideByZeroException -> 0
```

# Collection Types

F# has three main collection types.

`Seq` is an alias of IEnumerable. Therefore they are lazy loaded. To create a seq you must use a syntax we haven't seen before. You must type _seq_, followed by curly braces, then inside the curly braces write an expression that returns a sequence.

```ocaml
let numbersSeq = seq {
    yield 1
    yield 2
    yield 3
    yield 4
    yield 5
}
```

You can only use the _yield_ keyword when inside the curly braces of a seq expression. When using IEnumerables in C#, you very rarely create them yourselves and instead use helper methods like `IEnumerable.Range`. In F# this is no different.

```fsharp
let doubleNumber i = i* 2
let numbersSeq = Seq.init 5 doubleNumber
```

The example above creates a sequence that is five numbers long and produces a sequence of numbers where the five numbers are doubled.

`List` is an eagerly loaded linked list. It is not the same as the C# List type. To create a list use squared brackets:

```fsharp
let numbersList = [1; 2; 3; 4; 5]
```

If you want the list to be written over one line then use semi-colons as a delimiter (like above) otherwise you can use a new line instead.

`Array` is the same as a traditional C# array. It has the exact same syntax as an F# list, just with an extra pipe (\|) character:

```fsharp
let numbersArray = [|1; 2; 3; 4; 5|]
```

All three of these types also have corresponding modules that expose functions that you can use on these types. A lot of these functions offer the same functionality as the Linq extension methods in C#, but some of them have different names. Below is a table comparing some of the names:

| F# function | Corresponding C# Linq function |
| ----------- | ------------------------------ |
| map         | Select                         |
| filter      | Where                          |
| collect     | SelectMany                     |
| fold        | Aggregate                      |
| find        | First                          |

The following F# code:

```fsharp
let items = [1;2;3;4;5]
let doubledItems = List.map (fun i -> i*2) items
let evenItems = List.filter (fun i -> i%2 = 0) doubledItems
```

Equates to the following C# code:

```csharp
var items = new [] { 1, 2, 3, 4, 5};
var doubledItems = items.Select(i => i*2);
var evenItems = doubledItems.Where(i => i%2 == 0);
```

# Pipe Operator

In C#, fluent APIs are becoming more and more popular. Fluent APIs read really well as you can chain method calls together without needing to declare several local variables. They are also appealing as they read left to right, so they read much more like an actual language. In C# extension methods and the [builder pattern][builder-pattern] have become the ways in which fluent APIs tend to be implemented. The problem with the builder pattern approach is that you have to spend the time to design and write a lot of additional code. This additional code then needs to be tested. Extension methods (like those found in Linq) also require you to write your code in a particular way.

F# however allows you write fluent APIs with almost no effort at all. All you have to do is make sure the subject of the function is the last parameter, you can then use the pipe operator to chain method calls together. The pipe operator is typed as `|>`. It is very simple in what it does. The pipe operator is simply the following function:

```fsharp
let (|>) x f = f x
```

It takes an item and a function that takes in that item. All it does, is it puts the parameter before the function. So `String.IsNullOrEmpty "Connel"` becomes `"Connel" |> String.IsNullOrEmpty`. Just swapping the order of the items immediately makes the function read left to right, more like and actual language. When you use the pipe operator with partially applied functions, the result is a fluent API:

```fsharp
let filterList items =
    items
    |> Seq.map (fun i -> i*2)
    |> Seq.filter (fun i -> i%2 = 0)
```

The example above takes in a sequence. It then pipes that sequence into the mapping function. `Seq.map` is the F# equivalent of the `Select` extension method in Linq. It takes two parameters, the first is a function that should be performed on each item in the sequence, and the second is the sequence itself. When we call `Seq.map (fun i -> i*2)` we do not supply the sequence as a final parameter. This results in a partially applied function, that only takes in a sequence, which is the exact signature we need for our pipe operator to work. This is why functions in F# take their "main" parameter last, rather than first as it is seen in C#.

# Option Type

F# types cannot be null. The following example will not compile:

```fsharp
type Person = {
    name: string
    age: int
}
let person1: Person = {
    name = "Connel"
    age = 26
}
let person2: Person = null
```

The above example uses let expressions with type annotations. This means that we provide the type and it is not inferred by the compiler. I used type annotations, as when assigning null to a value, the compiler will obviously not be able to infer the type. Much like how you cannot do `var x = null` in C#. The bottom line in the above example results in the following compiler error:

> The type 'Person' does not have 'null' as a proper value

This gives you peace of mind when using F# values, no more null checks!! But what about when you want to represent the lack of a value? Imagine we had a PersonRepository that has a find function. It will search through a database for a Person record that matches a particular name. But what do you do when a person matching that name cannot be found? In C# you would have 3 options:

- **Throw an exception**. This is how Linq's `First` method works. Exceptions should only be thrown when something _exceptional_ happens, that prevents the application from carrying on. In this example, if you query a database for a name that isn't there, this isn't exactly an _exceptional circumstance_. There could be any number of perfectly good reasons why there are no matches.
- **Return null**. This is how Linq's `FirstOrDefault` method works. Functions that sometimes return null are deemed _dishonest_. Their signature does not fully describe their behaviour. Unless you look up the documentation for FirstOrDefault, it is not clear that it returns null on a no match. It also goes without saying that nulls are evil as they litter you code with null checks and dreaded _object is not set to the reference of an object_ runtime errors.
- **Return a complex type that contains a success boolean** property and a property for the the actual result. This is how the `Regex.Match` function works. This results in the additional overhead of creating wrapper object and instead of lots of null checks, you have lots of _is success_ checks. There is also something "hacky" about having a property that is only populated when the success boolean is true. If you forget to check the success boolean you could still get null reference exception.

F# has a different mechanism for representing an object that may or may not have a value, called the **Option** type. It is simply a discriminated union that represents either **Some** value or the **None** value. The following example matches a regex expression.

```fsharp
module RegexHelpers
    open System.Text.RegularExpressions

    let regexMatch pattern input =
        match Regex.Match(input, pattern) with
        | regexMatch when regexMatch.Success -> Some(regexMatch.Value)
        | _ -> None
```

The signature of the function above is:

> string -> string -> string option

`string option` is just another way of writing `option<string>`. Instead of throwing an exception or null, we return a discriminated union that could be either a value or an empty value. You can then immediately see how to consume this function, purely from its signature. The function that then consumes this value, can use pattern matching to either extract the result from the Some union case, or do something with the None union case.

```fsharp
open System
open System.Text.RegularExpressions

let regexMatch pattern input =
    match Regex.Match(input, pattern) with
    | regexMatch when regexMatch.Success -> Some(regexMatch.Value)
    | _ -> None

let getAge input =
    match regexMatch @"\d+" input with
    | Some(value) -> value
    | None -> "Age is unknown"

let connelAge = getAge "Connel 26"
let bobAge = getAge "Bob N/A"
```

In the above example connelAge equals "26" and bob equals "Age is unknown". Consuming the option type forces us to cater for both a successful match and an unsuccessful match. The only way to get the inner value of a discriminated union is to pattern match and if we don't have an exhaustive match expression, the compiler tells us off. It is impossible to access the value inside the option type when it is not there, so it is impossible to get a runtime exception by accessing it accidentally.

[linq]: https://msdn.microsoft.com/en-us/library/bb397947.aspx#Anchor_0

[action]: https://msdn.microsoft.com/en-us/library/018hxwa8(v=vs.110).aspx

[func]: https://msdn.microsoft.com/en-us/library/bb549151(v=vs.110).aspx

[printfn]: https://msdn.microsoft.com/en-us/visualfsharpdocs/conceptual/core.printf-module-%5Bfsharp%5D#remarks

[so-c-sharp-signature]: http://stackoverflow.com/a/8808773/310098

[builder-pattern]: http://blogs.tedneward.com/patterns/Builder-CSharp

[vs-2017-preview]: https://www.visualstudio.com/en-us/news/releasenotes/vs2017-preview-relnotes#fsharp

[power-tools]: https://marketplace.visualstudio.com/items?itemName=FSharpSoftwareFoundation.VisualFPowerTools

[power-tools-folders]: https://fsprojects.github.io/VisualFSharpPowerTools/folderorganization.html

[power-tools-github]: https://github.com/fsprojects/VisualFSharpPowerTools

[ionide]: http://ionide.io

[new-solution]: f-sharp-guide/f-sharp-new-solution.png

[solution-explorer]: f-sharp-guide/f-sharp-solution-explorer.png

[project-item-context-menu]: f-sharp-guide/f-sharp-solution-explorer-context-menu.png

[add-new-file]: f-sharp-guide/f-sharp-add-new-file.png

[string-format-overloads]: f-sharp-guide/f-sharp-string-format-overloads.png
