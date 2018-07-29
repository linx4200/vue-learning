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
Seed.controller('Todos', function (scope, seed) {
  scope.todos = todos;
  scope.filter = 'all'

  scope.remaining = todos.reduce(function (count, todo) {
    return count + (todo.done ? 0 : 1)
  }, 0)

  // computed properties
  scope.total = todos.length;

  scope.completed = function () {
    // TODO: 依赖变化(total 和 remaining 变化)不会触发 setter
    return scope.total - scope.remaining
  }

  // event handlers
  scope.addTodo = function (e) {
    var text = e.el.value
    if (text) {
      e.el.value = '';
      scope.todos.push({
        text: text,
        done: false
      });
      scope.remaining++;
      scope.total = scope.todos.length;;
    }
  }

  scope.removeTodo = function (e) {
    scope.todos.splice(e.scope.$index, 1);
    scope.remaining -= e.scope.done ? 0 : 1;
    scope.total = scope.todos.length;
  }

  scope.toggleTodo = function (e) {
    e.seed.scope.done = !e.scope.done;
    scope.remaining += e.scope.done ? -1 : 1;
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