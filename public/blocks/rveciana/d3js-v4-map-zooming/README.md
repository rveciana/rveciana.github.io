I didn't find a good example on zooming a map with d3 version 4.

The idea is that when moving the mouse wheel, the location pointed by the mouse stays at the same place to avoid the weird sensation that happens when the map is not translated and it's zoomed at the current center.

The code isn't very nice, but I think that explains well a working solution. It would be better using the *d3-zoom*, but I didn't find the way.