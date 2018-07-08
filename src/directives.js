var config = require('./config');
var watchArray = require('./watch-array');

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
    update: function (handler) {
      var self = this;
      var event = this.arg;

      if (this.handler) {
        this.el.removeEventListener(event, this.handler)
      }
      if (handler) {
        var proxy = function (e) {
          console.log('==proxy===', proxy);
          handler({
            el            : e.currentTarget,
            originalEvent : e,
            directive     : self,
            seed          : self.seed
          })
        }
        this.el.addEventListener(event, proxy)
        this.handler = proxy
      }
    },
    unbind: function () {
      var event = this.arg;
      if (this.handlers) {
        this.el.removeEventListener(event, this.handler)
      }
    },
  },
  each: {
    bind: function () {
      console.log("====each====bind====");
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

      if (this.childSeeds.length) {
        this.childSeeds.forEach(function(child) {
          child.destroy();
        })
        this.childSeeds = []
      }

      // watchArray(collection, this.mutate.bind(this))
      watchArray(collection, this.mutate.bind(this))

      var self = this
      collection.forEach(function(item, i) {
        self.childSeeds.push(self.buildItem(item, i, collection));
      })
    },
    mutate: function (mutation) {
      // TODO: can't invoke event listeners
      this.update(mutation.array);
    },
    buildItem: function (data, index, collection) {
      var Seed = require('./seed');
      var node = this.el.cloneNode(true);

      // if (ctrl) {
      //   node.removeAttribute(config.prefix + '-controller');
      // }
      console.log('==data, index===', this.el, node, data, index)
      var spore = new Seed(node, data, {
        eachPrefixRe: this.arg,
        parentSeed: this.seed,
        eachIndex: index,
        eachCollection: collection
      })

      this.container.insertBefore(node, this.marker)
      collection[index] = spore.scope
      return spore
    }
  }
}