var config = require('./config');
var watchArray = require('./watch-array');

// sniff matchesSelector() method name.

var matches = 'atchesSelector';
var prefixes = ['m', 'webkitM', 'mozM', 'msM'];

prefixes.some(function (prefix) {
    var match = prefix + matches
    if (document.body[match]) {
      matches = match
      return true
    }
})

function delegateCheck (current, top, selector) {
  if (current.webkitMatchesSelector(selector)) {
    return current
  } else if (current === top) {
    return false
  } else {
    return delegateCheck(current.parentNode, top, selector)
  }
}

module.exports = {
  text: function (value) {
    this.el.textContent = value === null ? '' : value.toString()
  },
  show: function (value) {
    this.el.style.display = value ? '' : 'none'
  },
  class: function (value, className) {
    if (this.arg) {
      this.el.classList[value ? 'add' : 'remove'](this.arg)
    } else {
      this.el.classList.remove(this.lastVal)
      this.el.classList.add(value)
      this.lastVal = value
    }
  },
  checked: {
    bind: function () {
      var el = this.el
      var self = this
      this.change = function () {
        self.seed.scope[self.key] = el.checked
      }
      el.addEventListener('change', this.change)
    },
    update: function (value) {
      this.el.checked = value
    },
    unbind: function () {
      this.el.removeEventListener('change', this.change)
    }
  },
  on: {
    fn: true, // https://github.com/vuejs/vue/commit/3d33458b601d3c1cf56f0db1e794acc2b161cd2e#diff-7d6151199732609c13de10bd7e7a14a9R43
    bind: function (handler) {
      if (this.seed.each) {
        this.selector = '[' + this.directiveName + '*="' + this.expression + '"]'
        this.delegator = this.seed.el.parentNode
      }
    } ,
    update: function (handler) {
      this.unbind()
      if (!handler) return
      var self = this;
      var event = this.arg;
      var selector = this.selector;
      var elegator = this.delegator; // if this.seed.each
      if (delegator) {
          // for each blocks, delegate for better performance
          if (!delegator[selector]) {
            console.log('binding listener')
            delegator[selector] = function (e) {
              var target = delegateCheck(e.target, delegator, selector);
              if (target) {
                handler({
                  el : target,
                  originalEvent : e,
                  directive : self,
                  seed : target.seed
                });
              }
            }
            delegator.addEventListener(event, delegator[selector]);
          }
      } else {
        // a normal handler
        this.handler = function (e) {
          handler({
            el : e.currentTarget,
            originalEvent : e,
            directive : self,
            seed : self.seed
          })
        };
        this.el.addEventListener(event, this.handler);
      }
    },
    unbind: function () {
      var event = this.arg;
      var selector  = this.selector;
      var delegator = this.delegator;
      if (delegator && delegator[selector]) {
        delegator.removeEventListener(event, delegator[selector]);
        delete delegator[selector];
      } else if (this.handler) {
        this.el.removeEventListener(event, this.handler);
      }
    },
  },
  each: {
    bind: function () {
      this.el.removeAttribute(config.prefix + '-each')
      // this.prefixRE = new RegExp('^' + this.arg + '.')
      var ctn = this.container = this.el.parentNode
      // createComment 是重点呀
      this.marker = document.createComment('sd-each-' + this.arg)
      // this.marker = document.createComment('sd-each-' + this.arg + '-marker')
      ctn.insertBefore(this.marker, this.el)
      ctn.removeChild(this.el)
      this.childSeeds = []
    },
    update: function (collection) {

      this.unbind(true);
      this.childSeeds = [];

      if (!Array.isArray(collection)) return
      watchArray(collection, this.mutate.bind(this))

      var self = this
      collection.forEach(function(item, i) {
        self.childSeeds.push(self.buildItem(item, i, collection));
      })
    },
    buildItem: function (data, index, collection) {
      var Seed = require('./seed');
      var node = this.el.cloneNode(true);

      // if (ctrl) {
      //   node.removeAttribute(config.prefix + '-controller');
      // }

      var spore = new Seed(node, {
        each: true,
        eachPrefixRE: new RegExp('^' + this.arg + '.'), // /^todo./
        parentSeed: this.seed,
        index: index,
        // eachCollection: collection,
        data: data
      })

      this.container.insertBefore(node, this.marker)
      collection[index] = spore.scope
      return spore
    },
    mutate: function (mutation) {
      this.update(mutation.array);
    },
    unbind: function (rm) {
      if (this.childSeeds.length) {
        var fn = rm ? '_destroy' : '_unbind';
        this.childSeeds.forEach(function (child) {
          child[fn]();
        })
      }
    }
  }
}