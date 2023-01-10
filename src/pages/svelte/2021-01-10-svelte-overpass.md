---
layout: ../../layouts/Post.astro
title: "Playing with OSM Overpass and Svelte"
pubDate: 2021-01-10
categories: svelte
teaser: overpass-svelte.png
tags: [osm, overpass]
---

It's been quite a long time since I wanted to play with the OVerpass API, so I made an example app. I wanted to do it with Svelte too. Finally, the API options I use are quite simple and most of it is done with canvas, but here's what I learnt!

# The App

You can check the App [here][app]. As you can see in the picture, it shows the nearest bars (and more!) around you, taking the data from the Overpass API. It's a [PWA][pwa], so you can install it as a mobile phone application just by clicking a button.

[<img src="/images/svelte/svelte-overpass/app.gif" width="300"/>][app]

The final code can be found at the [GitHub repo][code_repo].

# Overpass

The [Overpass API][overpass] is a read-only API that server data from the OpenStreetMap project using different query languages. Using it, the whole map for a region could be drawn on the browser (or the backend).

I've used the [Kumi][kumi] site for the data, since it doesn't have limitations and I saw that other sites were using it successfully.

The used query id this one:

    const address = `https://overpass.kumi.systems/api/interpreter?data=[out:json][timeout:25000];node["amenity"="${amenity}"](around:${radius},${lat},${lng});out body;>;out skel qt;`

All the text after the `data=` part is an [Overpass QL query][overpassql]. It's a simple one, and quite easy to understand:

- Output format is set to JSON (it can be XML, CSV, etc)
- A timeout is set (I don't know if this is strictly necessary)
- After the semicolon (that indicates a new statement), the nodes that are of type `amenity=bar` are queried.
  - This could be a path, instead of a node
  - The output is send to the _default set_
  - A filter must be added so we don't download all OSM database! So we only download the data around a radius.
- The final statements set the output format
  - `out body` asks to put all the information to use the data. This is the tags associated to each node in the OSM database (name of the bar, address, website, etc). We will be using the name.
  - `out skel` prints all the data for geometry
  - `qt` sorts by `quadtile`, a geometry index that makes it faster. I took the queries from examples, and removing it doesn't change the result.

There are libraries to convert the data into a GeoJSON, but since we are using points, taking the longitude and latitude is really easy. The format is:

{% highlight json %}
{
"version": 0.6,
"generator": "Overpass API 0.7.56.8 7d656e78",
"osm3s": {
"timestamp_osm_base": "2021-01-09T16:31:03Z",
"copyright": "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL."
},
"elements": [

{
"type": "node",
"id": 1305366218,
"lat": 41.3937290,
"lon": 2.1495210,
"tags": {
"addr:street": "Diagonal",
"amenity": "bar",
"name": "Bar Teo",
"outdoor_seating": "yes",
"toilets:wheelchair": "no",
"wheelchair": "no"
}
},
...
]
}

```

So for each object in `elements` we can find all the information for one of the results. The code to process the data is:

{% highlight js %}
.then(data =>{features = data.elements.map(d=>{
const {easting: dataX, northing: dataY} = fromLatLon(d.lat, d.lon);
const dist = Math.sqrt((dataX - utmX)**2 + (dataY - utmY)**2);
const dir = (180/Math.PI) \* Math.atan2((dataX - utmX)/dist, (dataY - utmY)/dist)
return{name: d.tags.name, lng: d.lon, lat: d.lat, dist, dir}
}).filter(d=> d.name!==undefined).sort((a, b)=> a.dist - b.dist);
})
```

- fromLatLon is a small library that converts from latlon to utm coordinates. This way, we can calculate distances and directions from our current position (see _compass_ section)

# The Svelte App

I created the app using the instructions from the [Svelte TypeScript post][svelte-typescript]. I had to touch a pair of things

- The paths on `index.html` to `bundle.js`, `bundle.css` and so on are by default on the root path. If you don't have a dedicated domain, this will make the app fail when deployed, since _Svelte_ doesn't have a _basepath_ option as _sapper_ (or I didn't find it). Luckily, just making the paths relative works, so:

  &lt;script defer src='/build/bundle.js'&gt;&lt;/script&gt;

becomes

    <script defer src='/build/bundle.js'&gt;&lt;/script>

- I added several tags so _lighthouse_ improves the score. Like `apple-touch-icon`, `Description`, etc. The default template misses several things of this style.

The App.svelte file is quite simple. It has only the canvas element and the selector. All the other stuff is to initialize the PWA and compass, as we will see. The data is drawn in a separate file.

- I struggled a little with the canvas component, because I was setting the size. When doing so, the app got stuck depending on the situation. So the best is creating it like:

    <canvas bind:this={canvas}>

and getting the desired size in a reactive variable like:

    $: canvasSize = Math.min(containerWidth>containerHeight?containerHeight:containerWidth, 500);

This makes the size to be always adjusted to the container shortest size with a max of 500px. To get the container size, the `clientWidth` property can be bound on the container element:

    <main bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>

Svelte is so cool ;)!

# The compass

The nice part of the app is the moving compass. To get it, we need three things:

- Getting the geograpgical coordinates
- Getting the device orientation (the geographical one) and the screen orientation (landscape or portrait)
- Drawing the data

Getting the location is quite standard, just listening to `navigator.geolocation.watchPosition` and calling a callback. The browser will ask for permission.

The orientation seemed easy too, but it's not. I found a [compass example][compass-app] (with an error, always points to the initial device position) but many browsers require special configurations to allow the orientation to be read.

The event to listen to is `window.addEventListener("deviceorientationabsolute", setHeading);` (not a navigator event!?). And it's using a callback too. In this case, an angle has to be added if the device is in landscape mode (and it can have two positions in landscape mode). The screen orientation lives in the `screen` object.

{% highlight js %}

const screenOrientation = (screen?.orientation?.type??"portrait-primary").split("-");

const adjustment = screenOrientation[0] === "portrait" ? 0 : 90;
const adjustment2 = screenOrientation[1] === "secondary" ? adjustment - 180: adjustment;
heading = adjustment2 - ev.alpha;

```

Again, Svelte makes really easy everything. If something in the function arguments change, the function is called. It's like the `useEffect` in react, but better!

    $: drawCompass(canvas, canvasSize, features, heading);

The same hapens to fire the fetch data function. If `amenity`, `lon` or `lat` change, the code is run again.

To draw the data, I separated the code to a function `drawCompass` with its own file `draw-compass.ts`. The funtion uses the typical functions for canvas, so I won't copy all the code here.

# PWA

This web is a clear candidate to become a PWA since it's much better on a mobile device that has orientation sensor. To do it I found a [single example][pwa-example] in Svelte.

The first thing was adding the following line to `public/index.html`:

&lt;link rel='manifest' href='manifest.json'&gt;

And create the `manifest.json` file in the same folder:

{% highlight json %}
{
"background_color": "#ffffff",
"theme_color": "#ffebcd",
"name": "Svelte Overpass",
"short_name": "overpass",
"display": "standalone",
"start_url": "./",
"icons": [
{
"src": "images/svelte-overpass-192.png",
"sizes": "192x192",
"type": "image/png",
"purpose": "any maskable"
},
{
"src": "images/svelte-overpass-512.png",
"sizes": "512x512",
"type": "image/png"
}
],
"splash_pages": null
}
```

Some lines seem unnecessary but if they are not there, the browser won't allow the user to save the app on the desktop.

The next step is adding the service worker. This is also necessary. It must have the `fetch` method, that many times is omitted.

{% highlight js %}

var cacheName = "svelte-overpass-cache-" + Date.now();
var filesToCache = [
"/",
"./index.html",
"./build/bundle.css",
"./build/bundle.js"
];
self.addEventListener("install", function(e) {
e.waitUntil(
caches.open(cacheName).then(function(cache) {
return cache.addAll(filesToCache);
})
);
});

self.addEventListener("activate", e => {
e.waitUntil(
caches.keys().then(function(cacheNames) {
return Promise.all(
cacheNames.map(function(thisCacheName) {
if (thisCacheName !== cacheName) {
return caches.delete(thisCacheName);
}
})
);
})
);
});

self.addEventListener("fetch", e => {
e.respondWith(
(async function() {
const response = await caches.match(e.request);
return response || fetch(e.request);
})()
);
});

```

- Be careful with the paths on the cache! If something fails, the service worker is not installed.
- There's a dedicated section to check that in the dev tools (first two on the `application` tab)

Once this is done, the site must listen to the `beforeunnstallprompt` event:

    window.addEventListener("beforeinstallprompt",handleInstall);

Once the event is stored, it's possible to call it when clicking a button. Here the function to prepare and the one that actually installs:

{% highlight js %}
const handleInstall = (e:Event) => {
console.log(`app install called`)
e.preventDefault();
deferredPrompt = e;
btnInstallAppVisible = true;
console.log(`app install call complete`)
};

const installApp = (e:Event) => {
btnInstallAppVisible = false;
deferredPrompt.prompt();
deferredPrompt.userChoice
.then((choiceResult) => {
if (choiceResult.outcome === 'accepted') {
btnInstallAppVisible = false;
console.log('User accepted the A2HS prompt');
} else {
console.log('User dismissed the A2HS prompt');
}
deferredPrompt = null;

        });

};
```

- Unistall app before trying again! I was stuck on this and it's really frustrating because nothing happens and it's difficult to know why... To uninstall, open the app and click on the second icon at the top when in a computer.
- If the `handleInstall` function is not logging anything, check the dev tools for some tip.
- `btnInstallAppVisible` is the variable that hides the button when the app is installed and the button is not needed anymore.

# Deploying to GitHub

I have the blog hosted on GitHub pages. It's easy and everything works in a single account. I never deployed svelte apps there before, so here's how:

`npm install gh-pages`

On `package.json`, add a `deploy` script:

`"deploy": "gh-pages -d public/"`

Run it at any moment with:

`npm run deploy`

This will build tha app and deploy a `gh-pages` branch with everything inside `public` to the repo. What GitHub needs to show the site.

# Browsers

The app shoud work in most modern browsers. But I've found at least, problems with:

- Safari: It's supposed to work with some permissions. [Found in an issue][safari_issue]
- Brave: Works with enabling `Motion sensors` and `Location` and then changing device orientation. [Found in an issue][brave_issue]

# Final thoughts

The possibilities are realy cool, but some browsers don't accept the orientation by default, meaning that most of their users will leave the app without giving the seconds to solve issues. I thing that converting it to a native app shouldn't be that difficult and would work. Adding the "works better with Chrome" text in an alert is a workaround, but i hate these messages...

Svelte with typescript it's still compicated to configure for VSCode. I hope that the new [SvelteKit][sveltekit] is better.

And it's a really fast example, the errors should be handled, I'm sure there's some bug, etc. Don't test it too much...

# Links

- [App Link][app]
- [PWA][pwa]
- [GitHub repo][code_repo]
- [Overpass API][overpass]
- [Kumi Overpass Site][kumi]
- [Overpass QL][overpassql]
- [Svelte TypeScript][svelte-typescript]
- [SvelteKit][sveltekit]
- [Compass example app][compass-app]
- [PWA example][pwa-example]
- [Safari Issue][safari_issue]
- [Brave Issue][brave_issue]

[app]: https://geoexamples.com/svelte-overpass/
[pwa]: https://en.wikipedia.org/wiki/Progressive_web_application
[code_repo]: https://github.com/rveciana/svelte-overpass
[overpass]: https://wiki.openstreetmap.org/wiki/Overpass_API#:~:text=The%20Overpass%20API%20(formerly%20known,that%20corresponds%20to%20the%20query.
[kumi]: https://overpass.kumi.systems/
[svelte-typescript]: https://svelte.dev/blog/svelte-and-typescript
[overpassql]: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
[sveltekit]: https://svelte.dev/blog/whats-the-deal-with-sveltekit
[compass-app]: https://lamplightdev.github.io/compass/
[pwa-example]: https://github.com/NileshSP/personalprofile/blob/master/src/components/biodetails.svelte
[safari_issue]: https://github.com/aframevr/aframe/issues/3976
[brave_issue]: https://github.com/brave/brave-browser/issues/7964
