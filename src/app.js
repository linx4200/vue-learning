import Seed from './main';
// define a seed

var data = {
  todos: [
    {
      text: '1!',
      done: false
    },
    {
      text: '2!',
      done: false
    },
    {
      text: '3!',
      done: true
    }
  ]
}

// Seed.controller
Seed.controller('TodoList', function (scope, seed) {
  scope.filter = 'all'

  scope.remaining = scope.todos.reduce(function (count, todo) {
    return count + (todo.done ? 0 : 1)
  }, 0)

  scope.addTodo = function (e) {
    var text = e.el.value
    if (text) {
      e.el.value = ''
      scope.todos.push({
        text: text,
        done: false
      })
      scope.remaining++
    }
  }
  scope.removeTodo = function (e) {
    var i = e.seed.eachIndex
    scope.todos.splice(i, 1)
    scope.remaining -= e.seed.scope.done ? 0 : 1
  }
  scope.toggleTodo = function (e) {
    e.seed.scope.done = !e.seed.scope.done;
    scope.remaining += e.seed.scope.done ? -1 : 1
  }
  scope.setFilter = function (e) {
    var filter = e.el.className
  }
})

// Seed.bootstrap
Seed.bootstrap({
  el: '#app',
  data: data
})
