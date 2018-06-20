var config = require('./config');
var controllers   = require('./controllers');
var bindingParser = require('./binding');

var map = Array.prototype.map
var each = Array.prototype.forEach

// lazy init
var ctrlAttr;
var eachAttr;

function Seed (el, data, options) {
  // refresh
  ctrlAttr = config.prefix + '-controller';
  eachAttr = config.prefix + '-each';

  if (typeof el === 'string') {
    el = document.querySelector(el)
  }

  // if has controller
  var ctrlID = el.getAttribute(ctrlAttr);
  var controller = null;
  if (ctrlID) {
    controller = controllers[ctrlID];
    el.removeAttribute(ctrlAttr);
    if (!controller) {
      throw new Error('controller ' + ctrlID + ' is not defined.');
    }
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

  // process nodes for bindings
  this._compileNode(el, true);

  // copy in methods from controller
  if (controller) {
    controller.call(null, this.scope, this);
  }

  // initialize all variables by invoking setters
  for (key in dataCopy) {
    this.scope[key] = dataCopy[key]
  }
}

Seed.prototype._compileNode = function (node, root) {
  var self = this;

  if(node.nodeType === 3) {
    // text  node
    self._compileTextNode(node)
  } else if (node.attributes && node.attributes.length) {
    var eachExp = node.getAttribute(eachAttr);
    var ctrlExp = node.getAttribute(ctrlAttr);

    if (eachExp) {
      // each
      var binding = bindingParser.parse(eachAttr, eachExp)
      if (binding) {
        self._bind(node, binding)
      }
    } else if (!ctrlExp || root) { // skip nested controllers
      // normal node
      // clone attributes because the list can change
      var attrs = map.call(node.attributes, function (attr) {
        return {
          name: attr.name,
          expressions: attr.value.split(',')
        }
      })
      attrs.forEach(function (attr) {
        var valid = false
        attr.expressions.forEach(function(exp) {
          var binding = bindingParser.parse(attr.name, exp);
          if (binding) {
            valid = true
            self._bind(node, binding);
          }
        })
        if (valid) node.removeAttribute(attr.name)
      })

      // 把 querySelectorAll 改成了递归
      if (node.childNodes.length) {
        each.call(node.childNodes, function(child) {
          self._compileNode(child);
        })
      }
    }
  }
}

Seed.prototype._compileTextNode = function(node) {
  return node
}

Seed.prototype._bind = function (node, bindingInstance) {
  bindingInstance.seed = this
  bindingInstance.el = node

  var key = bindingInstance.key;
  var epr = this._options.eachPrefixRE; // new RegExp('^' + this.arg + '.')
  var isEachKey = epr && epr.test(key);
  var seed = this;

  if (isEachKey) {
    key = key.replace(epr, '');
  } else if (epr) {
    seed = this._options.parentSeed
  }

  var binding = seed._bindings[key] || seed._createBinding(key);

  // add directive to this binding
  binding.instances.push(bindingInstance)

  // invoke bind hook if exists
  if (bindingInstance.bind) {
    bindingInstance.bind(binding.value)
  }
}

Seed.prototype._createBinding = function (key) {
  var binding = {
    value: null,
    instances : []
  }

  this._bindings[key] = binding

  // bind accessor triggers to scope
  Object.defineProperty(this.scope, key, {
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