---
layout: ../../layouts/Post.astro
title: "d3-composite-projections update"
pubDate: 2016-10-03
categories: d3
tags: [projections, npm, nodejs]
teaser: d3-composite-projections2.png
description: Tutorial about scrolled animated maps
thumbnail: /images/d3/d3-composite-projections2/twitter.png
twitter-card: summary
---

Last year I created the first version of the [d3-composite-projections library](/d3/2015/05/12/d3-composite-projections.html), but some things have changed since then, so a major update has been released. This update includes:

1. New projections have been added
2. D3js v4 is used instead of v3. All the code has been re-written using ES2015

<img src="{{ site.baseurl }}/images/d3/d3-composite-projections2/conicConformalFrance.png" width="70%"/>

## Projections

The available projections for this 1.0.1 version are:

- USA: [geoAlbersUSA](http://bl.ocks.org/rveciana/ee2119324e835e1bad42d0e4c1b9ab0d)
- USA Territories: [geoAlbersUsaTerritories](http://bl.ocks.org/rveciana/5040be82aea528b6f785464f8816690f) as albersUsa, but adding the American Samoa, Puerto Rico, U.S. Virgin Islands, Guam and Northern Marianas Islands, so all the [Congressional Districts](https://en.wikipedia.org/wiki/List_of_districts_of_the_House_of_Representatives_of_Japan) are represented
- France: [geoConicConformalFrance](http://bl.ocks.org/rveciana/0ff189b15449330828605fe4e118a716)
- Portugal: [geoConicConformalPortugal](http://bl.ocks.org/rveciana/ee09a2c3732f3e0d6872d1a7f796a29b)
- Spain: [geoConicConformalSpain](http://bl.ocks.org/rveciana/d635afded8c4eae36ecf61a15bdf0a98)
- Europe: [geoConicConformalEurope](http://bl.ocks.org/rveciana/ced3109b372039afbcf7278ba3d14250) (thought for Eurostat data)
- Japan: [geoConicEquidistantJapan](http://bl.ocks.org/rveciana/1f5399d8887428ad67665d106ec089d1)
- Ecuador: [geoMercatorEcuador](http://bl.ocks.org/rveciana/306a5202e1facf7a22e08fbb1044f568)
- Chile: [geoTransverseMercatorChile](http://bl.ocks.org/rveciana/3a31865e82f4fab8ac2522545bbc7741), including the [Chilean Antarctic Territory](https://en.wikipedia.org/wiki/Chilean_Antarctic_Territory)

If you want other countries, I'll be glad to add them. Sometimes it's hard to imagine the real uses for this when it's not a country you know well.

## New code style

When [Mike Bostock](https://bost.ocks.org/mike/) released the [d3-geo package](https://github.com/d3/d3-geo) I used it as the template, so all the tests and code are written using the same style.

Now, d3-composite-projections can be used with Canvas and SVG, from nodejs, nodejs+browserify, directly from a JavaScript file, etc. Let's see an example for each case:

- [SVG + JavaScript file](#svg--javascript-file)
- [SVG + rollup + JavaScript file](#svg--rollup--javascript-file)
- [SVG + browserify](#svg--browserify)
- [Canvas with Nodejs](#canvas-with-nodejs)

## SVG + JavaScript file

The most common case to see. [This example showing the Congressional Representatives](http://bl.ocks.org/rveciana/fe6b452c853146e674dd6dd09c1cc6e3) uses it and is similar to [this Chilean map using the old version](http://bl.ocks.org/rveciana/f0a8ec08d0b63d0cdc6985cc37468b9a). The code:

{% highlight js %}

<!DOCTYPE html>
<meta charset="utf-8">
<style>
#tooltip {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  margin: 0;
  padding: 10px;
  width: 200px;
  height: 70px;
  color: white;
  font-family: sans-serif;
  font-size: 0.9em;
  font-weight: bold;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.55);
  opacity: 0;
  pointer-events: none;
  border-radius:5px;
  transition: .2s;
}
</style>
<body>
  <div id="container"/>
  <div id="tooltip"/>
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="http://d3js.org/topojson.v1.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3-composite-projections/1.0.1/d3-composite-projections.min.js"></script>
<script>
var width = 960,
    height = 500;

var projection = d3.geoAlbersUsaTerritories();
var path = d3.geoPath()
.projection(projection);

var svg = d3.select("#container").append("svg")
.attr("width", width)
.attr("height", height);

    var t = d3.transition();

d3.json("us_congressional_districts.json", function(error, us) {
var us = topojson.feature(us, us.objects.us_congressional_districts);
svg.selectAll(".region")
.data(us.features)
.enter()
.append("path")
.attr("class", "region")
.attr("d", path)
.style("fill", function(d){
if(d.properties.PARTY_AFF=="Democrat")
return "#4a86e8";
else
return "#e84a4a";})
.style("stroke", "#000")
.style("stroke-width", "0.5px")
.on("mouseover", function(d){
//Show the tooltip
var x = d3.event.pageX;
var y = d3.event.pageY - 40;

        d3.select("#tooltip")
          .style("left", x + "px")
          .style("top", y + "px")
          .style("opacity", 1)
          .html( d.properties.STATE + " dist: " + d.properties.CONG_DIST + "<br/>" +d.properties.CONG_REP + "<br/>" + d.properties.PARTY_AFF );
        })
        .on("mouseout", function(){
          //Hide the tooltip
          d3.select("#tooltip")
            .style("opacity", 0);
        });;

svg
.append("path")
.style("fill","none")
.style("stroke","#000")
.style("stroke-dasharray","5,5")
.attr("d", projection.getCompositionBorders());

});

</script>
```

- The new D3js v4 can be included from this address: https://d3js.org/d3.v4.min.js
- The d3-composite-projections is uploaded at the [cdnjs project](https://cdnjs.cloudflare.com/)
- An other option is including the D3js v4 modules needed, one by one, as in [this example](http://bl.ocks.org/rveciana/a2a1c21ca1c71cd3ec116cc911e5fce9). It's really difficult to manage, it may be better using nodejs and rollup, as in the next point
- Note some changes from a usual version 3 script:
  - Adding the _geo_ as a prefix to many functions: _path_ becomes _geoPath_
  - The transitions have changed a little. a transition is declared before appending it to the events

## SVG + rollup + JavaScript file

D3js v4 and d3-composite-projections are build using ES2015. Using [rollup.js](http://rollupjs.org) instead of including all the d3js coded, including the non used functions, lets you use ES2015 and uses only the needed modules, so the resulting JavaScript file is much smaller (80% less in this case!). I took the information from [this post by Richa Vyas](https://medium.com/@richavyas/d3-js-the-custom-modular-bundle-now-bebd6f25bc8b#.kvi0p3n1c).

The code can be [found in this gist](http://bl.ocks.org/rveciana/0e73c92391def44331d2069755edc199).

Basically, the involved files are:

- package.json, which makes possible to install all the dependencies with _npm install_ and sets the _build_ script
- d3.js, which is the entry point for _rollup_. It takes the needed dependencies and sets the names that the final script must use
  - Note that the used functions must be selected from each module i.e. _json_ from the _request_ module
- index.html is a regular file with its _html_ and _JavaScript_ code, but with some things changed because of the names used in the _d3.js_ file
  - rollup has set the d3 prefix so all the functions are available wsing _d3._ as with the old v3 version
  - topojson is included so, this time, it must be accessed with the d3 prefix too. Another option would be not to include into the _d3.js_ file

The first time may be a bit tricky, but the final small size it's worth the effort.

## SVG + browserify

All the examples linked to the projections are done this way. Create an _html_ file:
{% highlight js %}

<!DOCTYPE html>
<meta charset="utf-8">

<body>
  <div id="map"></div>

  <script src="bundle.js"></script>

```

And then, the node file (I called it draw.js):

{% highlight js %}
var d3_composite = require("d3-composite-projections");
var d3_geo = require("d3-geo");
var d3_request = require("d3-request");
var d3_selection = require("d3-selection");
var d3_transition = require("d3-transition");
var topojson = require("topojson");

var width = 960;
var height = 500;

var projection = d3_composite.geoConicConformalEurope();

var path = d3_geo.geoPath()
.projection(projection);

var svg = d3_selection.select("map").append("svg")
.attr("width", width)
.attr("height", height);

var t = d3_transition.transition()
.on("interrupt", function(d,i){
console.info(i);
});

d3_request.json("nuts0.json", function(error, topojsonData) {
var us = topojson.feature(topojsonData, topojsonData.objects.nuts0);

    svg.selectAll(".region")
      .data(us.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class","region")
      .style("fill", "#aca")
      .style("stroke", "#000")
      .style("stroke-width", "0.5px")
      .on("mouseover", function(d,i) {
        d3_selection.select(this)
          .transition(t)
          .style("fill", "red");
        })
      .on("mouseout", function(d,i) {
        d3_selection.select(this).interrupt();
        d3_selection.select(this)
          .transition(t)
          .style("fill", "#aca");
        });

      svg
        .append("path")
          .style("fill","none")
          .style("stroke","#f00")
          .attr("d", projection.getCompositionBorders());

});
```

To create the _bundle.js_ file with browserify, run:

    browserify draw.js > bundle.js

Or, if you want a smaller file:

    browserify draw.js| uglifyjs > bundle.js

Of course, you will have to install all the dependencies, browserify and uglify first:

    npm install d3-composite-projections d3-geo d3-request d3-selection d3-transition topojson

## Canvas with Nodejs

If you want to draw png maps from the command line, you can adapt the test scripts included in the library:

{% highlight js %}
var width = 960,
height = 500,
projectionName = process.argv[2],
topojsonName = process.argv[3],
layerName = process.argv[4],
projectionSymbol = "geo" + projectionName[0].toUpperCase() + projectionName.slice(1);

if (!/^[a-z0-9]+$/i.test(projectionName)) {throw new Error();}

var fs = require("fs"),
topojson = require("topojson"),
Canvas = require("canvas"),
d3_geo = require("d3-geo"),
d3_composite = require("d3-composite-projections");

var canvas = new Canvas(width, height),
context = canvas.getContext("2d");

var data = JSON.parse(fs.readFileSync(topojsonName, 'utf8')),
graticule = d3_geo.geoGraticule(),
outline = {type: "Sphere"};

var path = d3_geo.geoPath()
.projection(d3_composite[projectionSymbol]().precision(0.1))
.context(context);

context.fillStyle = "#fff";
context.fillRect(0, 0, width, height);
context.save();

context.beginPath();
path(topojson.feature(data, data.objects[layerName]));
context.fillStyle = "#aca";
context.strokeStyle = "#000";
context.fill();
context.stroke();

context.beginPath();
path(graticule());
context.strokeStyle = "rgba(119,119,119,0.5)";
context.stroke();

context.restore();

context.beginPath();
path(outline);
context.strokeStyle = "#00F";
context.stroke();

context.beginPath();
context.strokeStyle = "#F00";
d3_composite[projectionSymbol]().drawCompositionBorders(context);
context.stroke();

canvas.pngStream().pipe(fs.createWriteStream("./" + projectionName + ".png"));

```

- The script takes three arguments:
  1. The projection name i.e. conicConformalPortugal
  2. The topojson name i.e. world-50m.json
  3. The layer name i.e. world
- Note that the method _drawCompositionBorders_ has to be used instead of _getCompositionBorders_, since _getCompositionBorders_ returns a string as needed in SVG, which it's impossible to draw using Canvas with node, since the object _Canvas2D_ is not always available.

Install the dependencies with:

    npm install topojson canvas d3-geo d3-composite-projections

and run it like:

    node test.js conicConformalSpain provincias.json provincias d3-geo
```
