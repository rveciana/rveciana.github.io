---
layout: post
title: 'gpu.js performance'
date: 2018-09-18
teaser: gpujs-performance.png
categories: other
tags: [GPU, gpujs, cython]
thumbnail: /images/python/gpujs-performance/twitter.png
twitter-card: summary
description: Compare gpu.js with numpy and cython
---

In the [last post][1] we explained how to make a little more complex calculations with [gpu.js][2]. But, how efficient is?

The temperature calculation is a task I did many years ago, with pure python. Using pure python is a really bad idea in this case, having tools like numpy, cython, etc. The times were about 50 seconds or more, while gpu.js lasts about 1.5 seconds! More than an order of magnitude.

## The code

I made an [example script][3] to test the timing. The result should be the same [as in gpu.js][1], but I made the residuals interpolation calculations in different alternatives, two of them may be different.

To run the script you will need two things:

### Dependencies

My _pip list_ command returns this:

    cycler (0.10.0)
    Cython (0.28.5)
    GDAL (2.3.1)
    matplotlib (2.2.3)
    numpy (1.15.1)
    scikit-learn (0.19.2)
    scipy (1.1.0)
    sklearn (0.0)

Basically, scikit-learn, with numpy and scipy plus the cython library. Also, matplotlib to plot the data.

To compile the cython part, there is a _setup.py_ file that has to be run by:

    python setup.py build_ext --inplace

Now, by running

    python calculate_temp.py

You will get all the benchmarks

### Multi linear regression

To get the regression coefficients, I used scikit-learn:
{% highlight python %}
def calculate_regression(data_file):
regr = LinearRegression()

    with open(data_file) as f_p:
        data = load(f_p)
        temps = []
        predictors = []
        lats = []
        lons = []
        for station_data in data:
            temps.append(station_data['temp'])
            predictors.append([station_data['alt'], station_data['dist']])
            lats.append(station_data['lat'])
            lons.append(station_data['lon'])

        regr.fit(predictors, temps)
        score = regr.score(predictors, temps)
        residuals = regr.predict(predictors) - temps

        print("Multiple linear regression score: {}".format(score))
        return {'coefs': regr.coef_, 'intercept': regr.intercept_,
                'residuals': array(residuals),
                'lats': array(lats), 'lons': array(lons)}

{% endhighlight %}

Which is quite straightforward. Just prepare the data and [follow the docs][6].

Note that the residuals are created applying the regression to the original data:

    residuals = regr.predict(predictors) - temps

It's a clean and fast way to do it and allows to access the results later in the script.

### Applying the regression

Applying the regression results is easy with numpy, since it's just adding several matrices:
{% highlight python %}
def create*regression_field(regression, vars_file):
d_s = gdal.Open(vars_file)
distances = d_s.GetRasterBand(1).ReadAsArray()
altitudes = d_s.GetRasterBand(2).ReadAsArray()
temperature = (regression['intercept'] +
altitudes * regression['coefs'][0] +
distances \_ regression['coefs'][1])
return temperature
{% endhighlight %}

### Interpolating the residuals

Interpolating the residuals can be done in several ways. I've tested three, two after looking example around and the original I used both at my workplace and in the gpu.js example.

#### rbf

The [radial basis function][8] is the one most srecommended by scipy. The results can be a bit strange and the performance is poor, but:

{% highlight python %}
def rbf(regression, dimensions):
xi = linspace(regression['lons'].min(), regression['lons'].max(),
dimensions[1])
yi = linspace(regression['lats'].min(), regression['lats'].max(),
dimensions[0])
xi, yi = meshgrid(xi, yi)
xi, yi = xi.flatten(), yi.flatten()
interp = Rbf(regression['lons'], regression['lats'],
regression['residuals'], function='linear')

    residuals_field = interp(xi, yi).reshape(dimensions)
    return residuals_field

{% endhighlight %}

The code, basically prepares the data for the _Rbf_ function.

### idw

The inverse of the distance weighted code is [taken from a GitHub repo][9]. It's really efficient and the result is good, but more difficult to understand than the regular inverse of the distance. Also, maintains steep changes, which is not the best situation in our case, where we want a smooth residuals field all around, even if a single station has a different local value:

{% highlight python %}
def idw(regression, dimensions):
X1 = array(list(zip(regression['lons'], regression['lats'])))

    idw_tree = tree(X1, regression['residuals'])

    xi = linspace(regression['lons'].min(), regression['lons'].max(),
                  dimensions[1])
    yi = linspace(regression['lats'].min(), regression['lats'].max(),
                  dimensions[0])
    X2 = meshgrid(xi, yi)
    X2 = reshape(X2, (2, -1)).T
    z2 = idw_tree(X2)

    return z2.reshape(dimensions)

{% endhighlight %}

Again, the code is basically preparing the data for the function.

### Inverse of the distance using cython

This is the original code I used, and the one in the [previous post][1]. Calculating it with pure numpy was a bit difficult, so I made the original algorithm optimized with [cython][10], so it's as fast as coded in C. The code to call it is:

{% highlight python %}
def cython_id(regression, dimensions):

    data = {}

    for i in range(len(regression['lons'])):
        data[i] = {'x': regression['lons'][i],
                   'y': regression['lats'][i],
                   'value': regression['residuals'][i]}

    geotransform = [min(regression['lons']),
        (max(regression['lons']) - min(regression['lons']))/dimensions[1],
        0,
        max(regression['lats']),
        0,
        (min(regression['lats']) - max(regression['lats']))/dimensions[0]
    ]

    result = interpolate_residuals(data, dimensions, geotransform)
    return result

{% endhighlight %}
Note that I used geotransform, which turns things properly.

The cython code is:
{% highlight python %}
#cython: boundscheck=False, wraparound=False, nonecheck=False, cdivision=True

import numpy as np
cimport numpy as np
from libc.math cimport sqrt
from libc.math cimport pow
from cpython cimport array
import array

DTYPE = np.float64
ctypedef np.float64_t DTYPE_t

def interpolate_residuals(residues, size, geotransform):
cdef array.array da = array.array('d', [])
array.resize(da, size[0] \* size[1])
cdef double[:] cda = da

    xpos0 = []
    ypos0 = []
    values0 = []

    for key in residues.keys():
        xpos0.append(residues[key]['x'])
        ypos0.append(residues[key]['y'])
        values0.append(residues[key]['value'])

    cdef int N
    N = len(xpos0)
    #http://cython.readthedocs.io/en/latest/src/tutorial/array.html
    cdef array.array xpos = array.array('d', xpos0)
    cdef double[:] cxpos = xpos
    cdef array.array ypos = array.array('d', ypos0)
    cdef double[:] cypos = ypos
    cdef array.array values = array.array('d', values0)
    cdef double[:] cvalues = values

    cdef int i, j
    cdef int xsize = size[1]
    cdef int ysize = size[0]
    cdef double y
    cdef double x

    cdef array.array geotransform0 = array.array('d', geotransform)
    cdef double[:] cgeotransform = geotransform0

    for j in range(ysize):
        y = cgeotransform[3] + j * cgeotransform[5]
        for i in range(xsize):
            x = cgeotransform[0] + i * cgeotransform[1]
            cda[i + j * xsize] = point_residue(x, y, cxpos, cypos, cvalues, N)

    data_array = np.array(cda)
    return data_array.reshape(size)

cdef float point_residue(double x, double y, double[:] xpos, double[:] ypos, double[:] values, int N):
cdef int power = 2
cdef int smoothing = 0
cdef double numerator = 0
cdef int i
cdef double denominator
denominator = 0

    for i in range(N):
        dist = sqrt((x - xpos[i]) ** 2 + (
            y - ypos[i]) ** 2 + smoothing * smoothing)

        if dist < 0.00000000001:
            return values[i]
        numerator = numerator + (values[i] / pow(dist, power))
        denominator = denominator + (1 / pow(dist, power))

    if denominator != 0:
        return numerator / denominator

{% endhighlight %}

You have to run

    python setup.py build_ext --inplace

to compile it before running the script for the first time.

## Results

In my computer, which is not a new or powerful one, the times were, for the common steps:

| Operation              | Elapsed time |
| ---------------------- | ------------ |
| Regression time        | 3 ms         |
| Temperature field time | 44 ms        |
| Final field time       | 2 ms         |
| Drawing time           | 402 ms       |

With the different methods, the times were:

| Operation | Residuals field time | Total time |
| --------- | -------------------- | ---------- |
| Rbf       | 4101 ms              | 4551 ms    |
| idw       | 881 ms               | 1084 ms    |
| cython    | 2571 ms              | 2775 ms    |

So, in the first place, the residuals interpolation is, by far, the most expensive step. The IDW method I found is the fastest option, although I'm not sure that the result is as good as the cython method with the classical inverse of the distance.

The original gpu.js method lasted:

| Operation                      | Elapsed time |
| ------------------------------ | ------------ |
| Multiple linear regression     | 2 ms         |
| Calculate the regression field | 209 ms       |
| Calculate the residuals field  | 1084 ms      |
| Calculate the final field      | 52 ms        |
| Draw the regression field      | 65 ms        |
| Draw residuals field           | 70 ms        |
| Draw final result              | 67 ms        |
| **Total time**                 | **1549 ms**  |

So it's a really good performance if you think that it's run on the browser using a non compiled language (although using the GPU, of course!)

Finally, it would be nice to check the performance against python + GPU, but I have never worked with it.

## Links

- [Last post: Complex GIS calculations with gpu.js: Temperature interpolation][1]
- [The gpu.js web site][2]
- [scikit-learn multiple linear regression][7]

- [The example script][3]
- [setup.py for cython][4]
- [The cython function][5]
- [idw file][6]
- [The vars.tiff file][11]
- [The station data file][12]

- [radial basis function][8]
- [IDW library][9]
- [cython][10]

[1]: {{ site.baseurl }}/other/2018/09/17/gpujs-example.html
[2]: http://gpu.rocks
[3]: {{ site.baseurl }}/images/python/gpujs-performance/calculate_temp.py
[4]: {{ site.baseurl }}/images/python/gpujs-performance/setup.py
[5]: {{ site.baseurl }}/images/python/gpujs-performance/interpolate_residuals.pyx
[6]: {{ site.baseurl }}/images/python/gpujs-performance/idw.py
[7]: scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
[8]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.interpolate.Rbf.html
[9]: https://github.com/paulbrodersen/inverse_distance_weighting
[10]: http://cython.org/
[11]: {{ site.baseurl }}/images/python/gpujs-performance/vars.tiff
[12]: {{ site.baseurl }}/images/python/gpujs-performance/station_data.json
