[![Build Status](https://travis-ci.org/Floby/node-libspotify.png)](https://travis-ci.org/Floby/node-catstream)

# node-catstream

Filenames go in, contents come out. You can't explain that.

## Installation

    npm install --save catstream

## Usage

catstream is a Transform stream that takes filenames as inputs and outputs
the contents of said filenames in the order they were read.

```javascript

var filenames = [
    'a.txt', // content: hello
    'b.txt', // content: goodbye
    'c.txt'  // content: o rly
];
var cat = require('catstream');
var c = cat()
cat.pipe(process.stdout)
cat.end(filenames.join('\n'))

// prints "hello goodbye o rly" to the console

```

more usually you have a readable stream with a list of filenames that you pipe to this.

## Reference

#### new CatStream([transformer], [options])

Creates a new cat stream.

* `transformer` is a function that returns a transform stream. Each time a new file is read and when
    `transformer` is defined, the content of the file is piped through the transform stream.
* `options` a configuration object for the transform stream. The default options for transform streams are
    applicable and the following is added:
    * `separator` the separator between filenames in the input. defaults to newline.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Florent Jaby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
