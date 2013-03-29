var stream = require('stream');
var util = require('util');
var path = require('path');
var cat = require('../');
var sink = require('stream-sink')
var split = require('split');

var files = [
    'a.txt',
    'b.txt',
    'c.txt'
];
files = files.map(function(file) {
    return path.resolve(__dirname, file);
})

exports.testTextFiles = function(test) {
    var c = cat();
    var s = sink();
    // using split to ignore new lines
    c.pipe(split()).pipe(s).on('data', function(data) {
        test.equal('abc', data, "Content should be abc");
        test.done();
    });
    c.end(files.join('\n'));
}

exports.testTextFilesSeparator = function(test) {
    var c = cat({
        separator: ':'
    });
    var s = sink();
    // using split to ignore new lines
    c.pipe(split()).pipe(s).on('data', function(data) {
        test.equal('abc', data, "Content should be abc");
        test.done();
    });
    c.end(files.join(':'));
}

exports.testDelayedWrites = function(test) {
    var c = cat();
    var s = sink();
    c.pipe(split()).pipe(s).on('data', function(data) {
        test.equal('abc', data, "Content should be abc");
        test.done();
    });
    var filesToWrite = files.slice();
    var to = setInterval(function() {
        var f = filesToWrite.shift();
        if(f) {
            c.write(f + '\n');
        }
        else {
            c.end();
            clearInterval(to);
        }
    }, 400);
}

exports.testTransformStream = function(test) {
    function uppercase () {
        if(!(this instanceof uppercase)) return new uppercase();
        stream.Transform.apply(this);
    }
    util.inherits(uppercase, stream.Transform);
    uppercase.prototype._transform = function(chunk, encoding, callback) {
        this.push(chunk.toString('utf8').toUpperCase());
        callback();
    }

    var c = cat(uppercase);
    var s = sink();

    c.pipe(split()).pipe(s).on('data', function(data) {
        test.equal('ABC', data, "Content should be ABC");
        test.done();
    });
    c.end(files.join('\n'));
}
