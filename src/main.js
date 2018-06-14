var config = require('./config');
var Seed = require('./seed');
var Directives  = require('./directives');
var Filters  = require('./filters');

Seed.config = config;

// 这是一个继承
// 如何扩展一个类的例子
Seed.extend = function (opts) {
  var Spore = function () {
      Seed.apply(this, arguments)
      for (var prop in this.extensions) {
          var ext = this.extensions[prop]
          this.scope[prop] = (typeof ext === 'function')
              ? ext.bind(this)
              : ext
      }
  }
  Spore.prototype = Object.create(Seed.prototype)
  Spore.prototype.extensions = {}
  for (var prop in opts) {
    Spore.prototype.extensions[prop] = opts[prop]
  }
  return Spore
}

Seed.directive = function (name, fn) {
  Directives[name] = fn
}

Seed.filter = function (name, fn) {
  Filters[name] = fn
}

module.exports = Seed