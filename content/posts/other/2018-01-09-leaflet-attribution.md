---
layout: post
title: 'Leaflet Attribution'
date: 2018-01-08
categories: other
tags: [leaflet]
teaser: leaflet-attribution.png
description: Change leaflet attributions dynamically
thumbnail: /images/other/leaflet-attribution/twitter.png
twitter-card: summary
---

This is a fast tip post I wrote for myself so I can remember this situation. Leaflet makes easy to add attributions (usually) at the bottom right of the map. [The docs](http://leafletjs.com/reference-1.2.0.html#control-attribution) show three methods:

- setPrefix(<String> prefix): Changes the _Leaflet_ link to the desired one
- addAttribution(<String> text): Adds a new attribution text after the leaflet link. If called multiple times, the texts are separated by commas
- removeAttribution(<String> text): Removes the indicated attribution. You must know the text to remove

So what happens when you want to erase all the current attributions to add new ones? A use case could be when each layer must have different attributions. There are two options:

1.- Store the added attributions and call _removeAttribution_ as many times as needed
2.- Reset the internal variable:

Looking at [the code](https://github.com/Leaflet/Leaflet/blob/master/src/control/Control.Attribution.js), there is a variable named _\_attributions_, which is a key-value object. The keys are the attribution texts and the values the position numbers.

Removing all the attributions, then is as easy as:

{% highlight js %}
leafletMap.attributionControl.\_attributions = {};
leafletMap.attributionControl.addAttribution("New attribution");
{% endhighlight %}
