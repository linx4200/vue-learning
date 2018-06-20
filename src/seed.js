var config = require('./config');
var bindingParser = require('./binding');

var map = Array.prototype.map
var each = Array.prototype.forEach

function Seed (el, data, options) {
  if (typeof el === 'string') {
    el = document.querySelector(el)
  }

  this.el = el;
  this.scope = data; // external interface  就是现在的 data
  this._bindings = {}; // internal real data
  this._options   = options || {}

  var key;
  var dataCopy = {};
  for (key in data) {
    dataCopy[key] = data[key];
  }

  // 选择出有 directive （sd-xxx） 的所有节点 
  // var els = el.querySelectorAll(config.selector);

  // process nodes for directives
  // ;[].forEach.call(els, this._compileNode.bind(this))
  this._compileNode(el)

  // initialize all variables by invoking setters
  for (key in this._bindings) {
    this.scope[key] = dataCopy[key]
  }
}

Seed.prototype._compileNode = function (node) {
  var self = this;
  var ctrl = config.prefix + '-controller';

  if(node.nodeType === 3) {
    // text  node
    self._compileTextNode(node)
  } else if (node.attributes && node.attributes.length) {
    // clone attributes because the list can change
    var attrs = map.call(node.attributes, function (attr) {
      return {
        name: attr.name,
        expressions: attr.value.split(',')
      }
    })
    attrs.forEach(function (attr) {
      if (attr.name === ctrl) {
        return;
      }
      attr.expressions.forEach(function(exp) {
        var binding = bindingParser.parse(attr.name, exp);
        if (binding) {
          self._bind(node, binding);
        }
      })
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
  return node
}

Seed.prototype._bind = function (node, bindingInstance) {
  bindingInstance.seed = this
  bindingInstance.el = node

  node.removeAttribute(config.prefix + '-' + bindingInstance.directiveName)

  var key = bindingInstance.key;
  var scope = this.scope;
  var epr = this._options.eachPrefixRE; // new RegExp('^' + this.arg + '.')
  var isEach = epr && epr.test(key)
  if (isEach) {
    key = key.replace(epr, '');
    scope = this._options.parentScope
  }

  var binding = this._bindings[key] || this._createBinding(key, scope);

  // add directive to this binding
  binding.instances.push(bindingInstance)

  // invoke bind hook if exists
  if (bindingInstance.bind) {
    bindingInstance.bind(binding.value)
  }
}

Seed.prototype._createBinding = function (key, scope) {
  var binding = {
    value: null,
    instances : []
  }

  this._bindings[key] = binding

  // bind accessor triggers to scope
  Object.defineProperty(scope, key, {
    get: function () {
      return binding.value
    },
    set: function (value) {
      binding.value = value
      binding.instances.forEach(function (instance) {
        instance.update(value)
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
    this._bindings[key].instances.forEach(unbind);
    delete this._bindings[key]
  }
  this.el.parentNode.removeChild(this.el)
  function unbind (instance) {
    if (instance.unbind) {
      instance.unbind();
    }
  }
}

module.exports = Seed;