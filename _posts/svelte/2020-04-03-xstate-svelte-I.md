---
layout: post
title:  "XState and Svelte I: initial setup"
date:   2020-04-03
categories: svelte
teaser: xpath-svelte1.png
tags: [jekyll]
---

I'm learning [XState][xstate]. Every time I've used redux I find myself getting bugs because the site state becames more and more complex and I don't handle the transitions and possible states properly.

Also, I love Svelte. Doing the stuff I like in D3js with it is always possible, but coding with a framework that allows much more complex apps.

But I didn't find many documentation on using both, so I decided to do this post to show it.

I've using CodeSandbox for all the examples so the result is visible and editable by yourself if you want to. 

Using XState and Svelte
=======================

The first thing to do is using the XState state instead of the regular svelte store.

I started the project copying the standard Svelte template from codesandbox, but if working locally, you could just:

    npx degit sveltejs/template my-svelte-project

and install XState by running
  
    npm install --save xstate

Start the project running

    npm install
    npm run dev

Now we can create one of the simplest state machine taken from the docs, that just toggles between two states:

{% highlight js %}
import { Machine } from "xstate";

export const toggleMachine = Machine(
  {
    id: "toggle",
    initial: "inactive",
    states: {
      inactive: {
        on: { TOGGLE: "active" }
      },
      active: {
        on: { TOGGLE: "inactive" }
      }
    }
  }
);
{% endhighlight %}

As you can see, the initial state would be *inactive* and can be changed to *active* by sending the *TOGGLE* action. Let's see the javascript file that does this:

{% highlight js %}
<script>
  import { useMachine } from "./useMachine";
  import { toggleMachine } from "./toggleMachine";

  const { state, send } = useMachine(toggleMachine);
  function handleClick() {
    send("TOGGLE");
  }
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
</style>

<main>
  <h1>Hello {$state.value}</h1>
  <button on:click={handleClick}>Toggle</button>
</main>
{% endhighlight %}

As all the svelte projects, every component has three parts with the javsascript, the css and the html template. 

* The *useMachine* will be explained later, but gives access to the current state and the function to send actions. When the state changes, the rendered component will change too.  It's as easy as this!
* To render the value, use *{$state.value}*. [The $ indicates that *state* is a store and the value has to be accessed this way][readable store]. 
* *handleClick* sends the action when the button is pressed. ote the *on:click* in the button element

This is the result:

<iframe
     src="https://codesandbox.io/embed/traffic-lights-hello-xstate-zd2yl?fontsize=14&hidenavigation=1&module=%2FApp.svelte&theme=light"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="traffic-lights-hello-xstate"
     allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
     sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
   ></iframe>

Links
=====
[XState website][xstate]
[Accessing a readable store value in Svelte][readable store]

[xstate]: https://xstate.js.org/
[readable store]: https://svelte.dev/docs#4_Prefix_stores_with_$_to_access_their_values