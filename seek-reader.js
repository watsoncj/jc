var Transform = require('stream').Transform;
var util = require('util');

util.inherits(SeekReader, Transform);

function SeekReader(options) {
  Transform.call(this, options);
  this.bytes = 0;
  this.seek = options.seek;
}

SeekReader.prototype._transform = function(chunk, encoding, cb) {
  var seek = this.seek;
  if (this.bytes + chunk.length > seek) {
    // push anything past seek
    var offset = seek - this.bytes;
    this.push(chunk.slice(offset - chunk.length), encoding);
    this.emit('progress');
  }
  this.bytes += chunk.length;
  cb();
};

module.exports = SeekReader;
