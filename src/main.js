var config = require('./config');
var Seed = require('./seed');
var directives  = require('./directives');
var filters  = require('./filters');

var controllers = config.controllers = {};
var datum = config.datum = {};
var api = {};

// API
api.config = config

// 这是一个继承
// 如何扩展一个类的例子
api.extend = function (opts) {
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

api.data = function (id, data) {
  if (!data) return datum[id]
  if (datum[id]) {
    console.warn('data object "' + id + '"" already exists and has been overwritten.')
  }
  datum[id] = data
}

api.controller = function (id, extensions) {
  if (!extensions) return controllers[id];

  if (controllers[id]) {
    console.warn('controller "' + id + '" already exists and has been overwritten.')
  }
  controllers[id] = extensions
}

api.directive = function (name, fn) {
  directives[name] = fn
}

api.filter = function (name, fn) {
  filters[name] = fn
}

api.bootstrap = function () {
  var app = {};
  var n = 0;
  var el;
  var seed;

  // 这个没有用呀，只会循环一次呀
  while (el = document.querySelector('[' + config.prefix + '-controller]')) {
    seed = new Seed(el)
    if (el.id) {
      app['$' + el.id] = seed
    }
    n++
  }
  return n > 1 ? app : seed
}

module.exports = api;