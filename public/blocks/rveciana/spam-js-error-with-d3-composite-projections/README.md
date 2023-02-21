The following code gives

    TypeError: ring[0] is undefined

when clicking on the prefactures.

The code is taken from [this example](http://bl.ocks.org/martgnz/fa8187c716c8a6d788eab7d51095b419)

The error was solved using the 
    
    topojson.presimplify(d);
    
function. More information in [this block](https://bl.ocks.org/mbostock/6245977), which is a [new Topojson 1.3 function](https://github.com/mbostock/topojson/releases/v1.3.0).
