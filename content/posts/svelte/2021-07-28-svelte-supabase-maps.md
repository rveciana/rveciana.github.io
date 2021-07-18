---
layout: post
title: 'Mapping with supabase and Svelte'
date: 2021-07-18 18:40:53
teaser: supabase-svelte.png
categories: svelte
tags: [supabase, postgis]
---

I discovered [supabase][supabase] some days ago as a substitute to Firebase. As it was using PostgreSQL as the database, I checked if it had extensions and yes! it's got PostGIS and all its siblings!

Using it it's not that straight forward, but it's not that difficult, so supabase can be a great solution if your backed it's not really complex.

<img src="{{ site.baseurl }}/images/svelte/svelte-supabase/map.png"/>

We'll show the user's point data on a map, a list and will let them add new points too.  You can see the [working example here][workingExample].

## Installation

The first step will be creating your supabase account, of course. Then, setup a Svelte project.

I used the [supabase tutorial for Svelte][supabaseSvelte] to do it. Basically, you need to set the *.env* file with your keys (check at your supabase account)

    SVELTE_APP_SUPABASE_URL=THE_URL
    SVELTE_APP_SUPABASE_ANON_KEY=THE_KEY

This will be used in a file called *supabaseClient.js* that connects to the service:

{% highlight js %}import { createClient } from '@supabase/supabase-js'

const supabaseUrl = __api.env.SVELTE_APP_SUPABASE_URL
const supabaseAnonKey = __api.env.SVELTE_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
{% endhighlight %}

Then, the data can be accessed like this (that would get all the elements from the *geometries* table)

{% highlight js %}import { supabase } from "./supabaseClient";
const { data, error } = await supabase
    .from('geometries')
    .select();
{% endhighlight %}

## Creating the table

This is the first place where we find problems, because the wizard doesn't accept the geometry types.

So first, activate the PostGIS extension at the *database -> extensions* menu

Then, at the tables section, create a table (I'll call it *geometries*) with the id and a name field of type *varchar*

As you can't add the geom column, go to the *sql* section and run 

{% highlight js %}SELECT AddGeometryColumn ('','geometries','geom',4326,'POINT',2);
{% endhighlight %}

The first argument is the schema (public or nothing in our case), the second the table and then the column name, type, projection SRID and dimensions

The table can be now used, but we can't insert geometries unless we have them in WKB format. [WKX][wkx] is a library that does this, but I wasn't able to make it work with Svelte's rollup. I get this [unsolved bug][bug]. Without being able to create the WKB format, we have to use PostGIS to do it for us, but the insert function accepts only values. The solution is using a stored procedure. Open the SQL section and run:
{% highlight js %}create or replace function addGeomerty (location_name varchar, lon float, lat float)
returns SETOF geometries as
$$
declare
return_record geometries%rowtype;
begin
  insert into  geometries(location_name, geom) values (location_name, ST_SetSRID(ST_MakePoint(lon, lat), 4326))
   returning *
   into return_record;
  return next return_record;
end
$$
language plpgsql;
{% endhighlight %}

This function will take the name, longitude and latitude and, besides inserting the name, uses postgis to calculate the geometry (*st_MakePoint*).
It's returning the new value so we don't have to query the data again to how the new point.

<img src="{{ site.baseurl }}/images/svelte/svelte-supabase/table.png"/>

## Svelte components

We'll use two components, one for the map and the other for the rest. Let's see the map:

{% highlight js %}<script>
    import { geoEqualEarth, geoPath } from "d3-geo";
    import { onMount } from "svelte";
    import { feature } from "topojson";
    export let points;
    let data;
    const projection = geoEqualEarth();
    const path = geoPath().projection(projection);
    onMount(async function() {
      const response = await fetch(
        "https://gist.githubusercontent.com/rveciana/502db152b70cddfd554e9d48ee23e279/raw/cc51c1b46199994b123271c629541d417f2f7d86/world-110m.json"
      );
      const json = await response.json();
      const land = feature(json, json.objects.land);
      data = path(land);
    });
  </script>
  <style>
    svg {
      width: 960px;
      height: 500px;
    }
    .border {
      stroke: #444444;
      fill: #cccccc;
    }
  </style>
  <svg width="960" height="500">
    <path d={data} class="border" />
    {#each points.filter(d=>d.geom) as point}
        <circle r=10 cx={projection(point.geom.coordinates)[0]} cy={projection(point.geom.coordinates)[1]}/>
    {/each}
  </svg>
{% endhighlight %}

This is a regular d3 map. *export let points;* gets the points from the props and adds them on the map. Points are in geoJSON format, and inside the *geom* column. That's why the values are got like *point.geom.coordinates*.

The main component of the site is *App.svelte*:

{% highlight js %}<script>
    import Map from "./Map.svelte";
    import { supabase } from "./supabaseClient";
	let geometries=[];
	let newPointName;
	let newPointLon;
	let newPointLat;
	let loading = false;
	$: areValuesValid = !!newPointName && !isNaN(newPointLat) && !isNaN(newPointLon);
	async function getData() {
	const { data, error } = await supabase
		.from('geometries')
		.select();
	if(data){
		geometries = data;
	}
	}
	const handleSubmit = async () => {
		if(areValuesValid){
			try {
			loading = true
			const { data: dataInsert, error } = await supabase.rpc('addgeomerty', {location_name: newPointName, lon: newPointLon, lat:newPointLat})
			geometries = [...geometries, ...dataInsert]
			if (error) throw error
		} catch (error) {
			console.log(error, error.error_description || error.message)
		} finally {
			loading = false
		}
        }
}
</script>
<div class="container" style="padding: 50px 0 100px 0;" use:getData>
	{#each geometries as { id, location_name, geom }, i}
		<div>{id}-{location_name}-{geom && geom.coordinates}</div>
	{/each}
	<Map points={geometries}/>
	<form class="row flex flex-center" on:submit|preventDefault={handleSubmit}>
		<div class="col-6 form-widget">
		  <p class="description">Add a new point to the map</p>
		  <div>
			<input
			  class="inputField"
			  type="name"
			  placeholder="Name"
			  bind:value={newPointName}
			/>
			<input
			  class="inputField"
			  type="number"
			  step="0.01"
			  placeholder="Longitude"
			  bind:value={newPointLon}
			/>
			<input
			  class="inputField"
			  type="number"
			  step="0.01"
			  placeholder="Latitude"
			  bind:value={newPointLat}
			/>
		  </div>
		  <div>
			<input type="submit" class='button block' value={loading ? "Loading" : areValuesValid ? "Upload point" : "Enter valid values"} disabled={loading || !areValuesValid} />
		  </div>
		</div>
	  </form>
</div>
{% endhighlight %}

The two *supabase* related chunks are:

{% highlight js %}const { data, error } = await supabase
        .from('geometries')
        .select();
{% endhighlight %}

That retrieves the data (all rows, in a real app this should be limited)

{% highlight js %}const { data: dataInsert, error } = await supabase.rpc('addgeomerty', {location_name: newPointName, lon: newPointLon, lat:newPointLat})
geometries = [...geometries, ...dataInsert]
{% endhighlight %}
This calls the function and gets its results. The newly created rows are added to the existing ones so the data is in sync with the server.

## Links

- [Working example][workingExample]
- [supabase][supabase]
- [supabase and Svelte setup tutorial][supabaseSvelte]
- [wkx library][wkx]
- [wkx bug][bug]
- [using a PostgreSQL function][functions]

[workingExample]: https://bl.ocks.org/rveciana/ca929e406e6bac979cd7a7f263303bad
[supabase]: https://supabase.io/
[supabaseSvelte]: https://supabase.io/docs/guides/with-svelte#initialize-a-svelte-app
[wkx]: https://github.com/cschwarz/wkx
[bug]:http://5.9.10.113/44315937/issues-importing-wkx-to-convert-wkb-to-wkt
[functions]: https://medium.com/geekculture/using-stored-procedures-rpc-in-supabase-to-increment-a-like-counter-9c5b2293a65b