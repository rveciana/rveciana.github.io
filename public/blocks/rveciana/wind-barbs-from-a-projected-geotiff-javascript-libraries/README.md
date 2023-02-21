This example is the same as [this block](http://bl.ocks.org/rveciana/206956c3e142040432c477d75b038749), but using the original GeoTIFF, ehich is in the [Lambert conic conformal projection](http://bl.ocks.org/mbostock/3734321). Since the GeoJSON and coordinates needed by d3 to draw the map are in WGS84 (longitude-latitude) projection, all the data must be reprojected before drawing it. You can see here how to do it for polygons (the coloured isobands) and points (for wind barbs).

The results are more or less the same [as in the previous pre-reprojected example](http://bl.ocks.org/rveciana/206956c3e142040432c477d75b038749), but should be better, since the isobands and barbs are created from the original data, not interpolated as in the other case.

Several liraries have been used:

* [geotiff](https://github.com/constantinius/geotiff.js): Reading the GeoTIFF data (not the projectiopn, which would be cool)
* [proj4js](http://proj4js.org/): Reprojecting points
* [d3-marching-squares](https://github.com/rveciana/d3-marching-squares): Creating the isobands with the wind speed
* [reproject](https://github.com/perliedman/reproject): Reprojecting the generated GeoJSON

reproject doesn't ork directly with the browser, so an operation with browserify is needed before doing it:

    npm install reproject
    cd node_modules/reproject
    browserify index.js --standalone reproject > ../../reproject.js
