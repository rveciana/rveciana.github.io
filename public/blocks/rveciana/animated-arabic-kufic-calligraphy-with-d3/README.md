[Kufic calligraphy](http://www.kufic.info/default.htm) has impressed me since long ago. This example is from the walls of the [Gudi Khatun Mausoleum](http://en.wikipedia.org/wiki/Garabaghlar_Mausoleum) in [Nakhchivan, Azerbaijan](https://maps.google.es/maps?q=Nakhchivan&hl=ca&ie=UTF8&sll=38.377416,27.132204&sspn=0.026847,0.038581&t=h&hnear=Nax%C3%A7%C4%B1van,+Nakhchivan+Autonomous+Republic,+Azerbaidjan&z=13).

![Gudi Khatun Mausoleum](http://static.panoramio.com/photos/large/2149671.jpg "Gudi Khatun")


The text is animated in the correct order to understand how the words are ordered. The meaning of the text is
> There is no God but God, and Muhammad is His prophet. May God bless him.

First, I made the SVG image from the pictures I found. The elements must be lines so they can be animated this way. That's why kufic calligraphy is good for the example, since all the strokes have the same width. 

Once the SVG was made, I rotated and scaled, and added to the HTML. Every path was assigned an id of the form *id="p14"*, where the number has to go in the order we want to draw the strokes.

The function *drawStroke* selects the stroke and changes the *stroke-dashoffset* as shown in [this example](http://www.alolo.co/blog/2013/11/14/progressively-draw-svg-paths-with-d3js).



