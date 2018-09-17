---
layout: post
title:  "gpu.js performance"
date:   2018-09-01
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

I made an example script 

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
|Rbf | 4101 ms|4551 ms |
|idw | 881 ms|1084 ms |
|cython |2571 ms |2775 ms |

So, in the first place, the residuals interpolation is, by far, the most expensive step. The IDW method I found is the fastest option, although I'm not sure that the result is as good as the cython method with the classical inverse of the distance.

Links
-----

* [Last post: Complex GIS calculations with gpu.js: Temperature interpolation][1]
* [The gpu.js web site][2]


[1]: ../other/2018/09/17/gpujs-example.html
[2]: http://gpu.rocks

