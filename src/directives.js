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
        handler = handler.bind(this.el)
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
    update: function (collection) {
      augmentArray(collection, this)
    },
    mutate: function (mutation) {
      console.log(mutation)
    }
  }
}

var push = [].push,
    slice = [].slice

function augmentArray (collection, directive) {
    collection.push = function (element) {
        push.call(this, arguments)
        directive.mutate({
            event: 'push',
            elements: slice.call(arguments),
            collection: collection
        })
    }
}