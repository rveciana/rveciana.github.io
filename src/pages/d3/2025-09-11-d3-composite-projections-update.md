---
layout: ../../layouts/Post.astro
title: "D3 Composite Projections updates"
pubDate: 2025-09-11
categories: d3
tags: [projections, d3-composite-projections, library]
teaser: d3-composite-projections3.png
---

I first published the d3-composite-projections library quite a long time ago after a nice talk with a journalist that wanted to create Spanish election maps using d3. I kept adding some projections from time to time, but didn't write any update about it. So here is the last status of the project:

- TypeScript support: The library is still written in JavaScript, but I added the `index.d.ts` declaration file and now it can be used in TypeScript projects
- `getCompositionBorders` is only practical with SVG, so a `drawCompositionBorders` has been added to use Canvas without using Canvas2D, not always available
- There are new projections. The list is the following:
  - USA: [geoAlbersUSA](http://bl.ocks.org/rveciana/ee2119324e835e1bad42d0e4c1b9ab0d). The original composite projection also available in the d3-geo library, but with the boundaries.
  - USA Territories: [geoAlbersUsaTerritories](http://bl.ocks.org/rveciana/5040be82aea528b6f785464f8816690f) as albersUsa, but adding the American Samoa, Puerto Rico, U.S. Virgin Islands, Guam and Northern Marianas Islands, so all the [Congressional Districts](https://en.wikipedia.org/wiki/List_of_districts_of_the_House_of_Representatives_of_Japan) are represented
  - France: [geoConicConformalFrance](http://bl.ocks.org/rveciana/0ff189b15449330828605fe4e118a716)
  - Portugal: [geoConicConformalPortugal](http://bl.ocks.org/rveciana/ee09a2c3732f3e0d6872d1a7f796a29b)
  - Spain: [geoConicConformalSpain](http://bl.ocks.org/rveciana/d635afded8c4eae36ecf61a15bdf0a98)
  - Netherlands [geoConicConformalNetherlands](https://observablehq.com/@julesblm/the-netherlands-composite-projection)
  - Europe: [geoConicConformalEurope](http://bl.ocks.org/rveciana/ced3109b372039afbcf7278ba3d14250) (thought for Eurostat data)
  - Japan: [geoConicEquidistantJapan](http://bl.ocks.org/rveciana/1f5399d8887428ad67665d106ec089d1)
  - Ecuador: [geoMercatorEcuador](http://bl.ocks.org/rveciana/306a5202e1facf7a22e08fbb1044f568)
  - Chile: [geoTransverseMercatorChile](http://bl.ocks.org/rveciana/3a31865e82f4fab8ac2522545bbc7741), including the [Chilean Antarctic Territory](https://en.wikipedia.org/wiki/Chilean_Antarctic_Territory)
  - Malaysia: [geoMercatorMalaysia](http://bl.ocks.org/rveciana/6298dd3e71cf98b6930c06f19b6684a2), created with the help of [Saiful Azfar Ramlee](https://github.com/saifulazfar)
  - Equatorial Guinea: [geoMercatorEquatorialGuinea](http://bl.ocks.org/rveciana/4dfc136b8e2707f182aa4591f892f82e)
  - United Kingdom: [geoAlbersUk](https://gist.github.com/rveciana/27272a581e975835aaa321ddf816d726)
  - Denmark: [geoTransverseMercatorDenmark](https://observablehq.com/d/3a28765e735c5e67)

The library has currently about 20k weekly downloads, which is much more than I expected. I still find some countries with distant lands, so will keep updating!
