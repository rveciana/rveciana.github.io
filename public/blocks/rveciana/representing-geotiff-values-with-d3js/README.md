This example shows how to represent a GeoTIFF raster directly into a Canvas object.

Here you have a question about how to set pixels: http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas the way used in the example draws all the pixels at once, since is much more efficient.

Note that using the *Math.round* function, the example will work if the original GeoTIFF has more pixels than the output image. Also, drawing small rectangles would be less efficient.

The color scales from D3js aren't used, since the performance is very poor. It's still a problem, since the ColorBrewer scales are much better than this, but difficult to calculate.
