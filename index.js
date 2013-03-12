var util = require('util');
var fs = require('fs');
var stream = require('stream');
var split = require('split');

function FileStream (encoding, transformer, options) {
    var args = [].slice.call(arguments);
    var arg;
    while(arg = args.shift()) {
        switch(typeof arg) {
            case 'string':
                if(this._encoding) {
                    throw new TypeError('unexpected parameter of type ' + typeof arg);
                }
                this._encoding = arg
                break;

            case 'function':
                if(this._transformer) {
                    throw new TypeError('unexpected parameter of type ' + typeof arg);
                }
                this._transformer = arg;
                break;

            case 'object':
                if(this._options) {
                    throw new TypeError('unexpected parameter of type ' + typeof arg);
                }
                this._options = arg;
                break;

            default:
                throw new TypeError('unexpected parameter of type ' + typeof arg);
                break;
        }
    }

    stream.Transform.call(this, this._options);
    if(this._options) this._separator = this._options.separator;
    this._queue = [];
    this._split = split(this._separator);
    this._split.on('data', this._onFilename.bind(this));
}
util.inherits(FileStream, stream.Transform);

FileStream.prototype._transform = function _transform(chunk, encoding, callback) {
    this._split.write(chunk, encoding, callback);
};

FileStream.prototype._flush = function _flush(callback) {
    this._split.end();
    if(this._queue.length === 0) {
        return callback();
    }
    else {
        this._queue[this._queue.length -1].on('end', callback);
    }
};

FileStream.prototype._onFilename = function _onFilename(filename) {
    if(filename.trim() == '') return;

    var self = this;
    var stream = fs.createReadStream(filename);
    
    if(this._transformer) {
        stream = stream.pipe(this._transformer(filename));
    }

    self._queue.push(stream);

    stream.on('readable', function() {
        if(stream === self._queue[0]) {
            self.push(stream.read());
        }
    });
    stream.on('end', function() {
        if(stream === self._queue[0]) {
            self.push(stream.read());
            self._queue.shift();
            if(self._queue[0]) {
                self._queue[0].resume();
            }
        }
    });
};

module.exports = FileStream;
