var Emitter = require('./emitter');
var config = require('./config');
var DirectiveParser = require('./directive-parser');
var TextNodeParser = require('./textnode-parser');

// var map = Array.prototype.map
// var each = Array.prototype.forEach
var slice = Array.prototype.slice;

var ancestorKeyRE = /\^/g;
// var rootKeyRE = /^\$/;
var ctrlAttr = config.prefix + '-controller';
var eachAttr = config.prefix + '-each';

function determineScope (key, scope) {
  if (key.nesting) {
    var levels = key.nesting
    while (scope.parentSeed && levels--) {
      scope = scope.parentSeed
    }
  } else if (key.root) {
    while (scope.parentSeed) {
      scope = scope.parentSeed
    }
  }
  return scope;
}

function Seed (el, options) {

  if (typeof el === 'string') {
    el = document.querySelector(el)
  }

  this.el = el;
  el.seed = this;
  // this.scope = data; // external interface  就是现在的 data
  this._bindings = {}; // internal real data
  this._options = options || {};

  // copy options
  options = options || {}
  for (var op in options) {
    this[op] = options[op];
  }

  // initialize the scope object
  var dataPrefix = config.prefix + '-data';
  this.scope =
    (options && options.data)
    || config.datum[el.getAttribute(dataPrefix)]
    || {};

  el.removeAttribute(dataPrefix);

  this.scope.$seed = this;
  this.scope.$destroy = this._destroy.bind(this);
  this.scope.$dump = this._dump.bind(this);
  this.scope.$index = options.index;
  this.scope.$parent  = options.parentSeed && options.parentSeed.scope;
  this.scope.$on = this.on.bind(this)
  this.scope.$emit = this.emit.bind(this)

  // recursively process nodes for directives
  this._compileNode(el, true);

  // if has controller
  var ctrlID = el.getAttribute(ctrlAttr);
  if (ctrlID) {
    el.removeAttribute(ctrlAttr);
    var controller = config.controllers[ctrlID];
    if (controller) {
      controller.call(this, this.scope);
    } else {
      console.warn('controller ' + ctrlID + ' is not defined.');
    }
  }

  // TODO: 我自己加的处理依赖
  for(var key in this._bindings) {
    const binding = this._bindings[key];
    if (binding.deps) {
      binding.deps.forEach(dep => {
        // 搞不了了，这样不能把 binding.deps update 的时候，也调用 this._bindings[key] 的 update
      })
    }
  }
}

Seed.prototype._compileNode = function (node, root) {
  var self = this;

  if(node.nodeType === 3) {
    // text  node
    self._compileTextNode(node)
  } else {
    var eachExp = node.getAttribute(eachAttr);
    var ctrlExp = node.getAttribute(ctrlAttr);

    if (eachExp) {
      // each block
      var binding = DirectiveParser.parse(eachAttr, eachExp)
      if (binding) {
        self._bind(node, binding);
      }
    } else if (ctrlExp && !root) { // nested controllers
      // TODO need to be clever here!

      var id = node.id;
      var seed = new Seed(node, { child: true, parentSeed: self});

      if (id) {
        self['$' + id] = seed;
      }

    } else {
      // normal node

      // parse if has attributes
      if (node.attributes && node.attributes.length) {
        slice.call(node.attributes).forEach(function (attr) {
          var valid = false
          attr.value.split(',').forEach(function (exp) {
            var directive = DirectiveParser.parse(attr.name, exp);
            if (directive) {
              valid = true
              self._bind(node, directive);
            }
          })
          if (valid) node.removeAttribute(attr.name)
        })
      }

      // recursively parse child nodes
      if (node.childNodes.length) {
        slice.call(node.childNodes).forEach(function (child, i) {
          self._compileNode(child)       
        })
      }
    }
  }
}

Seed.prototype._compileTextNode = function(node) {
  return TextNodeParser.parse(node);
}

Seed.prototype._bind = function (node, directive) {

  directive.seed = this
  directive.el = node

  var key = directive.key;
  // snr for 
  var epr = this.eachPrefixRE; // /^todo./
  var isEachKey = epr && epr.test(key);
  var scope = this;
  
  if (isEachKey) {
    key = directive.key = key.replace(epr, '');
  }
  
  if (epr && !isEachKey) {
    scope = this.parentSeed
  }

  var ownerScope = determineScope(directive, scope);
  var binding = ownerScope._bindings[key] || ownerScope._createBinding(key);

  // add directive to this binding
  binding.instances.push(directive);
  directive.binding = binding;

  // invoke bind hook if exists
  if (directive.bind) {
    directive.bind(binding.value)
  }

  // set initial value
  if (binding.value) {
    directive.update(binding.value);
  }

  // computed properties
  if (directive.deps) {
    directive.deps.forEach(function (dep) {
      var depScope = determineScope(dep, scope);
      var depBinding = depScope._bindings[dep.key] || depScope._createBinding(dep.key);
      
      if (!depBinding.dependents) {
        depBinding.dependents = [];
        depBinding.refreshDependents = function () {
          depBinding.dependents.forEach(function (dept) {
            dept.refresh();
          })
        }
      }
      depBinding.dependents.push(directive);
    })
  }
}

Seed.prototype._createBinding = function (key) {
  var binding = {
    value: this.scope[key],
    changed: false,
    instances : [],
    deps: null
  }

  this._bindings[key] = binding

  // bind accessor triggers to scope
  Object.defineProperty(this.scope, key, {
    get: function () {
      return binding.value
    },
    set: function (value) {
      // 为什么 value 会等于 binding ?
      if (value === binding) return;
      binding.changed = true;
      binding.value = value;
      binding.instances.forEach(function (instance) {
        instance.update(value)
      })

      if (binding.refreshDependents) {
        binding.refreshDependents();
      }
    }
  })

  return binding
}

Seed.prototype._unbind = function () {
  var unbind = function (instance) {
    if (instance.unbind) {
      instance.unbind()
    }
  }
  for (var key in this._bindings) {
    this._bindings[key].instances.forEach(unbind)
  }
  // if (this.childSeeds && this.childSeeds.length) {
  //   this.childSeeds.forEach(function (child) {
  //     child.unbind();
  //   })
  // }
}

Seed.prototype._destroy = function () {
  this._unbind();
  delete this.el.seed;
  this.el.parentNode.removeChild(this.el)
  if (this.parentSeed && this.id) {
    delete this.parentSeed['$' + this.id]
  }
}

Seed.prototype._dump = function () {
  var dump = {};
  var val;
  var subDump = function (scope) {
      return scope.$dump()
    };
  for (var key in this.scope) {
    if (key.charAt(0) !== '$') {
      val = this._bindings[key]
      if (!val) continue
      if (Array.isArray(val)) {
        dump[key] = val.map(subDump)
      } else {
        dump[key] = this._bindings[key].value
      }
    }
  }
  return dump
}

Emitter(Seed.prototype);

module.exports = Seed;