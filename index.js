var util = require('util');
var fs = require('fs');
var stream = require('stream');
var split = require('split');
var SS = require('stream-stream');


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

    stream.Duplex.call(this, this._options);
    if(this._options) this._separator = this._options.separator;
    this._split = split(this._separator);
    this._split.on('data', this._onFilename.bind(this));
    this._ss = SS();

    this._split.on('end', this._ss.end.bind(this._ss));

    this._ss.on('end', function() {
        this._ended = true;
    }.bind(this));

    this._ss.on('readable', this.read.bind(this, 0));
}
util.inherits(CatStream, stream.Duplex);

CatStream.prototype._write = function _write(chunk, encoding, callback) {
    this._split.write(chunk, encoding);
    callback();
};

CatStream.prototype._read = function _read(size) {
    var res = this._ss.read(size);
    if(res === null && this._ended) {
        this.push(null);
    }
    else {
        this.push(res || '');
    }
};

CatStream.prototype.end = function end(chunk, encoding, callback) {
    if(chunk) {
        this._split.write(chunk, encoding, callback);
    }
    this._split.end();
};

CatStream.prototype._onFilename = function _onFilename(filename) {
    filename = filename.trim();
    if(filename == '') return;

    var self = this;
    var stream = fs.createReadStream(filename);
    if(this._transformer) {
        stream = stream.pipe(this._transformer(filename));
    }

    this._ss.write(stream);
};

module.exports = CatStream;
