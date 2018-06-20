var config = require('./config');
var Seed = require('./seed');
var directives  = require('./directives');
var filters  = require('./filters');
var controllers = require('./controllers');

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

Seed.controller = function (id, extensions) {
  if (controllers[id]) {
    console.warn('controller "' + id + '" was already registered and has been overwritten.')
  }
  controllers[id] = extensions
}

Seed.directive = function (name, fn) {
  directives[name] = fn
}

Seed.filter = function (name, fn) {
  filters[name] = fn
}

Seed.bootstrap = function (seeds) {
  if (!Array.isArray(seeds)) seeds = [seeds]
  var instances = []
  seeds.forEach(function (seed) {
    var el = seed.el

    if (typeof el === 'string') {
      el = document.querySelector(el)
    }

    if (!el) {
      console.warn('invalid element or selector: ' + seed.el)
    }

    instances.push(new Seed(el, seed.data, seed.options))
  })

  return instances.length > 1
      ? instances
      : instances[0]
}

// alias for an alternative API
Seed.evolve = Seed.controller
Seed.plant  = Seed.bootstrap

module.exports = Seed