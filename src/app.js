import Seed from './main';
// define a seed

var todos = [
  { text: 'make nesting controllers work', done: true },
  { text: 'complete ArrayWatcher', done: false },
  { text: 'computed properties', done: false },
  { text: 'parse textnodes', done: false }
]

// controller 的作用就是赋值
// Seed.controller
Seed.controller('Todos', function (scope) {
  scope.todos = todos;
  scope.filter = 'all'

  scope.completed = todos.reduce(function (count, todo) {
    return count + (todo.done ? 1 : 0)
  }, 0)

  // computed properties
  // computed properties 都必须是函数
  scope.total = function () {
    return scope.todos.length;
  }

  scope.remaining = function () {
    return scope.todos.length - scope.completed
  }

  // event handlers
  scope.addTodo = function (e) {
    var val = e.el.value
    if (val) {
      e.el.value = '';
      scope.todos.unshift({ text: val, done: false });

      // scope.total = scope.todos.length;;
    }
  }

  scope.removeTodo = function (e) {
    scope.todos.remove(e.scope);
    scope.completed -= e.scope.done ? 1 : 0;
  }

  scope.toggleTodo = function (e) {
    scope.completed += e.scope.done ? 1 : -1;
  }

  scope.setFilter = function (e) {
    scope.filter = e.el.className;
  }

  scope.removeCompleted = function () {
    scope.todos = scope.todos.filter(function (todo) {
      return !todo.done
    })
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