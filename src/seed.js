var Emitter = require('./emitter');
var config = require('./config');
var DirectiveParser = require('./directive-parser');

// var map = Array.prototype.map
// var each = Array.prototype.forEach
var slice = Array.prototype.slice;

var ancestorKeyRE = /\^/g;
var rootKeyRE = /^\$/;
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

  if(options) {
    for (var op in options) {
      this[op] = options[op];
    }
  }

  // initialize the scope object
  var dataPrefix = config.prefix + '-data';
  this.scope =
    (options && options.data)
    || config.datum[el.getAttribute(dataPrefix)]
    || {};

  el.removeAttribute(dataPrefix);

  // if has controller
  var ctrlID = el.getAttribute(ctrlAttr);
  var controller = null;
  if (ctrlID) {
    controller = config.controllers[ctrlID]
    if (!controller) console.warn('controller ' + ctrlID + ' is not defined.')
    el.removeAttribute(ctrlAttr)
  }

  // recursively process nodes for directives
  this._compileNode(el, true)

  if (controller) {
    controller.call(this, this.scope, this);
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

    } else if (node.attributes && node.attributes.length) {
      // normal node
      slice.call(node.attributes).forEach(function (attr) {
        var valid = false
        attr.value.split(',').forEach(function (exp) {
          var binding = DirectiveParser.parse(attr.name, exp);
          if (binding) {
            valid = true
            self._bind(node, binding);
          }
        })
        if (valid) node.removeAttribute(attr.name)
      })
    }

    // recursively parse child nodes
    if (!eachExp && !ctrlExp) {
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
    var root = key.match(rootKeyRE); //  /^\$/;
    if (ancestors) {
      key = key.replace(ancestorKeyRE, '')
      var levels = ancestors.length;
      while (scopeOwner.parentSeed && levels--) {
        scopeOwner = scopeOwner.parentSeed;
      }
    } else if (root) {
      key = key.replace(rootKeyRE, '');
      while (scopeOwner.parentSeed) {
        scopeOwner = scopeOwner.parentSeed;
      }
    }
  }


  // directive.key = key

  var binding = scopeOwner._bindings[key] || scopeOwner._createBinding(key);

  // add directive to this binding
  binding.instances.push(directive)

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

Seed.prototype.unbind = function () {
  var unbind = function (instance) {
    if (instance.unbind) {
      instance.unbind()
    }
  }
  for (var key in this._bindings) {
    this._bindings[key].instances.forEach(unbind)
  }
  if (this.childSeeds && this.childSeeds.length) {
    this.childSeeds.forEach(function (child) {
      child.unbind();
    })
  }
}

Seed.prototype.destroy = function () {
  this.unbind()
  this.el.parentNode.removeChild(this.el)
  if (this.parentSeed && this.id) {
    delete this.parentSeed['$' + this.id]
  }
}

Emitter(Seed.prototype);

module.exports = Seed;