var config = require('./config');
var Directive = require('./directive');
var Directives = require('./directives');
var Filter = require('./filters');

function Seed (el, data) {

  if (typeof el === 'string') {
    el = document.querySelector(el)
  }

  this.el = el;
  this._bindings = {}; // internal real data
  this.scope = {}; // external interface

  // 选择出有 directive （sd-xxx） 的所有节点 
  var els = el.querySelectorAll(config.selector);

  // process nodes for directives
  ;[].forEach.call(els, this._compileNode.bind(this))
  this._compileNode(el)

  // initialize all variables by invoking setters
  for (var key in this.bindings) {
    this.scope[key] = data[key]
  }
}

Seed.prototype._compileNode = function (node) {
  var self = this;
  cloneAttributes(node.attributes).forEach(function (attr) {
    var directive = Directive.parse(attr, config.prefix)
    if (directive) {
      self._bind(node, directive)
    }
  })
}

Seed.prototype._bind = function (node, directive) {
  directive.el = node
  node.removeAttribute(directive.attr.name)

  var key = directive.key;
  var binding = this._bindings[key] || this._createBinding(key);

  // add directive to this binding
  binding.directives.push(directive)

  if (directive.bind) {
    directive.bind(node, binding.value)
  }
}

Seed.prototype._createBinding = function (key) {
  var binding = {
    value: undefined,
    directives : []
  }

  this._bindings[key] = binding

  // bind accessor triggers to scope
  Object.defineProperty(this.scope, key, {
    get: function () {
      return binding.value
    },
    set: function (value) {
      binding.value = value
      binding.directives.forEach(function (directive) {
        directive.update(value)
      })
    }
  })

  return binding
}

Seed.prototype.dump = function () {
  var data = {}
  for (var key in this._bindings) {
    data[key] = this._bindings[key].value
  }
  return data
}

Seed.prototype.destroy = function () {
  for (var key in this._bindings) {
    this._bindings[key].directives.forEach(unbind);
  }
  this.el.parentNode.remove(this.el)
  function unbind (directive) {
    if (directive.unbind) {
      directive.unbind();
    }
  }
}

// clone attributes so they don't change
function cloneAttributes (attributes) {
  return [].map.call(attributes, function (attr) {
    return {
      name: attr.name,
      value: attr.value
    }
  })
}

module.exports = Seed;