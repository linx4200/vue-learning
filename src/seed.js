var Emitter = require('./emitter');
var config = require('./config');
var DirectiveParser = require('./directive-parser');

// var map = Array.prototype.map
// var each = Array.prototype.forEach
var slice = Array.prototype.slice;

var ancestorKeyRE = /\^/g;
// var rootKeyRE = /^\$/;
var ctrlAttr = config.prefix + '-controller';
var eachAttr = config.prefix + '-each';

function Seed (el, options) {

  if (typeof el === 'string') {
    el = document.querySelector(el)
  }

  this.el = el;
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

  // recursively process nodes for directives
  this._compileNode(el, true)

  // if has controller
  var ctrlID = el.getAttribute(ctrlAttr);
  if (ctrlID) {
    el.removeAttribute(ctrlAttr);
    var controller = config.controllers[ctrlID];
    if (controller) {
      controller.call(this, this.scope, this);
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
      var seed = new Seed(node, { parentSeed: self});

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
  return node
}

Seed.prototype._bind = function (node, directive) {

  directive.seed = this
  directive.el = node

  var key = directive.key;
  // snr for 
  var snr = this.eachPrefixRE; // /^todo./
  var isEachKey = snr && snr.test(key);
  var scopeOwner = this;
  
  if (isEachKey) {
    key = key.replace(snr, '');
  }
  
  if (snr && !isEachKey) {
    scopeOwner = this.parentSeed;
  } else {
    var ancestors = key.match(ancestorKeyRE);  //  /\^/g
    var root = key.charAt(0) === '$';
    if (ancestors) {
      key = key.replace(ancestorKeyRE, '')
      var levels = ancestors.length;
      while (scopeOwner.parentSeed && levels--) {
        scopeOwner = scopeOwner.parentSeed;
      }
    } else if (root) {
      key = key.slice(1);
      while (scopeOwner.parentSeed) {
        scopeOwner = scopeOwner.parentSeed;
      }
    }
  }


  // directive.key = key

  var binding = scopeOwner._bindings[key] || scopeOwner._createBinding(key);

  // add directive to this binding
  binding.instances.push(directive);

  // TODO: 我自己加的，处理依赖
  if (directive.deps) {
    console.log('====1====', directive.deps);
    binding.deps = directive.deps;
  }

  // invoke bind hook if exists
  if (directive.bind) {
    directive.bind(binding.value)
  }

  // set initial value
  if (binding.value) {
    directive.update(binding.value);
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
  this._unbind()
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