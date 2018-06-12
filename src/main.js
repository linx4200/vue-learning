var config = require('./config');
var Seed = require('./seed');
var Directives  = require('./directives');
var Filters  = require('./filters');


var seeds = {}

function bindSelector () {
  // Object.keys(module.exports)  这个也太黑科技了
  config.selector = Object.keys(module.exports).forEach(function(directive) {

  })
}

module.exports = {
  seeds: seeds,
  seed: function (id, opts) {
    seeds[id] = opts
  },
  // 可以自定义 directive 和 filter 了
  directive: function (name, fn) {
    Directives[name] = fn
  },
  filter: function (name, fn) {
    Filters[name] = fn
  },
  config: function (opts) {
    for (var prop in opts) {
      if (prop !== 'selector') {
        config[prop] = opts[prop]
      }
    }
  },
  plant: function () {
    for (var id in seeds) {
      seeds[id] = new Seed(id, seeds[id])
    }
  }
}