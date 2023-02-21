Creating visualizations like [this one](http://bl.ocks.org/rveciana/8464690) but using canvas is possible.

Since the Canvas element hasn't got the *getTotalLength()* method as it exists in SVG, I'm using the [point-at-length](https://github.com/substack/point-at-length) library, that calculates exactly this.

The library is designed to be used only from *nodejs*, but using browserify (as in [this post](http://www.ryandaigle.com/a/expose-javascript-api-with-browserify)), this is not a ptoblem:

    browserify index.js --standalone Points > point-at-length.js

In [a previous version](http://bl.ocks.org/rveciana/502db152b70cddfd554e9d48ee23e279) of the block, I created an SVG element to use the *getTotalLength()* method, which is much less elegant and can't be used in a *nodejs* environment.

The library doesn't give an exact value, I'll have to investigate more...

The path is the Trans Mongolian train route [taken from here](http://gisforthought.com/trans-siberian-on-github) but redrawn, since the original is a multi line.
