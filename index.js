var util = require('util');
var fs = require('fs');
var stream = require('stream');
var split = require('split');

function CatStream (encoding, transformer, options) {
    if(!(this instanceof CatStream)) return new CatStream(encoding, transformer, options);
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
util.inherits(CatStream, stream.Transform);

CatStream.prototype._transform = function _transform(chunk, encoding, callback) {
    this._split.write(chunk, encoding);
    callback();
};

CatStream.prototype._flush = function _flush(callback) {
    var self = this;
    this._split.end();
    if(this._queue.length) {
        this._queue[this._queue.length-1].on('end', function(err, res) {
            self.push(null);
            callback();
        });
        this._startHead()
    }
    else {
        this.push(null)
    }
};


CatStream.prototype._onFilename = function _onFilename(filename) {
    if(filename.trim() == '') return;

    var self = this;
    var stream = fs.createReadStream(filename);
    if(this._transformer) {
        stream = stream.pipe(this._transformer(filename));
    }

    stream.pause();
    stream.on('data', function(data) {
        self.push(data);
    });
    stream.on('end', function() {
        self._disposeHead();
    });
    self._queue.push(stream);
    this._startHead();
};

CatStream.prototype._disposeHead = function _disposeHead() {
    this._queue.shift();
    this._startHead();
};

CatStream.prototype._startHead = function _startHead() {
    if(this._queue.length) {
        this._queue[0].resume();
    }
    else if(this._writableState.ended) {
        this.push(null);
    }
};

module.exports = CatStream;
