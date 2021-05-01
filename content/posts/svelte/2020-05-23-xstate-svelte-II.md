---
layout: post
title: 'XState and Svelte II: Creating the traffic lights'
date: 2020-05-23
categories: svelte
teaser: xpath-svelte2.png
tags: [xstate]
---

In the [last post][last_post], the [XState][xstate] machine combined with Svelte was explained.
Now, let's check how to prepare a semaphore to show the library capabilities in a nice way.

Let's see a simple way draw a semaphore:
{% highlight html %}

<script>
    export let width = 150;
    export let height = 150;
    export let status = "green";
</script>

<svg {width} {height} viewBox="0 0 120 320">
<rect x="10" y="10"  width="100" height="300" rx="10" ry="10" stroke-width="10" stroke="black" />
<circle r="40" fill={status==="red"?"red":"grey"} cx="60" cy="60" />
<circle r="40" fill={status==="yellow"?"yellow":"grey"} cx="60" cy="160" />
<circle r="40" fill={status==="green"?"lime":"grey"} cx="60" cy="260" />
</svg>
{% endhighlight %}
Basically, `status` can be `green`, `yellow` and `red`. This is what will decide for each light, if it's gray or coloured. The size can be changed too, so we can create as many traffic lights as we want with the needed size.

But this semaphore changed the values too fast. To make it more realistic, the lights should turn off and on with a short transition. This can be done with a [svelte tweened motion][tweened]:

{% highlight html %}

<script>
  import { interpolateLab } from "d3-interpolate";
  import { tweened } from "svelte/motion";
  export let width = 150;
  export let height = 150;
  export let status = "green";

  const colorRed = tweened("rgb(128,128,128)", {
    duration: 200,
    interpolate: interpolateLab
  });

  const colorYellow = tweened("rgb(128,128,128)", {
    duration: 200,
    interpolate: interpolateLab
  });

  const colorGreen = tweened("rgb(128,128,128)", {
    duration: 200,
    interpolate: interpolateLab
  });

  $: switch (status) {
    case "green":
      colorYellow.set("rgb(128,128,128)");
      colorGreen.set("rgb(0, 255, 0)");
      colorRed.set("rgb(128,128,128)");
      break;
    case "yellow":
      colorYellow.set("rgb(255, 255, 0)");
      colorGreen.set("rgb(128,128,128)");
      colorRed.set("rgb(128,128,128)");
      break;
    case "red":
      colorYellow.set("rgb(128,128,128)");
      colorGreen.set("rgb(128,128,128)");
      colorRed.set("rgb(255, 0, 0)");
      break;
  }
</script>

<svg {width} {height} viewBox="0 0 120 320">
<rect x="10" y="10"  width="100" height="300" rx="10" ry="10" stroke-width="10" stroke="black" />
<circle r="40" fill={$colorRed} cx="60" cy="60" />
<circle r="40" fill={$colorYellow} cx="60" cy="160" />
<circle r="40" fill={$colorGreen} cx="60" cy="260" />
</svg>
{% endhighlight %}

- First, define the `tweened` motion for each light. We set the initial value to grey. The interpolation is taken from the d3js library, because it's a nice way to interpolate colors. Any function that does this would work.
- Then, a reactive function is set. Depending on the status, the colors are set as needed. The motion will do its magic, and the colors will change with a short (200ms) animation.

Well, but what about controlling the lights? Now that we can draw the lights, we can create a simple function with the states:

{% highlight html %}

<script>
	import TrafficLight from "./TrafficLight.svelte";
	import TrafficLightAnimated from "./TrafficLightAnimated.svelte";
	let status = "green";

	function handleClick() {
	  switch (status) {
	    case "green":
	      status = "yellow";
	      break;
	    case "yellow":
	      status = "red";
	      break;
	    case "red":
	      status = "green";
	      break;
	    default:
	      throw new Error(`Bad status: ${status}`);
	  }
	}
</script>
<main>
	<button on:click={handleClick}>
		Change
	</button>
	<TrafficLight status={status}/>
	<TrafficLightAnimated status={status}/>
</main>
{% endhighlight %}

Of course, XState could be used as well, we'll se it later.

The result is this one:

<iframe
     src="https://codesandbox.io/embed/traffic-lights-the-lights-ohnru?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:300px; border:0; border-radius: 4px; overflow:hidden;"
     title="traffic-lights-the-lights"
     allow=""
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

The pedestrian lights are similar. The basic difference is that the _yellow state_ is the binking green state:

{% highlight html %}

<script>
   import AmpelmannGrun from "./AmpelmannGrun.svelte";
   import AmpelmannRot from "./AmpelmannRot.svelte";
   export let width = 150;
   export let height = 150;
   export let status = "green";

   $: greenStatus =
     status === "green" ? "on" : status === "yellow" ? "blink" : "off";
   $: redStatus = status === "red" ? "on" : "off";
</script>

<svg {width} {height} viewBox="0 0 120 220">
<rect x="10" y="10"  width="100" height="200" rx="10" ry="10" stroke-width="10" stroke="black" />
<circle r="40" fill="#555555" cx="60" cy="60" />
<g transform="translate(23, 25)">
<AmpelmannRot status={redStatus} width="70" height="70"/>
</g>
<circle r="40" fill="#555555" cx="60" cy="160" />
<g transform="translate(28, 125)">
<AmpelmannGrun status={greenStatus} width="70" height="70"/>
</g>
</svg>
{% endhighlight %}

- Since the SVG is more complicated (source: Wikipedia), the two _Ampelmann_ are included from separete files
- The green light has three states now: `on`, `off` and `blink`. The blink effect is done with svg animations. Check [the original file on the project][codesandbox_2]

The part of the svg to animate is on line 199:

{% highlight html %}
{#if status==="blink"}
<animate attributeName="stop-color" values="{color1}; {colorGrey1}; {color1}" dur="1s" repeatCount="indefinite"></animate>
{/if}
{% endhighlight %}

 <iframe
     src="https://codesandbox.io/embed/traffic-lights-pedestrian-1ky4d?autoresize=1&fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:300px; border:0; border-radius: 4px; overflow:hidden;"
     title="traffic-lights-pedestrian"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

Finally, we can [see how xstate can help to coordinate both lights][codesandbox_3]. Let's look at the _machine_. I've added a _message_ property to each state to understand what are they. There are more than what can seem at first sight:

{% highlight js %}
import { Machine } from "xstate";

export const trafficLightsMachine = Machine({
id: "trafficLights",
initial: "gtrp",
states: {
gtrp: {
on: { NEXT: "ytrp" },
meta: {
message: "Green for traffic, red for pedestrians"
}
},
ytrp: {
on: { NEXT: "rtrp" },
meta: {
message: "Yellow for traffic, red for pedestrians"
}
},
rtrp: {
on: { NEXT: "rtgp" },
meta: {
message: "Red for traffic, red for pedestrians"
}
},
rtgp: {
on: { NEXT: "rtyp" },
meta: {
message: "Red for traffic, green for pedestrians"
}
},
rtyp: {
on: { NEXT: "rtrp2" },
meta: {
message: "Red for traffic, blinking for pedestrians"
}
},
rtrp2: {
on: { NEXT: "gtrp" },
meta: {
message: "Red for traffic, red for pedestrians"
}
}
}
});
{% endhighlight %}

Now, let's see how do we control the lights:

{% highlight html %}

<script>
		import TrafficLight from "./TrafficLight.svelte";
		import PedestrianLights from "./PedestrianLights.svelte";
		import { useMachine } from "./useMachine";
		import { trafficLightsMachine } from "./trafficLightsMachine";

		const { state, send } = useMachine(trafficLightsMachine);
		function handleClick() {
		  send("NEXT");
		}
		$: trafficState =
		  $state.value.indexOf("gt") >= 0
		    ? "green"
		    : $state.value.indexOf("yt") >= 0
		    ? "yellow"
		    : "red";

		$: pedestrianState =
		  $state.value.indexOf("gp") >= 0
		    ? "green"
		    : $state.value.indexOf("yp") >= 0
		    ? "yellow"
		    : "red";
</script>
<main>

    <TrafficLight status={trafficState}/>
    <PedestrianLights height={100} status={pedestrianState}/>
    <div>
    	<div>{#each Object.keys($state.meta) as thing}
    		{$state.meta[thing].message}
    	{/each}
    	</div>
    	<button on:click={handleClick}>
    		Change
    	</button>
    </div>

</main>

<style>
</style>

{% endhighlight %}

- We just have to mainain two reactive statements that read the state. Depending on its value, they set the status for the two different actual traffic lights we have.
- Then, the lights are added as in the previous examples

As you can see, it's really easy to control when the states are well defined

<iframe
     src="https://codesandbox.io/embed/traffic-lights-state-nodes-9w9n6?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:300px; border:0; border-radius: 4px; overflow:hidden;"
     title="traffic-lights-state-nodes"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

# Links

- [XState website][xstate]
- [XState and Svelte I: initial setup][last_post]
- [First example on CodeSandbox][codesandbox_1]
- [Second example on CodeSandbox][codesandbox_2]
- [Third example on CodeSandbox][codesandbox_3]
- [svelte tweened motion][tweened]

[xstate]: https://xstate.js.org/
[last_post]: /svelte/2020/04/08/gpujs-example.html
[codesandbox_1]: https://codesandbox.io/s/traffic-lights-the-lights-ohnru
[codesandbox_2]: https://codesandbox.io/s/traffic-lights-pedestrian-1ky4d?file=/App.svelte
[codesandbox_3]: https://codesandbox.io/s/traffic-lights-state-nodes-9w9n6?file=/App.svelte
[tweened]: https://svelte.dev/tutorial/tweened
