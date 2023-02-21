Example for the Stackoverflow question: [How can I contain D3 JS animation within a container](http://stackoverflow.com/questions/18025795/how-can-i-contain-d3-js-animation-within-a-container/18125767#18125767)

The balls use a modified version of the D3.js Force Layout. Parts of the code, such as the collision function are taken from Mike Bostock's example [Multi-Foci Force Layout](http://bl.ocks.org/mbostock/1804919).

The example lacks of a method to avoid the leak of circles when the collision algorithm and the container object detection act together.
