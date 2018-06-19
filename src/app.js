import Seed from './main';

Seed.filter('money', function (value) {
  return value ? '$' + value.toFixed(2) : ''
})

Seed.controller('TodoList', {
  changeMessage: function () {
    this.scope.msg = 'It works!'
  },
  remove: function () {
    this.destroy()
  }
})

Seed.controller('Todo', {
  toggle: function () {
    this.scope.done = !scope.done
  }
})

// define a seed

var s = Date.now();

var app = Seed.bootstrap({
  el: '#app',
  data: {
    msg: 'hello!',
    total: 9999,
    error: true,
    todos: [
        {
            title: 'hello!',
            done: true
        },
        {
            title: 'hello!!',
            done: false
        },
        {
            title: 'hello!!!',
            done: false
        }
    ]
  }
})

console.log(Date.now() - s + 'ms')
