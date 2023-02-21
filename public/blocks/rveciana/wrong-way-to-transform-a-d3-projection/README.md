***Actualization***
This behaviour has been corrected and now the example is valid, since the points are ordered the same way in both projections.

From the mailing list:
> OK, this has been fixed in release 3.1.4, so you'll no longer need the
work-around described in my previous email. Enjoy, and thank you for
the bug report!

> http://bl.ocks.org/mbostock/580de8199ea3b85f822a


***Initial message***
This example shows how a projection change must NOT be done.
It works properly when the D3 version is 3.0.8, but from 3.1.0, the change does strange things. 
Just change the D3 source at line 13 to https://raw.github.com/mbostock/d3/v3.1.2/d3.min.js to see the effects.

I asked the question [at the D3 mailing list] (https://groups.google.com/forum/?fromgroups=#!topic/d3-js/9j37YsWU6bM).

As Mike Bostock answered:

> The issue you are seeing is that projections apply adaptive resampling (as of D3 3.0, which was released last December). Therefore the number of control points for the same geometry may differ when different projections are used, and thus you cannot apply naive path interpolation to transition between two projections.

Mike Bostock [has a working example](http://bl.ocks.org/mbostock/3711652), and Jason David [has an other one] (https://www.jasondavies.com/maps/transition/)
