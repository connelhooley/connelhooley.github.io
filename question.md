Hi everyone, I'm a webc/11ty newb looking for some help on how to implement a webc component that can either be a button or anchor tag.

I'm currently doing this in Vue using dynamic components:
https://v3.ru.vuejs.org/guide/component-dynamic-async.html#dynamic-components-with-keep-alive

In Zach's blog post he mentions "When creating WebC, I wanted to bring all of the good things from Vue’s single file components to Web Components: HTML-first single file component authoring, class and style attribute merging, webc:is (instead of is to avoid attribute collisions)," so I was hoping webc:is would do this kind of thing.

I can almost achieve it with the following component, but I can't pass a dynamic value to webc:is:

``` html
<!-- Using component -->
<home-button @is="a" href="#hi">

<!-- Component itself -->
<template webc:is="CAN_I_GET_@IS_VALUE_HERE?" webc:root="override" class="all of my button classes">
  
  <slot></slot>
</template>
```

I don't like that approach but it's the closest I can get. This would be a nicer solution imo:

``` html
<!-- Using component -->
<a webc:is="home-button" href="#hi">
```

But the `webc:is` attribute overwrites the host "a" tag.

If anyone has done this before I'd really appreciate the help :)

