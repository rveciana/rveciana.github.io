---
layout: ../../layouts/Post.astro
title: "Using RxPY to process GIS files dependencies"
pubDate: 2021-10-12
teaser: rxpy.png
categories: python
tags: [RxPy]
thumbnail: /images/python/rxpy/twitter.png
twitter-card: summary
description: Download and merge SRTM data to create a DEM
---

[Reactive programming][reactivex] is amazing. Hard to understand when you first see it, it solves problems that are really difficult to code without it. It's available in many languages and very well-known by AngularJS users, because it makes an extensive use of it.

# The problem

Let's see what's reactive programming before seeing a "real" use case. The easiest way to define it (for me) is comparing it to an Excel file:
<img src="{{ site.baseurl }}/images/python/rxpy/spreadsheet.png" />

- The first two columns are independent values
- Columns C and D depend on A and B
- Column E depends on column D
- Note that some columns are _subscribed_ to other columns and that all any column can be _subscribed_ by others.
- Values in E depend on D, which depends on A and B, but E doesn't know or better, doesn't care about this.
  - You can change the formula for D and E will still work.

Let's imagine a GIS example now. [pypros][pypros] is a software I contributed in some time ago when working at the Catalan Meteorological Service.

Basically, it takes the temperature field, the relative humidity (or dew point temperature), the radar signal and outputs a file where each pixel has a value depending on the type of precipitation. You can [see it in action here][plujaoneu].

<img src="{{ site.baseurl }}/images/python/rxpy/flow.png" />

- With temperature and the Dew point, we get what would happen if there was precipitation in a given point
- With the previous result and the radar image, we can get the final product
- The main problem to code this is that the frequencies aren't equal for all the fields, so coding it directly means remembering the latest processed images and so on
- Complicating the diagram is easy with reactive programming because each step will be watching only the interesting observables

# The code

As usual, you can [get the code at GitHub][code].

So the first thing to do is act when some file appears. The file could be a temperature, dew point or radar file. To do it, we'll use the [_watchdog_ library][watchdog]

{% highlight python %}import time
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
from observables import source

class MyHandler(FileSystemEventHandler):
def next_source(self, path):
source.on_next(path)
def on_created(self, event):
self.next_source(event.src_path)
def on_modified(self, event):
self.next_source(event.src_path)

if **name** == "**main**":
path = './data'
event_handler = MyHandler()
observer = Observer()
observer.schedule(event_handler, path, recursive=True)
observer.start()
try:
while True:
time.sleep(1)
finally:
observer.stop()
observer.join()
{% endhighlight %}

- The _Observer_ object will call the methods in _MyHandler_ when some change occurs in the path
- _source_ is the RxPY thing that we'll see next. When something changes, the _on_next_ method is called with the path for the file that changed

Let's see now a first version of the _RxPY_ part
{% highlight python %}import time
from os.path import basename
from pathlib import Path
import rx
from rx import operators as ops
from rx.subject import Subject

def get_date(x):
return x.split("-")[1].replace(".tiff","")

def process*potential_ros(x):
print("CREATING POTENTIAL ROS", './data/pot_pon*'+get*date(x[0])+"-"+get_date(x[1])+".tiff")
time.sleep(1)
Path('./data/pot_ros*'+get_date(x[0])+"-"+get_date(x[1])+".tiff").touch()

def process*ros(x):
print("CREATING ROS FILE", './data/pon*'+get*date(x[0])+"-"+get_date(x[1])+".tiff")
time.sleep(1)
Path('./data/ros*'+get_date(x[0])+"-"+get_date(x[1])+".tiff").touch()

source = Subject()

td = source.pipe(ops.filter(lambda text: text.find('td')>=0))
temp = source.pipe(ops.filter(lambda text: text.find('temp')>=0))
radar = source.pipe(ops.filter(lambda text: text.find('radar')>=0))
pot_ros = source.pipe(ops.filter(lambda text: text.find('pot_ros')>=0))

rx.combine_latest(temp, td).subscribe(process_potential_ros)
rx.combine_latest(pot_ros, radar).subscribe(process_ros)
{% endhighlight %}

- The first functions are just mock functions that simulate the creation of the actual files. That's why the _time.sleep()_ is there
- _source_ is a _Subject_, that can recieve the _on_next_ method and be subscribed. Basically, whan any file changes, the _source_ will emit its path
- The next lines are _observables_ subscribed to source. They filter the path so they will only emit when the string appears in the path. To when a temperature file appears, the path is emitted by _temp_
- Finally, _combine_latest_ takes two observables and emits an event with the latest values for each one. You can [check the diagram here][combine_latest]
  - The first one creates the _potential RoS_ file that will trigger the _source_ again, because it creates a file
  - The second one takes the previpusly created file and the radar to create the final image

The output is something similar to:
{% highlight python %}
CREATING POTENTIAL ROS ./data/pot_pon_202101010000-202101010000.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010000.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010006.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010012.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010018.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010024.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010030.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010036.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010042.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010048.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010054.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010100.tiff
CREATING POTENTIAL ROS ./data/pot_pon_202101010100-202101010000.tiff
CREATING POTENTIAL ROS ./data/pot_pon_202101010100-202101010100.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010106.tiff
CREATING ROS FILE ./data/pon_202101010000-202101010106.tiff
CREATING ROS FILE ./data/pon_202101010100-202101010106.tiff
{% endhighlight %}

To do it, I created a file that generates radar and temperature and td files like this:

{% highlight python %}from pathlib import Path
import time

Path('./data/temp-202101010000.tiff').touch()
time.sleep(1)
Path('./data/radar-202101010000.tiff').touch()
time.sleep(1)
Path('./data/td-202101010000.tiff').touch()
time.sleep(1)
Path('./data/radar-202101010006.tiff').touch()
...
{% endhighlight %}

# Improving the code by using more RxPY

The previous code has three problems (at least)

1. The _Potential Rain Or Snow_ is saved in a file. This is not wring but it's an intermediate step and maybe we don't want to save it
2. There are two _Potential Rain Or Snow_ created at the end. This is because _combine_latest_ will emit twice when eiter Td or Temperature appear. Usually, we only want this to be created if the dates for both files are identical (they should appear more or less at the same time)
3. _time.sleep()_ will block the process. If the file generation lasts a lot, some events will have to wait. It would be much nicer if this calculation happens in another process and when is finished, emits the event (or saves the file)

To solve the first point, we'll use _map_, that converts the input value to another thing, as in functional programming:

{% highlight python %}pot_ros = rx.combine_latest(temp, td).pipe(ops.map(create_pot_data)){% endhighlight %}

Then, when subscribing to the _pot_ros observable_ we could receive the calculated field (calculated in _create_pot_data_) without having to save

To avoid _create_pot_data_ to be run twice when _td_ and _temperature_ are different, a filter can be used:

{% highlight python %}pot_ros = rx.combine_latest(temp, td).pipe(ops.filter(lambda values: get_date(values[0])==get_date(values[1])), ops.map(create_pot_data)){% endhighlight %}

This way, only the elements that match the filter function will pass to the map.

Finally, to solve the process blocking, we can add a _ops.subscribe_on(thread_pool_scheduler)_. This will make each subscription to run in a different process. I added a long sleep time to the file creation to show that in the same pipe, everything i in the same process. Probably this can be avoided with[_flat_map_ and _from_future_][from_future], but I'm not sure that it's a nice feature in a real case.

{% highlight python %}import multiprocessing
import time
from os.path import basename
from pathlib import Path

import rx
from rx import operators as ops
from rx.core.typing import Observable
from rx.scheduler import ThreadPoolScheduler
from rx.subject import Subject

thread_count = multiprocessing.cpu_count()
thread_pool_scheduler = ThreadPoolScheduler(thread_count)
print("Cpu count is : {0}".format(thread_count))

def get_date(x):
return x.split("-")[1].replace(".tiff","")

def process*ros(x):
fut = asyncio.create_task(foo())
def when_finished(\_fut):
print("CREATING ROS FILE", x)
time.sleep(10)
Path('./data/ros*'+x[0]+"-"+get_date(x[1])+".tiff").touch()
fut.add_done_callback(when_finished)

def create_pot_data(x):
print("CREATING POT ROS DATA", x)
time.sleep(1)
return get_date(x[0])

source = Subject()

td = source.pipe(ops.filter(lambda text: text.find('td')>=0), ops.subscribe_on(thread_pool_scheduler))
temp = source.pipe(ops.filter(lambda text: text.find('temp')>=0), ops.subscribe_on(thread_pool_scheduler))
radar = source.pipe(ops.filter(lambda text: text.find('radar')>=0))

pot_ros = rx.combine_latest(temp, td).pipe( ops.filter(lambda values: get_date(values[0])==get_date(values[1])), ops.map(create_pot_data), ops.subscribe_on(thread_pool_scheduler))
rx.combine_latest(pot_ros, radar).subscribe(process_ros, scheduler=thread_pool_scheduler)
{% endhighlight %}

# Links

- [Post code on GitHub][code]
- [ReactiveX][reactivex]
- [PyPROS, precipitation type calculation: rain or snow][pypros]
- [Rain or snow operative output][plujaoneu]
- [Watchdog library][watchdog]
- [Rx Marbles site][rxmarbles]
- [_combine_latest_ diagram][combine_latest]
- [RxPY parallel threads][rxpy_parallel_threads]
- [_from_future_ example][from_future]

[code]: https://github.com/rveciana/rxpyexample
[reactivex]: http://reactivex.io/
[pypros]: https://github.com/meteocat/pypros
[plujaoneu]: https://www.meteo.cat/observacions/plujaONeu
[watchdog]: https://python-watchdog.readthedocs.io/en/stable/
[rxmarbles]: https://rxmarbles.com/
[combine_latest]: https://rxmarbles.com/#combineLatest
[rxpy_parallel_threads]: https://stackoverflow.com/questions/43989153/how-to-wait-for-rxpy-parallel-threads-to-complete
[from_future]: https://rxpy.readthedocs.io/en/latest/get_started.html
