(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Points = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var parse = require('parse-svg-path');
var isarray = require('isarray');
var abs = require('abs-svg-path');

module.exports = Points;

function Points (path) {
    if (!(this instanceof Points)) return new Points(path);
    this._path = abs(isarray(path) ? path : parse(path));
}

Points.prototype.at = function (pos, opts) {
    return this._walk(pos, opts).pos;
};

Points.prototype.length = function () {
    return this._walk(null).length;
};

Points.prototype._walk = function (pos, opts) {
    var cur = [ 0, 0 ];
    var prev = [ 0, 0, 0 ];
    var len = 0;
    var fudge = 1.045;
    if (typeof pos === 'number') pos *= fudge;
    
    for (var i = 0; i < this._path.length; i++) {
        var p = this._path[i];
        if (p[0] === 'M') {
            cur[0] = p[1];
            cur[1] = p[2];
            if (pos === 0) {
                return { length: len, pos: cur };
            }
        }
        else if (p[0] === 'C') {
            prev[0] = cur[0];
            prev[1] = cur[1];
            prev[2] = len;
            
            var n = 100;
            for (var j = 0; j <= n; j++) {
                var t = j / n;
                var x = xof_C(p, t);
                var y = yof_C(p, t);
                len += dist(cur[0], cur[1], x, y);
                
                cur[0] = x;
                cur[1] = y;
                
                if (typeof pos === 'number' && len >= pos) {
                    var dv = (len - pos) / (len - prev[2]);
                    
                    var npos = [
                        cur[0] * (1 - dv) + prev[0] * dv,
                        cur[1] * (1 - dv) + prev[1] * dv
                    ];
                    return { length: len, pos: npos };
                }
                prev[0] = cur[0];
                prev[1] = cur[1];
                prev[2] = len;
            }
        }
        else if (p[0] === 'Q') {
            prev[0] = cur[0];
            prev[1] = cur[1];
            prev[2] = len;
            
            var n = 100;
            for (var j = 0; j <= n; j++) {
                var t = j / n;
                var x = xof_Q(p, t);
                var y = yof_Q(p, t);
                len += dist(cur[0], cur[1], x, y);
                
                cur[0] = x;
                cur[1] = y;
                
                if (typeof pos === 'number' && len >= pos) {
                    var dv = (len - pos) / (len - prev[2]);
                    
                    var npos = [
                        cur[0] * (1 - dv) + prev[0] * dv,
                        cur[1] * (1 - dv) + prev[1] * dv
                    ];
                    return { length: len, pos: npos };
                }
                prev[0] = cur[0];
                prev[1] = cur[1];
                prev[2] = len;
            }
        }
        else if (p[0] === 'L') {
            len += dist(cur[0], cur[1], p[1], p[2]);
            if (typeof pos === 'number' && len >= pos) {
                var dv = (len - pos) / (len - prev[2]);
                var npos = [
                    cur[0] * (1 - dv) + p[0] * dv,
                    cur[1] * (1 - dv) + p[1] * dv
                ];
                return { length: len, pos: npos };
            }
            cur[0] = p[1];
            cur[1] = p[2];
            prev[0] = cur[0];
            prev[1] = cur[1];
            prev[2] = len;
        }
    }
    return { length: len / fudge, pos: cur };
    
    function xof_C (p, t) {
        return Math.pow((1-t), 3) * cur[0]
            + 3 * Math.pow((1-t), 2) * t * p[1]
            + 3 * (1-t) * Math.pow(t, 2) * p[3]
            + Math.pow(t, 3) * p[5]
        ;
    }
    function yof_C (p, t) {
        return Math.pow((1-t), 3) * cur[1]
            + 3 * Math.pow((1-t), 2) * t * p[2]
            + 3 * (1-t) * Math.pow(t, 2) * p[4]
            + Math.pow(t, 3) * p[6]
        ;
    }

    function xof_Q (p, t) {
        return Math.pow((1-t), 2) * cur[0]
            + 2 * (1-t) * t * p[1]
            + Math.pow(t, 2) * p[3]
        ;
    }
    function yof_Q (p, t) {
        return Math.pow((1-t), 2) * cur[1]
            + 2 * (1-t) * t * p[2]
            + Math.pow(t, 2) * p[4]
        ;
    }
};

function dist (ax, ay, bx, by) {
    var x = ax - bx;
    var y = ay - by;
    return Math.sqrt(x*x + y*y);
}

},{"abs-svg-path":2,"isarray":3,"parse-svg-path":4}],2:[function(require,module,exports){

module.exports = absolutize

/**
 * redefine `path` with absolute coordinates
 *
 * @param {Array} path
 * @return {Array}
 */

function absolutize(path){
	var startX = 0
	var startY = 0
	var x = 0
	var y = 0

	return path.map(function(seg){
		seg = seg.slice()
		var type = seg[0]
		var command = type.toUpperCase()

		// is relative
		if (type != command) {
			seg[0] = command
			switch (type) {
				case 'a':
					seg[6] += x
					seg[7] += y
					break
				case 'v':
					seg[1] += y
					break
				case 'h':
					seg[1] += x
					break
				default:
					for (var i = 1; i < seg.length;) {
						seg[i++] += x
						seg[i++] += y
					}
			}
		}

		// update cursor state
		switch (command) {
			case 'Z':
				x = startX
				y = startY
				break
			case 'H':
				x = seg[1]
				break
			case 'V':
				y = seg[1]
				break
			case 'M':
				x = startX = seg[1]
				y = startY = seg[2]
				break
			default:
				x = seg[seg.length - 2]
				y = seg[seg.length - 1]
		}

		return seg
	})
}

},{}],3:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],4:[function(require,module,exports){

module.exports = parse

/**
 * expected argument lengths
 * @type {Object}
 */

var length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0}

/**
 * segment pattern
 * @type {RegExp}
 */

var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig

/**
 * parse an svg path data string. Generates an Array
 * of commands where each command is an Array of the
 * form `[command, arg1, arg2, ...]`
 *
 * @param {String} path
 * @return {Array}
 */

function parse(path) {
	var data = []
	path.replace(segment, function(_, command, args){
		var type = command.toLowerCase()
		args = parseValues(args)

		// overloaded moveTo
		if (type == 'm' && args.length > 2) {
			data.push([command].concat(args.splice(0, 2)))
			type = 'l'
			command = command == 'm' ? 'l' : 'L'
		}

		while (true) {
			if (args.length == length[type]) {
				args.unshift(command)
				return data.push(args)
			}
			if (args.length < length[type]) throw new Error('malformed path data')
			data.push([command].concat(args.splice(0, length[type])))
		}
	})
	return data
}

var number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig

function parseValues(args) {
	var numbers = args.match(number)
	return numbers ? numbers.map(Number) : []
}

},{}]},{},[1])(1)
});