var config = require('./config');
var directives = require('./directives');
var filters = require('./filters');

var KEY_RE          = /^[^\|<]+/;
var ARG_RE          = /([^:]+):(.+)$/;
var FILTERS_RE      = /\|[^\|<]+/g;
var FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g;
var DEPS_RE         = /<[^<\|]+/g;
var QUOTE_RE        = /'/;

function Directive (directiveName, expression) {

  var directive = directives[directiveName]
  if (typeof directive === 'function') {
    this._update = directive
  } else {
    for (var prop in directive) {
      if (prop === 'update') {
        this['_update'] = directive.update
      } else {
        this[prop] = directive[prop]
      }
    }
  }

  var rawKey   = expression.match(KEY_RE)[0]; // guarded in parse
  var argMatch = rawKey.match(ARG_RE);

  this.key = argMatch
      ? argMatch[2].trim()
      : rawKey.trim()

  this.arg = argMatch
      ? argMatch[1].trim()
      : null
  
  var filterExps = expression.match(FILTERS_RE)
  if (filterExps) {
      this.filters = filterExps.map(function (filter) {
          var tokens = filter.slice(1)
              .match(FILTER_TOKEN_RE)
              .map(function (token) {
                return token.replace(QUOTE_RE, '').trim()
              })
          return {
            name  : tokens[0],
            apply : filters[tokens[0]],
            args  : tokens.length > 1
                    ? tokens.slice(1)
                    : null
          }
      })
  } else {
    this.filters = null
  }

  var depExp = expression.match(DEPS_RE)
  if (depExp) {
    this.deps = depExp[0].slice(1).trim().split(/\s+/);
  }
}

Directive.prototype.update = function (value) {
  // computed property
  if (typeof value === 'function' && !this.fn) {
    value = value()
  }

  // apply filters
  if (this.filters) {
    value = this.applyFilters(value)
  }
  this._update(value)
}

Directive.prototype.applyFilters = function (value) {
  var filtered = value
  this.filters.forEach(function (filter) {
    if (!filter.apply) throw new Error('Unknown filter: ' + filter.name)
    filtered = filter.apply(filtered, filter.args)
  })
  return filtered
}

module.exports = {

  // make sure the directive and value is valid
  parse: function (dirname, expression) {

    var prefix = config.prefix
    if (dirname.indexOf(prefix) === -1) return null
    dirname = dirname.slice(prefix.length + 1)

    var dir   = directives[dirname];
    var valid = KEY_RE.test(expression);

    if (!dir) console.warn('unknown directive: ' + dirname)
    if (!valid) console.warn('invalid directive expression: ' + expression)

    return dir && valid
        ? new Directive(dirname, expression)
        : null
  }
}