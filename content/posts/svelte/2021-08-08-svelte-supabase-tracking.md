---
layout: post
title: 'A tracking tool with Supabase and Svelte'
date: 2021-08-07 18:40:53
teaser: supabase-svelte-track.png
categories: svelte
tags: [supabase, postgis]
thumbnail: /images/svelte/svelte-supabase/twitter.png
twitter-card: summary
---

In the [previous post][previous_post] I explained a fast way to use [Supabase][supabase] with Svelte to store and show geographical data. Supabase offers a really cool way to use websockets so the page updates when some data in the database changes. They call it *subscription* and it's adding *subscribe()* function on a *select*.

So I created this new example. On a mobile phone (allowing geolocation), we write the location into the database, and on another device you can follow the position in real-time. Everything without having to install any library except for Supabase! You can [get the source code][source_code] and see the [demo page][working_site].

The app
=======

The first screen asks if you want to create a track or follow one:

<img src="{{ site.baseurl }}/images/svelte/svelte-supabase-track/initial.png" />

When selecting *Start a new track*, a random name will be assigned to it so it's possible to use it with the option *Follow track* from any other device.

In both cases, you will see the map with the track:

<img src="{{ site.baseurl }}/images/svelte/svelte-supabase-track/map.png" />


Supabase
========

To run this project, we'll use a single table. The table looks like this:

<img src="{{ site.baseurl }}/images/svelte/svelte-supabase-track/table.png" />

* The *name* field will be used to follow a single track. Only who has created it knows the name, so you can follow only your tracks
* *geometry* has the track, which is a *linestring*. Ideally, it could be a *multilinestring* and divide the track in sections if the GPS stops or something, but this is out of the scope for a simple demo
* The geometry column is created running:

    SELECT AddGeometryColumn ('','tracks','geom',4326,'LINESTRING',2);

So it's that easy! Now, the function to add a new point:

{% highlight js %}create or replace function addTrackPoint (track_name varchar, lon float, lat float)
returns SETOF tracks as
$$
declare
return_record tracks%rowtype;
begin
 
  update tracks set geom = ST_AddPoint(geom,
      ST_SetSRID(
      ST_MakePoint(lon, lat),
      4326), 
      -1
  )
      
       where name = track_name
  returning *
    into return_record;
  if found then
    return next return_record;
  else 
    insert into  tracks(name, geom) values (track_name, ST_MakeLine(
          ARRAY[ST_SetSRID(
      ST_MakePoint(lon, lat),
      4326)
      ]))
    returning *
    into return_record;
    return next return_record;

  end if;

end;
$$
language plpgsql;
{% endhighlight %}

So, since we don't have a real backend, only SQL calls, the logic has to go in the database itself, which is good to remember the SQL you forgot!

The idea is sending a longitude and latitude so the geometry updates adding the new point and returns the data with the new *linestring* back to the user.

* We want to get the result of the insert, so we declare the type as the table row type and use the *returning* clause so we can get the updated linestring directly after inserting a new point
* PostGIS has many functions to manipulate geometries. For the update, we use *ST_AddPoint* and *ST_MakeLine* for the insert
* We are actually using an *upsert* which means inserting when the record doesn't exist and updating it otherwise.  The *if found then* part is the one that checks the update result and runs the insert if nothing was updated.
* A new point can be added now from the Supabase library:

{% highlight js %}await supabase
			.rpc('addtrackpoint', {track_name: trackName, lon: lng, lat:lat});
{% endhighlight %}

Or using SQL, with:

    SELECT addtrackpoint('track_name', lon, lat)

Svelte Code
===========

You can [check the code on GitHub][source_code], I'll comment on the basic points only:

* [Check the last post][previous_post] to see how I created the basic project
* I created two stores in at stores.ts

{% highlight js %}import { writable } from 'svelte/store';

export const track = writable({
    type: "LineString", 
    coordinates: [] as [number, number][]
});

export const mapCenter = writable([0, 0]);
{% endhighlight %}

Doing it like this, we don't re-render all the map if we have to pass the *linestring* as a *prop*, since only the track component will listen to the store. The store can be updated on the root component. *mapCenter* is used to set the center of the map when opening or creating a track.

* The *Map* Component uses [svelte-leaflet][svelte_leaflet] to create the map. This allows using *leaflet* as components. Check its docs to see how it's installed (or take a look at the *rollup.config.js* file in the project)

{% highlight js %}<script>
    import {LeafletMap, TileLayer} from 'svelte-leafletjs';
	import MapTrack from './MapTrack.svelte';
    import { mapCenter } from './store.js';

    let mapCenterValue;

    const unsubscribe = mapCenter.subscribe(value => {
        mapCenterValue = value;
    });

    const mapOptions = {
        center: [mapCenterValue[1], mapCenterValue[0]],
        zoom: 15,
    };

	const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

	const tileLayerOptions = {
        minZoom: 0,
        maxZoom: 20,
        maxNativeZoom: 19,
        attribution: "© OpenStreetMap contributors",
    };
   
    let leafletMap;
</script>

    <LeafletMap bind:this={leafletMap} options={mapOptions}>
        <TileLayer url={tileUrl} options={tileLayerOptions}/>
		<MapTrack/>
    </LeafletMap>
{% endhighlight %}

The store is used to get the center of the map and a *MapTrack* component is added to show the track. This way, when the track updates, only this layer is re-rendered, which is much more efficient.

* The *MapTrack* component looks like this:

{% highlight js %}<script>
    import {Tooltip, Polyline} from 'svelte-leafletjs';
    import { track } from './store.js';

    let trackValue;

	const unsubscribe = track.subscribe(value => {
		trackValue = value;
	});
</script>

<Polyline latLngs={trackValue.coordinates.map(d=>[d[1],d[0]])} color="#000000">
    <Tooltip>Resorts World Sentosa to Vivo City</Tooltip>
</Polyline>
{% endhighlight %}

Using the store makes it so easy!

* The *App.svelte* file is the one that does most of the job:

{% highlight js %}<script lang="ts">
    import { supabase } from "./supabaseClient";
	import type { RealtimeSubscription } from '@supabase/supabase-js'
	import { onMount } from 'svelte';
	import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
	import Map from './Map.svelte';
	import { convertWkb } from './read-wkb';
	import { track, mapCenter } from './store.js';
	
	let lng = 0;
	let lat = 0;
	let mode:"read"|"write";
	let trackName: string;
    let mySubscription:RealtimeSubscription
		
	onMount(() => {
		if (navigator.geolocation) {
				navigator.geolocation.watchPosition(displayLocationInfo, ()=>{console.log("ERROR");}, { enableHighAccuracy: false, timeout:60000, maximumAge: 0 });
		} else {
			alert("NO GEOLOCATION");
		}
		});

	const displayLocationInfo = async  (position: GeolocationPosition) =>{
		lng = position.coords.longitude;
		lat = position.coords.latitude;
		if(mode === "write"){

			const {data}= await supabase
				.rpc('addtrackpoint', {track_name: trackName, lon: lng, lat:lat});
			data.length>0 && track.set(data[0].geom);
			console.log("New position", lng, lat, "-->", data[0].geom);
		}

	}

	const startWrite = async () => {
		trackName = uniqueNamesGenerator({
  			dictionaries: [adjectives, colors, animals],
			separator: "-"
		});


		const { data } = await supabase
			.rpc('addtrackpoint', {track_name: trackName, lon: lng, lat:lat});

		mode = "write";
		console.log("Writes", data);
		mapCenter.set([lng, lat]);
		data.length>0 && track.set(data[0].geom);
	}

	const startRead = async () => {
		
		const { data, error } = await supabase
				.from('tracks')
				.select()
				.filter('name', 'eq', trackName);

		data.length>0 && track.set(data[0].geom);
		data.length>0 && mapCenter.set(data[0].geom.coordinates[0]);
		mode = "read";
		mySubscription = supabase
			.from(`tracks:name=eq.${trackName}`)
			.on('*', payload => {
				const newTrack = convertWkb(payload.new.geom);
				console.log('Change received!', newTrack);
				track.set(newTrack);
			})
			.subscribe();
	}
</script>

<div class="container" style="width: 100%; height: 100%;">
	{#if mode==="read"}
	<div>READ {trackName}</div>
	<Map/>
	{:else if mode==="write"}
	<div>WRITE {trackName}</div>
	<Map/>
	{:else}
		<div>
			<input placeholder="track name" bind:value={trackName}>
			<button on:click|once={startRead}>Follow a track</button>
		</div>
		<div>
			<button on:click|once={startWrite}>Start a new track</button>
		</div>
	{/if}
</div>
{% endhighlight %}

Let's see the most important parts:

* *mode* can be *read*, *write*, or *undefined*, which are the three states that the app can have. Undefined allows the user to choose if he wants to create a track or follow it. The form calls either *startRead* or *startWrite* that changes this *mode* variable.
* On mounting the component, the geolocation is started. This way, the *lon* and *lat* variables will be filled and ready if we want to start a new track
    * *displayLocationInfo* is the function that gets the position and calls the function in the database to store a new point if we are in the *write* mode
* *startWrite* creates a random name using the *unique-names-generator* library. It will be always an adjective-color-animal sequence. Then, uses the same function to add the first point and sets the map center.
* *startRead* is quite similar but starts a new subscription. Notice that subscriptions don't use filters as in the other cases, but changes the *from* function to *table:name=operator:value*
    * See the next point to see why do we call the *convertWkb* function

WKB
===

When using the real-time feature, the result is given in WKB format because Supabase doesn't run any conversion function as it does the select function (strange). WKB is a hex representation of a binary string with geometries. You can see a nice [explanation at Wikipedia][wkb]. If you have this string you can insert the data into the database without functions (and using Supabase, with the *insert()* function). The problem is that I wasn't able to find a library that makes the conversion in Javascript. There's [wkx.js][wkx], but I wasn't able to use it in a ES6 style (import wkb from 'wkt'). If somebody knows how to do it, please tell me, it's the main piece to work with all these tools properly.

So I created this small function that decodes a *linestring* from WKB to GeoJSON

{% highlight js %}import {from, readDoubleBE, readDoubleLE, readUInt32LE, readUInt32BE} from 'bops'
export const convertWkb = (wkb:string) => {
    const buffer = from(wkb, "hex");
    const isBigEndian = wkb.substring(0,2) === '00';
    const epsg = isBigEndian ? readUInt32BE(buffer, 5) : readUInt32LE(buffer, 5);

    const numberOfPoints = (wkb.length - 26)/32;
    const coordinates = [];


    for(let i = 0; i < numberOfPoints; i++){
        coordinates.push([readDoubleLE(buffer, 13 + i * 16), readDoubleLE(buffer, 13 + 8 + i * 16)]);
    }

    const geoJSON =  {
        type: "LineString", 
        coordinates: coordinates
    }
  
    return geoJSON;
}
{% endhighlight %}

* [bops] library is used as a replacement for the nodejs buffer function. It will convert from hex to the types we need
* I play with some numbers to get the proper position of the bytes for each point. I know that is a simple linestring so I can iterate only once
* The format is actually EWKT, that adds the projection code (SRID, which is 4326, so WGS84 in our case)

Links
=====

- [Example source code][source_code]
- [Working example][working_site]
- [Previous Post][previous_post]
- [Supabase][supabase]
- [WKB][wkb]
- [wkx.js][wkx]
- [bops][bops]
- [Svelte Leaflet][svelte_leaflet]



[previous_post]: https://geoexamples.com/svelte/2021/07/18/svelte-supabase-maps.html
[supabase]: https://supabase.io/
[source_code]: https://github.com/rveciana/supabase-svelte
[working_site]: https://geoexamples.com/supabase-svelte/
[wkb]: https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry#Well-known_binary
[wkx]: https://github.com/cschwarz/wkx
[bops]: https://github.com/chrisdickinson/bops
[svelte_leaflet]: https://ngyewch.github.io/svelte-leaflet/
