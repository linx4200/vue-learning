import Seed from './main';

Seed.filter('money', function (value) {
  return value ? '$' + value.toFixed(2) : ''
})

Seed.controller('TodoList', function (scope, seed) {
  scope.changeMessage = function () {
    scope.msg = 'It works!'
  }
  scope.remove = function () {
    seed.destroy()
  }
})

Seed.controller('Todo', function (scope) {
  scope.toggle = function () {
    scope.done = !scope.done
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
