This example shows how to genrate a [Coastal Vignette](http://planet.qgis.org/planet/tag/coastal%20vignette/) from a simple topojson using the [jsts library](https://github.com/bjornharrtell/jsts) and D3js.

I took the idea from [this tweet](https://twitter.com/John_M_Nelson/status/931184909825269772?s=03) by [John Nelson](https://adventuresinmapping.com/). The mapping style is taken from [this other tutorial](https://gist.github.com/wknowles/6bbdf040a2dd5231798a7ffffe9e0e77) by [William Knowles](https://github.com/wknowles).

By playing with the number of lines and their color, distance, thickness, opacity and dashing, the possibilities to style the map are really nice.

Using the jsts library was the easiest way I found, altough the integration with d3js is not easy. Maybe using WKT instead of GeoJSON as an input would be nicer. Also, if your geometries cross the -180 meridian, the buffer lines go crazy. This should be fixed too.