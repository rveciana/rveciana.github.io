This example is the same as [this Jason Davies GIST](http://bl.ocks.org/jasondavies/4188334), but using Canvas instead of SVG.

How is the color selected:

The place was easy to find

    context.fillStyle = color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0);

I had to think for some time to understand how does this work. Let's separate it:

    color(
        d.color = 
                d3.max(
                        neighbors[i], 
                        function(n) { return countries[n].color; }
                        ) 
                        + 1 | 0
    );

Going from the inside to the outside:
* The first thing is calling a d3.max function. [The docs](https://github.com/mbostock/d3/wiki/Arrays#d3_max) say that the first argument is an array. In our case, the ids of all the neighbor countries. The second optional argument is an *accessor* equivalent to call array.map before calculating the maximum value. This means calling a function for each array element before calculating the maximum value. In our case, the function returns the color field of the country with the indicated id. The result, of course, will be an *undefined* value when the color is not set.
* After calculating the maximum color value of all the neighbors, we add +1, so we will use the next color. If the value was *undefined*, the color is set to 0 using |0.
* This calculated value is assigned to the country at the field *color* using d.color = . When another country has the current country as a neighbour, the color number will be found
* The color function is a [color scale](https://github.com/mbostock/d3/wiki/Ordinal-Scales#category20). Each color number will be transformed into the RGB value.