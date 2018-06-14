var config = require('./config');
var watchArray = require('./watchArray');
var Seed = require('./seed');

module.exports = {
  text: function (value) {
    this.el.textContent = value || ''
  },
  show: function (value) {
    this.el.style.display = value ? '' : 'none'
  },
  class: function (value, className) {
    this.el.classList[value ? 'add' : 'remove'](className)
  },
  on: {
    update: function (handler) {
      var event = this.arg;
      if (!this.handlers) {
        this.handlers = {}
      }
      var handlers = this.handlers
      if (handlers[event]) {
        this.el.removeEventListener(event, handlers[event])
      }
      if (handler) {
        handler = handler.bind(this.seed);
        this.el.addEventListener(event, handler)
        handlers[event] = handler
      }
    },
    unbind: function () {
      var event = this.arg;
      if (directive.handlers) {
        this.el.removeEventListener(event, this.handlers[event])
      }
    },
  },
  each: {
    bind: function () {
      this.el['sd-block'] = true
      this.prefixRE = new RegExp('^' + this.arg + '.')
      var ctn = this.container = this.el.parentNode
      // createComment 是重点呀
      this.marker = document.createComment('sd-each-' + this.arg + '-marker')
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
      watchArray(collection, this.mutate.bind(this))
      var self = this
      collection.forEach(function(item, i) {
        self.childSeeds.push(self.buildItem(item, i, collection));
      })
    },
    mutate: function (mutation) {
      console.log(mutation)
    },
    buildItem: function (data, index, collection) {
      var node = this.el.cloneNode(true)
      var spore = new Seed(node, data, {
        eachPrefixRe: this.prefixRE,
        parentScope: this.seed.scope
      })
      this.container.insertBefore(node, this.marker)
      collection[index] = spore.scope
      return spore
    }
  }
}