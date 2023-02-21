Creating visualizations like [this one](http://bl.ocks.org/rveciana/8464690) but using canvas is possible.

Since the Canvas element hasn't got the *getTotalLength()* method as it exists in SVG, I'm using the [svg-path-properties](https://github.com/rveciana/svg-path-properties), that allows this calculations with a good precision (<0.1px), as well as allowing the *getPointAtLength* function too.
