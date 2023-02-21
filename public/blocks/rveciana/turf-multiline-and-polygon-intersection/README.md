The [previous example](https://bl.ocks.org/rveciana/62367908105448366d38f169e5bd3893) showed how to intersect a line with a polygon, but the situations can be more complicated, as shown in this example.

The solution is using the [lineSplit](http://turfjs.org/docs#lineSplit) function for each part of the multilinestring and selecting the ones that fit the needs. The first part can be inside or outside the polygon, depending on the first point. Detecting this, is easy to get only the needed parts.
