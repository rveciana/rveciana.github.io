var MidiPlayer = require('midi-player-js');
var request = require("d3-request");
var d3_selection = require("d3-selection");
var d3_transition = require("d3-transition");
var d3_ease = require("d3-ease");
var d3_scale = require("d3-scale");
var d3_interpolate = require("d3-interpolate");
var d3_color = require("d3-color");


var width = 960;
var height = 500;

var svg = d3_selection.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var color = d3_scale.scaleLinear().domain([45,75])
      .interpolate(d3_interpolate.interpolateHcl)
      .range([d3_color.rgb("#007AFF"), d3_color.rgb('#FFF500')]);

// Initialize player and register event handler 
var Player = new MidiPlayer.Player(function(event) {
    //console.log(event);
    /**Object { track: 6, delta: 1, tick: 47040, 
     * running: true, noteNumber: 54,
     *  noteName: "Gb3", velocity: 88, 
     * name: "Note on", channel: 6 }  app.js:2025:5 */
    if(event.name=="Note on"){
         //http://localhost/gist/audio/jesu/
        var elLength = 40*(event.delta<=1?1:event.delta/120);
        var element = svg.append("g");
        element.attr("transform","translate("+(-1*elLength)+" 0)");
        element.append("rect")
            .attr("width", elLength)
            .attr("height", 20)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("x", 0)
            .attr("y", (event.noteNumber - 45)*12)
            .attr("fill", color(event.noteNumber));

        element.append("text")
            .attr("x", 3)
            .attr("y", 15 + (event.noteNumber - 45)*12)
            .text(event.noteName);


        var t = d3_transition.transition()
            .duration(4000)
            .ease(d3_ease.easeLinear);
        element.transition(t)
            .attr("transform","translate("+(width+300-elLength)+" 0)")
            .remove();
    }
});
 
// Load a MIDI file 

request.request("Bach_JmF.mid")
.responseType('arraybuffer')
.get(function(error, midiData){
    
    Player.loadArrayBuffer(midiData.response);
    var timeInfo = Player.getDivision()
    Player.play();
    //var sisi = Player.getEvents();
    //console.info(sisi);
    console.info(Player.getDivision());
});



