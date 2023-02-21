This exampe shows the temperature at 840 hPa and the geopotential height at 850 hPa from the GFS model (date 27/7/2016).

The idea is showing how to use the [d3-marching-squares](https://github.com/rveciana/d3-marching-squares) library as in the [previous example](http://bl.ocks.org/rveciana/de0bd586eafd7fcdfe29227ccbdcd511), but adding isolines. 

The colors represent the temperature and the lines the geopotential height. The example should have a scale, but the [d3-legend](http://d3-legend.susielu.com) library doesn't seem to work with d3 v4. The isolines should be labaled too, and this is a quite difficult task. 

The example is created with npm and browserify, so if you want to play a little with it:

* Download the package.json, index.html and draw.js files
* run npm install
* change the things you want in the draw.js file
* run browserify draw.js > bundle.js

Now you can see the changed page.