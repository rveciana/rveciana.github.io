Creating visualizations like [this one](http://bl.ocks.org/rveciana/8464690) but using canvas is possible.

The technique is [the same as when using it with SVG](http://stackoverflow.com/questions/25442709/draw-html5-javascript-canvas-path-in-time) with the problem that Canvas hasn't got a method to get the whole length of a path. To do it, I've created a hidden SVG first. [This other page](https://css-tricks.com/svg-line-animation-works/) has a nice explanation about how the SVG path animation work.

The path is the Trans Mongolian train route [taken from here](http://gisforthought.com/trans-siberian-on-github) but redrawn, since the original is a multi line.
