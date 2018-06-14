var config = require('./config');
var Directive = require('./directive');

var map = Array.prototype.map
var each = Array.prototype.forEach

function Seed (el, data, options) {
  if (typeof el === 'string') {
    el = document.querySelector(el)
  }

  this.el = el;
  this.scope = {}; // external interface
  this._bindings = {}; // internal real data
  this._options   = options || {}

  // 选择出有 directive （sd-xxx） 的所有节点 
  // var els = el.querySelectorAll(config.selector);

  // process nodes for directives
  // ;[].forEach.call(els, this._compileNode.bind(this))
  this._compileNode(el)

  // initialize all variables by invoking setters
  for (var key in this._bindings) {
    this.scope[key] = data[key]
  }
}

Seed.prototype._compileNode = function (node) {
  var self = this;

  if(node.nodeType === 3) {
    // text  node
    self._compileTextNode(node)
  } else if (node.attributes && node.attributes.length) {
    // clone attributes because the list can change
    var attrs = map.call(node.attributes, function (attr) {
      return {
        name: attr.name,
        value: attr.value
      }
    })
    attrs.forEach(function (attr) {
      var directive = Directive.parse(attr)
      if (directive) {
        self._bind(node, directive)
      }
    })
  }

  // 为什么 node 会有 sd-block 这个属性 ？
  if(!node['sd-block'] && node.childNodes.length) {
    each.call(node.childNodes, function(child) {
      // 把 querySelectorAll 改成了递归
      self._compileNode(child);
    })
  }
}

Seed.prototype._compileTextNode = function(node) {

}

Seed.prototype._bind = function (node, directive) {
  directive.seed = this
  directive.el = node

  node.removeAttribute(directive.attr.name)

  var key = directive.key;
  var epr = this._options.eachPrefixRE; // new RegExp('^' + this.arg + '.')
  if (epr) {
    key = key.replace(epr, '')
  }

  var binding = this._bindings[key] || this._createBinding(key);

  // add directive to this binding
  binding.directives.push(directive)

  // invoke bind hook if exists
  if (directive.bind) {
    directive.bind.call(directive, binding.value)
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
    delete this._bindings[key]
  }
  this.el.parentNode.removeChild(this.el)
  function unbind (directive) {
    if (directive.unbind) {
      directive.unbind();
    }
  }
}

module.exports = Seed;