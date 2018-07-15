import Seed from './main';
// define a seed

var todos = [
  { text: 'make nesting controllers work', done: true },
  { text: 'complete ArrayWatcher', done: false },
  { text: 'computed properties', done: false },
  { text: 'parse textnodes', done: false }
]

// Seed.controller
Seed.controller('Todos', function (scope, seed) {
  scope.todos = todos;
  scope.filter = 'all'

  scope.remaining = todos.reduce(function (count, todo) {
    return count + (todo.done ? 0 : 1)
  }, 0)

  // computed properties
  scope.total = function () {
    return scope.todos.length
  }

  scope.completed = function () {
    return scope.todos.length - scope.remaining
  }

  // event handlers
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
    scope.todos.splice(e.seed.index, 1)
    scope.remaining -= e.seed.scope.done ? 0 : 1
  }
  scope.toggleTodo = function (e) {
    e.seed.scope.done = !e.seed.scope.done;
    scope.remaining += e.seed.scope.done ? -1 : 1
  }
  scope.setFilter = function (e) {
    scope.filter = e.el.className;
  }
})

// Seed.controller('Grandpa', function (scope, seed) {
//   scope.name = 'John'
// })

// Seed.controller('Dad', function (scope, seed) {
//   scope.name = 'Jack'
// })

// Seed.controller('Son', function (scope, seed) {
//   scope.name = 'Jason'
// })

// Seed.controller('Baby', function (scope, seed) {
//   scope.name = 'James'
// })

Seed.bootstrap()