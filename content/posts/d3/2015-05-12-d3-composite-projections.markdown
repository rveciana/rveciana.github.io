---
layout: post
title: 'D3 Composite Projections'
date: 2015-05-12
categories: d3
tags: [projections, library, npm, bower, nodejs]
teaser: d3-composite-projections.png
---

Some countries have regions sparse around the globe, which adds difficulties when drawing maps for them.

D3 already had the [albersUsa](http://bl.ocks.org/mbostock/5545680) projection that solved this problem by creating a composed projection, moving Alaska and Hawaii close to the main part of the USA.
But the other countries didn't have a projectino like this. That's why I made [this library](http://rveciana.github.io/d3-composite-projections/).

<script src="http://d3js.org/d3.v3.min.js"></script>
<script src="http://d3js.org/topojson.v1.min.js"></script>
<script src="https://raw.githubusercontent.com/rveciana/d3-composite-projections/0.0.3/composite-projections.min.js"></script>
<div id="example_map"></div>

<script>

  var width = 700,
      height = 500;

  var projection = d3.geo.conicConformalFrance();
  var path = d3.geo.path()
      .projection(projection);

  var svg = d3.select("#example_map").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("transform","translate(-130)");

  d3.json("https://cdn.rawgit.com/rveciana/5919944/raw/b1f826319231c3e06d6e8548bc947ca2c29dc9e8/france.json", function(error, regions) {
  var land = topojson.feature(regions, regions.objects.regions);

  svg.selectAll("path")
    .data(land.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke","#000")
    .style("stroke-width",".5px")
    .style("fill","#aca")
    .on("mouseover", function(d,i) {
      d3.select(this)
        .transition()
        .style("fill", "red");
      })
    .on("mouseout", function(d,i) {
      d3.select(this)
        .transition()
        .style("fill", "#aca");
      });


  svg
    .append("path")
      .style("fill","none")
      .style("stroke","#000")
      .attr("d", projection.getCompositionBorders());


});

</script>

It adds the composite projection for:

- [Spain](http://bl.ocks.org/rveciana/472b7749352554ca4b68)
- [France](http://bl.ocks.org/rveciana/02eb5b83848e0b06fa8e)
- [Portugal](http://bl.ocks.org/rveciana/aec08199d43759e98afe)
- [USA](http://bl.ocks.org/rveciana/170a76b8dc1f9cfd8b2d)

With a function that draws a border between the composition zones by returning an SVG path.

There is an example for each region, linked in the list above.

[The library web page](http://rveciana.github.io/d3-composite-projections/) explains the usage and installation/testing

If you are going to use it, need more regions/countries or find an error, please leave a comment here.
