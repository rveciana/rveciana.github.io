---
layout: post
title:  "Complex GIS calculations with gpu.js: Temperature interpolation"
date:   2018-09-01
teaser: complex-gis-calculations-gpujs.png
categories: other
tags: [GPU, gpujs, canvas, leaflet]
thumbnail: /images/other/complex-gis-calculations-gpu/twitter.png
twitter-card: summary
description: More complicated GIS calculations with the GPU on the browser
---
<script type="text/javascript" async
  src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML">
</script>

The [previous post I wrote][1] showed how to use the [gpu.js library][2] for drawing maps with JavaScript after calculating the values with the user's GPU.

While writting it, I was preparing [this conference][3] (in Spanish) for the 2018 edition of the ["Jornadas SIG Libre" at Girona][4]. The motivation of the talk was showing the possibilities of using the user's GPU instead of the server to make complex GIS calculations on the fly, so the speed could be much higher and the use of the server almost negligible.

The example
-----------

Some years ago, I made a python script that calculates the temperature and relative humidity on a raster, taking as the initial data the weather stations available at the [Catalan Meteorological Service][5]. The resulting product is still in use, specially to detect if the current precipitation is in form of rain or snow. There are [some papers about this][6] too.

The idea is, then, calculating a temperature field with a good resolution taking as input the weather station data. The example has several steps with intensive calculations, so it's a good study case for [gpu.js][2].

The temperature depends on many things, but fits quite well this formula:

$$ temperature = \beta_{0} + \beta_{1} * altitude + \beta_{2} * distanceToCoast $$

So, given the station temperatures in a given moment and knowing the altitude and distance to the coast for each station, a [multiple-linear regrssion][7] can be done to get a formula.

To calculate the multipl-linear regression, the [matricial formula is this one][9]:

$$ \hat{\beta}=(X^{T}X)^{-1}X^{T}y\\
\hat{y}=X\hat{\beta}$$

So there are matrix transpositions, matrix multiplications and other operations that are basic gpu.js examples. Anyway, this step uses only few values (we will be using about 180 weather stations), so I will use [numeric.js][8] that is still fast enough and simplifies the code.

Once the *beta values* are calculated, a temperature field can be created if the altitude and distance values for each pixel are known. This is quite fast to do in gpu.js.

The result will look like this:

<img src="{{ site.baseurl }}/images/other/complex-gis-calculations-gpu/first_temp.png"/>


The problem with stopping here is that we are assuming that the formula is valid for all the territory, but we know that some regions have their own particularities (some regions may be a bit hotter or colder than what the formula expect). Let's try to correct that with the *residues method*:

For each station, the real value is:

$$temperature = fit + residual$$

Using the matricial notation ,the errors or residuals are:

$$e=y-\hat{y}$$

Once we have the error in each point, we can interpolate them to create a *residuals field* that can be added to the original temperature calculation. To do it, we will use the inverse of the distance, which will give a result similar to:

<img src="{{ site.baseurl }}/images/other/complex-gis-calculations-gpu/inverse.png"/>

Finally, when adding the layer, some differences emerge:

<img src="{{ site.baseurl }}/images/other/complex-gis-calculations-gpu/final_result.png"/>

So, to create the final map, the following things must be calculated. We will use a 1000x1000 pixels so the calculation is long using the CPU:

* Calculation of the multiple linear regression
* Creation of the temperature raster from the regression formula (GPU 1000x1000 px)
* Residuals calculation
* Residuals interpolation (GPU 1000x1000 px)
* Final temperature field adding the temperature and residuals (GPU 1000x1000 px)
* Layer representation (GPU 1000x1000 px)

Links
-----

* [Previous post][1]
* [The gpu.js web site][2]
* [The  conference at the *Jornadas SIG Libre*][3] (in Spanish)
* [Jornadas SIG Libre][4] at Girona
* [Catalan Meteorological Service][5]
* [Conference paper about the product][6]
* [Multiple Linear Regression][7]
* [numeric.js][8]
* [Multiple linear regression formulas][9]

[1]: ../other/2018/04/30/mapping-with-gpujs.html
[2]: http://gpu.rocks
[3]: https://vimeo.com/album/5268941/video/278133346
[4]: http://www.sigte.udg.edu/jornadassiglibre/
[5]: http://meteo.cat
[6]: https://www.researchgate.net/publication/283479429_Verification_of_a_weather_radar_derived_surface_precipitation_type_product
[7]: http://www.stat.yale.edu/Courses/1997-98/101/linmult.htm
[8]: http://www.numericjs.com/
[9]: http://reliawiki.org/index.php/Multiple_Linear_Regression_Analysis