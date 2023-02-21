
var d3_shape = require("d3-shape");
var d3_selection = require("d3-selection");

var width = 500;
var height = 500;
var dataPerLine = 30;
var lines = 60;
var playing = false;

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var audioElement = document.getElementById('audioElement');
    var audioSrc = audioCtx.createMediaElementSource(audioElement);
    var analyser = audioCtx.createAnalyser();

    audioSrc.connect(analyser);
    audioSrc.connect(audioCtx.destination);

    var frequencyData = new Uint8Array(lines);


var canvas = d3_selection.select("body")
    .append("canvas")
    .attr('height', height)
    .attr('width', width);

var context = canvas.node().getContext("2d");

var line = d3_shape.line()
    .x(function(d, i){return width/4 + (i/dataPerLine)*width/2;})
    .y(function(d, i){return -d * Math.sin(Math.PI * i/dataPerLine);})
    .context(context);

var area = d3_shape.area()
    .x(function(d, i){return width/4 + (i/dataPerLine)*width/2;})
    .y1(function(d, i){return -d * Math.sin(Math.PI * i/dataPerLine);})
    .y0(40)
    .context(context);


var data = [];
for (var i = 0; i < lines; i++) {
    var dataElements = [];
    for (var j = 0; j < dataPerLine; j++) {
        dataElements.push(0);
    }
    data.push(dataElements);
  }

 

function renderChart() {
     requestAnimationFrame(renderChart);

     // Copy frequency data to frequencyData array.
     analyser.getByteFrequencyData(frequencyData);
     for(var i = 0; i < lines; i++){
         data[i].push(frequencyData[i]);
         data[i].shift();
     }

    
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    context.lineWidth = 1.6;
    context.strokeStyle = "#dddddd";
    context.fillStyle = "#000000";
    for(var i = 0; i < lines; i++){
            context.save();

            context.translate(0,((height/5) + (i/lines)*3*height/5));
            context.beginPath();
            area(data[i].map(function(curr, i, arr){return i>0?curr - arr[i-1]:0;}));
            context.fill();
            context.beginPath();
            line(data[i].map(function(curr, i, arr){return i>0?curr - arr[i-1]:0;}));
            context.stroke();


            context.restore();
        }

  }

  // Run the loop
  renderChart();
 
  canvas.on("click", togglePlay);
  

  function togglePlay(){
    if(playing===false){
        audioElement.play();
        playing = true;
    } else {
        audioElement.pause();
        playing = false;
    }
  }

  togglePlay();
  