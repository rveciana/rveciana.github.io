This example shows how to use the [d3-marching-squares](https://github.com/rveciana/d3-marching-squares) library.

The gist reads a GeoTIFF file, gets its data, calculates the zones for each interval and draws it on an html5 canvas element.

The data is an output of the GFS meteorological model (surface temperature), transformed using the [grib api tools](https://software.ecmwf.int/wiki/display/GRIB/GRIB+tools)

The [d3-marching-squares](https://github.com/rveciana/d3-marching-squares) library is based on the [MarchingSquares.js](https://github.com/RaumZeit/MarchingSquares.js) library.

The GeoTIFF file is read using the [npm geotiff](https://www.npmjs.com/package/geotiff) library