---
layout: post
title:  "gpu.js performance"
date:   2018-09-17
teaser: complex-gis-calculations-gpujs.png
categories: other
tags: [GPU, gpujs, cython]
thumbnail: /images/other/complex-gis-calculations-gpu/twitter.png
twitter-card: summary
description: Compare gpu.js with numpy and cython
---
In the [last post][1] we explained how to make a little more complex calculations with [gpu.js][2]. But, how efficient is?

The temperature calculation is a task I did many years ago, with pure python. Using pure python is a really bad idea in this case, having tools like numpy, cython, etc. The times were about 50 seconds or more, while gpu.js lasts about 1.5 seconds! More than an order of magnitude.

The code
--------

I made an [example script][3] to test the timing. The result should be the same [as in gpu.js][1], but I made the residuals interpolation calculations in different alternatives, two of them may be different.

To run the script you will need two things:

### Dependencies

My *pip list* command returns this:

    cycler (0.10.0)
    Cython (0.28.5)
    GDAL (2.3.1)
    matplotlib (2.2.3)
    numpy (1.15.1)
    scikit-learn (0.19.2)
    scipy (1.1.0)
    sklearn (0.0)

Basically, scikit-learn, with numpy and scipy plud the cython library. Also, matplotlib to plot the data.

To compile the cython part, there is a *setup.py* file that has to be run by:

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


Results
-------

In my computer, which is not a new or powerful one, the times were, for the common steps:


|Operation |Ellapsed time |
|---|---|
|Regression time|  3 ms |
|Temperature field time| 44 ms |
|Final field time| 2 ms |
|Drawing time| 402 ms |

With the different methods, the times were:

|Operation |Residuals field time |Total time |
|---|---|---|
|Rbf | 4101 ms|4551 ms |
|idw | 881 ms|1084 ms |
|cython |2571 ms |2775 ms |

So, in the first place, the residuals interpolation is, by far, the most expensive step. The IDW method I found is the fastest option, although I'm not sure that the result is as good as the cython method with the classical inverse of the distance.

Links
-----

* [Last post: Complex GIS calculations with gpu.js: Temperature interpolation][1]
* [The gpu.js web site][2]
* [scikit-learn multilinear regression][7]

* [The example script][3]
* [setup.py for cython][4]
* [The cython function][5]
* [idw file][6]


[1]: ../other/2018/09/17/gpujs-example.html
[2]: http://gpu.rocks
[3]: {{ site.baseurl }}/images/python/gpujs-performance/calculate_temp.py
[4]: {{ site.baseurl }}/images/python/gpujs-performance/setup.py
[5]: {{ site.baseurl }}/images/python/gpujs-performance/interpolate_residuals.pyx
[6]: {{ site.baseurl }}/images/python/gpujs-performance/idw.py
[7]: scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
