More experiments with audio and D3js. The idea was reproducing the famous cover by Joy Division, animating it with the music.

Since the regular *frequencyData* data is too flat to get a nice result, I calculate the difference with the previous values, so it gives nice peaks. The graph means more or less nothing!

The music is taken from this site, because it's free (and I liked this one). It's a pitty not using the original album:

http://freemusicarchive.org/music/The_Orientalist/1000_Sounds_Lotus/Islamatronic_cantilliation_1461

I took information from these pages aboud web audio:

* http://bl.ocks.org/eesur/6ad4ee84c81b664353a7
* https://www.bignerdranch.com/blog/music-visualization-with-d3-js/

To create the app.js file, just run 
    
    browserify index.js > app.js
