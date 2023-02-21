This example, inspired from Mike Bostock's [Non-contiguous](http://bl.ocks.org/mbostock/4055908) catrogram example, shows the percentage of people in Catalonia able to speak in Catalan in every *comarca* (data from [IDESCAT](http://www.idescat.cat/)).

But the Catalan population is not evenly distributed, but concentrated around Barcelona and surroundings. So comparing the region colors can lead to wrong conclusions, since they don't represent comparable amount of people.

When the *Resize to population density* button is pressed, the size of each *coamrca* is reduced according to its population density. The maximum density corresponds to the *Barcelonès*, which is not reduced. When the sizes are changed is much easier to compare the number of people.

The size is not reduced linearly, but applying the square root, because Catalonia is so unevenly populated that it was difficult so see anything outside Barcelona's region.

