---
layout: ../../layouts/Post.astro
title: "Using Svelte 5 with RxJS"
pubDate: 2024-10-30
teaser: svelte5-rxjs.png
categories: svelte
tags: [RxJS]
thumbnail: /images/svelte/svelte5-rxjs/twitter.png
description: "How to use Svelte 5 RxJS to show real time data"
twitter-card: summary
---

I wanted to write about using RxJS with svelte since long ago. Now I found the moment because svelte 5 is in production, with the new runes.

In this tutorial, I'll reproduce parts of the website [bitmex](https://www.bitmex.com/app/trade/XBTUSD), since trading data is a very nice example for RxJS and my current job, so I can learn a little!

You can find all the code in this repo: https://github.com/rveciana/svelte5-rxjs I made tags for each section, so you can get the same code:

- [Connecting to the data source](https://github.com/rveciana/svelte5-rxjs/tree/9197552032373455d7e92f2f3b0a690079dfabce)
- [Typing, filtering and creating the data state](https://github.com/rveciana/svelte5-rxjs/tree/c0256e2bfe45a4999a345be26d9a2785ee38c221)
- [Representing the data](https://github.com/rveciana/svelte5-rxjs/tree/6ce3e9f58f2b68d322d83ad8fadfcf69f79c9161)

You can check the result here: http://geoexamples.com/svelte5-rxjs/ although it may be updated if I extend the tutorial.

### Initialize the project

So, to start the app, I run

```sh
npx sv create svelte-rxjs
cd svelte-rxjs
npm run dev
```

I chose

- SvelteKit minimal
- Typescript
- vitest, prettier
- npm

### Connecting to the data source v0.1

The information for the websocket connection is here:

https://www.bitmex.com/app/wsAPI

We have to open the socket and send a message with the service and the instrument we want to get the information.

The websocket connection using RxJS can be achieved doing:

ws.ts

```js
import { webSocket } from "rxjs/webSocket";

export const subject$ = webSocket("wss://ws.bitmex.com/realtime");
export const subscribeToCurrency = (symbol: string) =>
  subject$.next({ op: "subscribe", args: [`orderBookL2_25:${symbol}`] });
```

How do we use the observable in a svelte page? From the new Svelte 5 docs:

> Stores are still a good solution when you have complex asynchronous data streams or it’s important to have more manual control over updating values or listening to changes. If you’re familiar with RxJs and want to reuse that knowledge, the $ also comes in handy for you.

Why is this? Because prefixing a store with the $ sign calls the subscribe method (no observable will emit without doing it). This is valid both for svelte stores and RxJS! So essentially, you can use an observable as a store:

+page.svelte

```svelte
<script lang="ts">
	import {  subject$, subscribeToCurrency } from "$lib/ws";

	subscribeToCurrency("XBTUSD")

const test = $derived($subject$)

</script>
<h1>Welcome to SvelteKit + Rxjs</h1>

<p>{JSON.stringify(test)}</p>
```

All our code can run only in the frontend. To avoid server side rendering, tht will fail, just create this file:

+layout.ts

```js
export const ssr = false;
```

And that's the result, a crazy amount of information that is impossible to understand:

<img src="/images/svelte/svelte5-rxjs/data-input.gif"/>

### Typing, filtering and creating the data state v0.2

Now we need to convert this json data into a structure we can work with.

The types, according to the service docs, and if we are subscribing to `orderBookL2_25` should be something like:

```js
type Side = "Buy" | "Sell";
interface Operation {
  op: "subscribe" | "unsubscribe";
  args: string[];
}
interface SuccessMessage {
  success: boolean;
  subscribe: string;
  request: {
    op: "subscribe" | "unsubscribe",
    args: string[],
  };
}

interface BaseData {
  symbol: string;
  id: number;
  side: Side;
}

interface SizedData extends BaseData {
  size: number;
}

interface PricedData extends SizedData {
  price: number;
}
interface TimestampedData extends PricedData {
  timestamp: string;
}

interface OrderBookMessageBase {
  table: "orderBookL2_25";
}
interface PartialDataOrderBookMessage extends OrderBookMessageBase {
  action: "partial";
  data: TimestampedData[];
}

interface UpdateDataOrderBookMessage extends OrderBookMessageBase {
  action: "update";
  data: SizedData[];
}

interface DeleteDataOrderBookMessage extends OrderBookMessageBase {
  action: "delete";
  data: BaseData[];
}

interface InsertDataOrderBookMessage extends OrderBookMessageBase {
  action: "insert";
  data: PricedData[];
}

export type OrderBookMessage =
  | PartialDataOrderBookMessage
  | UpdateDataOrderBookMessage
  | DeleteDataOrderBookMessage
  | InsertDataOrderBookMessage;

export type Message = SuccessMessage | OrderBookMessage | Operation;
```

I created a type for each operation and then joined them, because this way typecript knows that when the operation is `delete`, there will be no price or size properties and we don't have to add optional properties here and there.

When we get a new message, we need keep it only if it's of type `OrderBookMessage`. We can get that using a [type guard function](https://www.typescriptlang.org/docs/handbook/advanced-types.html):

```js
export const isOrderBookMessage = (msg: Message): msg is OrderBookMessage => {
	return (msg as OrderBookMessage).data !== undefined;
};
```

Now, we will create the new observables, but making sure that everything works can be tricky sometimes, and the best way to make sure that everything works is using unit testing.

First of all, make sure to add jsdom so what we can test components and functions that depend on being in a browser like `webSocket`, that won't work using node as vite is configured by default. So the file `vite.config.ts` should look like:

```js
import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
    environment: "jsdom",
  },
});
```

you should install jsdom: `npm install --save-dev jsdom`

Now we are ready to test the type guard function. Create a file named `ws.test.ts`:

```js
import { describe, it, expect } from "vitest";
import { isData, type Message } from "./ws";

describe("Test filter with typeguard", () => {
  it("true if message has data", () => {
    const msg: Message = {
      table: "orderBookL2_25",
      action: "update",
      data: [
        { symbol: "XBTUSD", id: 17999995000, side: "Buy", size: 5, price: 3 },
      ],
    };

    expect(isData(msg)).toBe(true);
  });
  it("false if message doesn't have data", () => {
    const msg: Message = {
      success: true,
      subscribe: "orderBookL2_25:XBTUSD",
      request: { op: "subscribe", args: ["orderBookL2_25:XBTUSD"] },
    };

    expect(isData(msg)).toBe(false);
  });
});
```

Now we are checking that only if the message has the field `data`, the function returns true, so we can filter based on that. I created many other tests to check the functions used by the observables, but won't comment them here to make the tutorial more understandable.

Let's create our new observable:

```js
export interface OrderBookValue {
	side: Side;
	size: number;
	price: number;
}
export interface OrderBook {
	[id: number]: OrderBookValue;
}

export const processMessage = (acc: OrderBook, cur: OrderBookMessage): OrderBook => {
	switch (cur.action) {
		case 'partial':
			return cur.data.reduce(
				(out, ord) => ({ ...out, [ord.id]: { side: ord.side, size: ord.size, price: ord.price } }),
				{}
			);
		case 'insert': {
			let out = acc;
			for (let ord of cur.data) {
				out = { ...out, [ord.id]: { side: ord.side, size: ord.size, price: ord.price } };
			}
			return out;
		}
		case 'update': {
			let out = acc;
			for (let ord of cur.data) {
				out = { ...out, [ord.id]: { ...acc[ord.id], side: ord.side, size: ord.size } };
			}
			return out;
		}
		case 'delete': {
			let out = acc;
			for (let ord of cur.data) {
				const { [ord.id]: _, ...rest } = out;
				out = rest;
			}
			return out;
		}
	}
};

export const data$ = subject$.pipe(
	filter(isOrderBookMessage),
	scan(processMessage, {}),
	startWith({} as OrderBook)
);
```

The main steps of the observable are:

- Filter out the messages that aren't data messages and don't add information (like the initial success message)
- scan will get the current state of the data we have and run the `processMessage`function to add, update or remove the data.
- startWith will make sure that when we read the data, the observable has already emitted an empty object, so we can use it with Svelte as we will see later.

This observable will return an object with the id of the orders as keys and an object with price, size and side as values. Instead of creating a new observable with this to make the rendering easier, we will use the new Svelte 5 runes to do it, because why not?

The page will be now:

```svelte
<script lang="ts">
	import { objectValues } from '$lib/objectUtils';
	import { data$, subscribeToCurrency } from '$lib/ws';

	subscribeToCurrency('XBTUSD');
	const data = $derived(objectValues($data$).sort((a,b)=>b.price - a.price));
</script>

<h1>Welcome to SvelteKit + Rxjs</h1>

<p>{JSON.stringify(data)}</p>
```

- The function `objectValues` is the same as `Object.values`, but maintains the typing.

Now, you almost havell you need to show an order book!

<img src="/images/svelte/svelte5-rxjs/data-input2.gif"/>

Before that, I would like to test the observable, since in a real app, those can get very complex, specially if there are different data inputs that interact. Testing observables is not that straightforward, but a smart colleague did a guide for that: [Unit Testing RxJS Observables – A Practical Guide](https://weareadaptive.com/2024/01/09/unit-testing-rxjs-observables-a-practical-guide/)

Let's test out last observable:

```js
const mockSubject$ = new Subject<Message>();

vi.doMock('./ws', () => {
	return {
		subject$: mockSubject$
	};
});

const { data$ } = await import('./dataObservables');

describe('data$', () => {
	const { latestEmission, error, subscription } = spyOnObservable(data$);

	afterAll(() => {
		subscription.unsubscribe();
	});
	it('should initially emit empty object', () => {
		expect(latestEmission()).toEqual({});
	});
	it('should not error', () => {
		expect(error).not.toBeCalled();
	});
	it('should ignore the success messages', () => {
		mockSubject$.next({
			success: true,
			subscribe: 'orderBookL2_25:XBTUSD',
			request: { op: 'subscribe', args: ['orderBookL2_25:XBTUSD'] }
		});
		expect(latestEmission()).toEqual({});
	});
	it("should add data when it's sent", () => {
		mockSubject$.next(partialData);
		expect(Object.keys(latestEmission() as OrderBook)).toHaveLength(6);
	});
});
```

Note that I moved the `data$` observable to another file, since mocking a part of the file is complicated and didn't really work. If I find how, I will update the post!

### Representing the data v0.3

Now we want to represent the data. I more or less copied the company orderbook from the company. See both in action:

<img src="/images/svelte/svelte5-rxjs/viz.gif" height="250px"/>
<img src="/images/svelte/svelte5-rxjs/viz-original.gif" height="250px"/>

So I dodn't implement the middle prices, that depend on other subscriptions (the docs are quite obscure). Also I didn't add the colored bars at the right, because it required many changes. It's an interesting problem, though.

This is the `+page.svelte` code:

```svelte
<script lang="ts">
	import { objectValues } from '$lib/objectUtils';
	import { data$ } from '$lib/dataObservables';
	import {  subscribeToCurrency } from '$lib/ws';

	subscribeToCurrency('XBTUSD');
	const sell = $derived(objectValues($data$).filter(d=>d.side==="Sell").sort((a,b)=>b.price - a.price)
	.slice(-9).map((d, i, arr)=>{
		const totalSize = arr.slice(i-arr.length).reduce((acc,cur)=>acc+cur.size, 0)
		return {...d, totalSize}}));
	const buy = $derived(objectValues($data$).filter(d=>d.side==="Buy").sort((a,b)=>b.price - a.price).slice(0,9)
	.map((d, i, arr)=>{
		const totalSize = arr.slice(0, i + 1).reduce((acc,cur)=>acc+cur.size, 0)
		return {...d, totalSize}}));

	const nFormat = new Intl.NumberFormat(undefined, {minimumFractionDigits: 2});

</script>
<div class="order-book">
<h1>Order Book</h1>

<div class="order-book-data">
<div>Price</div><div>Size (USD)</div><div>Total (USD)</div>
</div>
<div class="order-book-data alternate-rows">
	{#each sell as item}
		<div class="sell-price">{nFormat.format(item.price)}</div>
		<div class="size">
			{#key item.size}
			<span class="bar {item.size-(item.prevSize??0)>0?"positive":"negative"}" style="width: {100*Math.abs(item.size-(item.prevSize??0))/Math.max(item.size, item.prevSize??1)}%;"></span>
			{/key}
			<div class="value">{item.size}</div>
		</div>
		<div class="total-size">{item.totalSize}</div>
	{/each}
</div>
<div >-----</div>
<div class="order-book-data alternate-rows">

	{#each buy as item}
		<div class="buy-price">{nFormat.format(item.price)}</div>
		<div class="size">
			{#key item.size}
			<span class="bar {item.size-(item.prevSize??0)>0?"positive":"negative"}" style="width: {100*Math.abs(item.size-(item.prevSize??0))/Math.max(item.size, item.prevSize??1)}%;"></span>
			{/key}
			<div class="value">{item.size}</div>
		</div>
		<div class="total-size">{item.totalSize}</div>
	{/each}
</div>
</div>

<style>
:global(body) {
		background-color: #0F1723;
		color: rgb(255, 255, 255);
	}
.order-book {
	font-family: "Inter", "Open Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
	background-color: #111a24;
	max-width: 320px;
	padding: 10px;
}
.order-book-data{
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	width: 300px;

}
 .alternate-rows > div:nth-child(6n + 1),
 .alternate-rows > div:nth-child(6n + 2),
 .alternate-rows > div:nth-child(6n + 3){
		background-color: #ffffff22;
	}
	.sell-price{
		color: rgb(255, 65, 88);
	}
	.buy-price{
		color: rgb(0, 218, 133);
	}

	@keyframes fadeOut {
    0%, 50% {  /* Stay solid for first 50% of animation (0.5s) */
        opacity: 1;
    }
    100% {     /* Then fade to 0 for the remaining 50% */
        opacity: 0;
    }
}

.size{
	position: relative;
}
.size .bar{
	position: absolute;
    right: 2px;
    bottom: 0;
    height: 100%;
    background-color: #0bde5f90;
	z-index: 1;
	animation: fadeOut 0.5s ease-out;
&.positive{
	background-color: #0bde5f90;
}
&.negative{
	background-color: #e00b0b90;
}
}
.size .value {
    position: relative;
    z-index: 2;
}
.total-size{
	text-align: right;
}
</style>
```

The most interesting part, in my opinion, is that we can use the `$derived` rune to process the data received from the observable:

```js
const sell = $derived(
  objectValues($data$)
    .filter((d) => d.side === "Sell")
    .sort((a, b) => b.price - a.price)
    .slice(-9)
    .map((d, i, arr) => {
      const totalSize = arr
        .slice(i - arr.length)
        .reduce((acc, cur) => acc + cur.size, 0);
      return { ...d, totalSize };
    })
);
```

- We want to sort the data by price (see that the orderbook is ordered like that)
- Then we take the last nine elements in the sell case (we want the ones with lower prices)
- Then, we map calculating the total size, the last column. Its value is the sum of all the previous sizes. Since I calculate it here, I can´t store the last value to show the colored bars. I could do it in the observable
- To calculate the previous value for size, I modified the update case in the `processMessage` function.

The styling is quite straight forward. The bar sizes are not exactly what is in the original visualization, I didn't get the way they do it, but it shouldn't be hard. Notice this part:

```svelte
{#key item.size}
    m.size-(item.prevSize??0))/Math.max(item.size, item.prevSize??1)}%;"></span>
{/key}
```

This is to make this aprt to be rerendered again when `item.size` changes. This will make the css to fade out the bars when they are moved but the component is the same.

I also added a throttling to the observable si the changes are a bit slower (100ms, not that slow anyway). Even in the original app, is hard to follow the numbers as they change too fast for my eyes. Probably the traders won't agree, but here is the new observable:

```js
export const data$ = subject$.pipe(
	filter(isOrderBookMessage),
	scan(processMessage, {}),
	throttle((_) => interval(100)),
	startWith({} as OrderBook)
);
```

### Links

- [The repo](https://github.com/rveciana/svelte5-rxjs)
- [Type guard function](https://www.typescriptlang.org/docs/handbook/advanced-types.html)
- [Unit Testing RxJS Observables – A Practical Guide](https://weareadaptive.com/2024/01/09/unit-testing-rxjs-observables-a-practical-guide/)
