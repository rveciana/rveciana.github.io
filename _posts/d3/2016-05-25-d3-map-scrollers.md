---
layout: post
title:  "D3 map scrollers"
date:   2016-05-25
categories: d3
tags: [scroll]
teaser: d3-map-scrollers.png
description: Tutorial about scrolled animated maps
thumbnail: /images/d3/d3-scroller/twitter.png
twitter-card: summary
---
Scrollers are a cool way to show data visualizations in general, and maps where things happen in particular. I've been wanting to do one since I watched [this Mike Bostock example](http://www.nytimes.com/newsgraphics/2013/10/13/russia/), and now I've finally learned how to do it.

The simplest example
--------------------
The example is taken from [this Tony Chu's block](http://bl.ocks.org/tonyhschu/af64df46f7b5b760fc1db1260dd6ec6a). Scroll down to see how the Hayan typhoon track:

<iframe src="https://cdn.rawgit.com/rveciana/eeaa71659adbc88dc4165eaf99dcb9be/raw/4812ed4d7330335bed355a082742367b484b3048/index.html" width="700" height="400" scrolling="yes"></iframe>

The code is quite simple. Le'ts see first the css part:

{% highlight css %}
#container {
  position: relative;
  z-index: 100;
  height: 100vh; 
  overflow: scroll;
}
#sticky { 
  position: absolute; 
  top: 5vh; 
  right: 0; 
  width: 48%; 
  z-index: 50;
}
.panel {
  width: 100%;
  padding-left: 20px;
  padding-top: 25vh;
  padding-bottom: 25vh;
}
.panel p {padding-right: 50%;}
.panel:first-child {padding-top: 5vh;}
.panel:last-child {padding-bottom: 45vh;}
{% endhighlight %}

* *container* is will be the place where both the text will be placed. Note that we are using [vh units](http://www.w3schools.com/cssref/css_units.asp), which are in % of the viewport
* *sticky* is the place where the map will be placed. As its name indicates, it won't move. Note that is placed at the right part of the screen with the *right* tag.
* The *divs* with the class *panel* will have the content that scrolls. Note the *padding-top* and *padding-bottom* that are with vh units. This will be useful to maintain a separation when texts are short. Two secions with a single word would still make a nice visualization. The *padding-right* asserts that the content will be in two columns.

The html would be like this, but including the text:
{% highlight html %}
<div id="sticky"></div>
<div id="container">
  <div id="content">
    <div class="panel">
      <p>Your text here...</p>
    </div>

</div>
{% endhighlight %}

* Note the *content* node. It will be used to calculate the vertical length of all the sections (panel classed divs)

Let's see now the relevant JavaScript parts:
{% highlight javascript %}
var WIDTH = 0.9 * window.innerWidth / 2;
var HEIGHT = 0.9 * window.innerHeight;

var svg = d3.select("#sticky").append("svg")
    .attr('width', WIDTH)
    .attr('height', HEIGHT);

var body = d3.select('body').node();
var container = d3.select('#container');
var content = d3.select('#content');

var SCROLL_LENGTH = content.node().getBoundingClientRect().height - HEIGHT;
{% endhighlight %}

* The initial svg map width and height of the visible window are taken from the *window* object properties. The map will be half of the window width and all the height
* *SCROLL_LENGTH* is the amount of pixels you can scroll down. Since some content is already shown, it has to be calculated as the whole content height minus the viewport height which is already visible

{% highlight javascript %}
var hayanPathScale = d3.scale.linear()
        .domain([0, SCROLL_LENGTH])
        .range([0, haiyanPath.node().getTotalLength()])
        .clamp(true);
{% endhighlight %}

* The map is created as in [this example](http://bl.ocks.org/rveciana/8464690). The main change is that the animation won't be an interval but will be controlled by the scroller
* The scale relates which portion of the path must be drawn for each scrolled pixel. So the domain will be the scroll length (we can move from 0 to SCROLL_LENGTH pixels down the page), and the range is the path length (we can draw from 0 to all the path pixels)

{% highlight javascript %}
container
    .on("scroll.scroller", function() {
    newScrollTop = container.node().scrollTop
});

var setDimensions = function() {
        ...
      }
      
var render = function() {
if (scrollTop !== newScrollTop) {
  scrollTop = newScrollTop
  ...                             
}

window.requestAnimationFrame(render)
}
window.requestAnimationFrame(render)

window.onresize = setDimensions
{% endhighlight %}

Those are the functinos that controll the window resizing and scroll:

* When the *scroll.scroll* event happens in the *container* div, a new *newScrollTop* variable value is calculated
* *setDimensions* holds all what has to be done when the window is resized. The map has to look the same, so the scale must be changed, the size of the svg too, etc.
* *render* is the function that acts when the scroll is moved. The render is only done when *newScrollTop* changes, so we are not rendering the same all the time if the scroll doesn't change. Note that at the end of the function, the function is called again using [window.requestAnimationFrame(render)](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). The function is called too when the script is first loaded.
* *setDimensions* is fired with the *window.onresize* event

With these functions we can control a simple scroller. 

How does the *render* function look like:
{% highlight javascript %}
if (scrollTop !== newScrollTop) {
  scrollTop = newScrollTop
  
  haiyanPath
     .style('stroke-dashoffset', function(d) {
        return haiyanPath.node().getTotalLength() - hayanPathScale(scrollTop) + 'px';
      });
            
}

window.requestAnimationFrame(render)
{% endhighlight %}

* After checking if the newScrollTop has changed, the only thing to change is the *stroke-dashoffset* attribute. Take a look at [this web page](http://www.alolo.co/blog/2013/11/14/progressively-draw-svg-paths-with-d3js) to see how does it work

Now, let's see how the *setDimensions* function work:

{% highlight javascript %}
WIDTH = window.innerWidth / 2;
HEIGHT = window.innerHeight;
SCROLL_LENGTH = content.node().getBoundingClientRect().height - HEIGHT;

projection.scale(6*(WIDTH + 1) / 2 / Math.PI)
  .translate([WIDTH / 2, HEIGHT / 2]);

path.projection(projection);

landPath.attr("d", path);
countriesPath.attr("d", path);
graticulePath.attr("d", path);

haiyanPath
  .attr("d",pathLine(track));

hayanPathScale
  .domain([0, SCROLL_LENGTH])
  .range([0, haiyanPath.node().getTotalLength()]);

haiyanPath
  .style('stroke-dasharray', function(d) {
    var l = d3.select(this).node().getTotalLength();
    return l + 'px, ' + l + 'px';
   })
  .style('stroke-dashoffset', function(d) {
    return d3.select(this).node().getTotalLength() - hayanPathScale(scrollTop) + 'px';
  });
{% endhighlight %}

* The new WIDTH, HEIGHT and SCROLL_LENGTH valeus are calculated
* The projection must be changed to adapt its scale to the new dimensions. Then the *path* function must have the new projection
* The map layers must be redrawn using the new path function, by changing the *d* attribute
* The Hayan path is a bit more tricky, since not all the changes can be done at once
    * First, the new path is set. This will make it with a changed length. 
    * The scale has to be changed, so it takes the new path length. Bothe the domain and range are affected, since the scroll size changed too
    * Finally, the *stroke-dasharray* and *stroke-dashoffset* have to change too, with the new scroll and length values

Links
-----
* [Mike Bostock's visualization I liked in first place](http://www.nytimes.com/newsgraphics/2013/10/13/russia/)
* [Tony Chu's block where I took the basic code from](http://bl.ocks.org/tonyhschu/af64df46f7b5b760fc1db1260dd6ec6a)
* [A nice multi-section scroller](http://www.r2d3.us/visual-intro-to-machine-learning-part-1/)
* [So You Want to Build A Scroller](http://vallandingham.me/scroller.html), another good tutorial by Jim Vallandingham

* [How to create the Hayan Typhoon map](http://bl.ocks.org/rveciana/8463775)
* [Hayan animated path original example](http://bl.ocks.org/rveciana/8464690)
* [The block for the first example](http://bl.ocks.org/rveciana/eeaa71659adbc88dc4165eaf99dcb9be)
* [Progressively drawing SVG paths with D3.js](http://www.alolo.co/blog/2013/11/14/progressively-draw-svg-paths-with-d3js)
* Another animated paths example: [Animated arabic kufic calligraphy with D3](http://bl.ocks.org/rveciana/7664109)

