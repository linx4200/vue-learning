import Seed from '../../src/main';
// define a seed

var todos = [
  { text: 'make nesting controllers work', done: true },
  { text: 'complete ArrayWatcher', done: false },
  { text: 'computed properties', done: false },
  { text: 'parse textnodes', done: false }
];

// controller 的作用就是赋值
// Seed.controller
Seed.controller('Todos', function (scope) {

  // regular properties -----------------------------------------------------
  scope.todos = todos;
  scope.filter = 'all';
  scope.allDone = false;

  scope.remaining = todos.reduce(function (count, todo) {
    return count + (todo.done ? 0 : 1)
  }, 0)

  // computed properties ----------------------------------------------------
  // computed properties 都必须是函数
  scope.total = function () {
    return scope.todos.length;
  }

  scope.completed = function () {
    return scope.total() - scope.remaining;
  }

  scope.itemLabel = function () {
    return scope.remaining > 1 ? 'items' : 'item'
}

  // event handlers ---------------------------------------------------------
  scope.addTodo = function (e) {
    var val = e.el.value
    if (val) {
      e.el.value = '';
      scope.todos.unshift({ text: val, done: false });
      scope.remaining++;
      // scope.total = scope.todos.length;;
    }
  }

  scope.removeTodo = function (e) {
    scope.todos.remove(e.scope);
    scope.remaining -= e.scope.done ? 0 : 1;
  }

  scope.updateCount = function (e) {
    scope.remaining += e.scope.done ? -1 : 1;
  }

  scope.edit = function (e) {
    e.scope.editing = true
  }

  scope.stopEdit = function (e) {
    e.scope.editing = false
  }

  scope.setFilter = function (e) {
    scope.filter = e.el.dataset.filter;
  }

  scope.removeCompleted = function () {
    scope.todos = scope.todos.filter(function (todo) {
      return !todo.done;
    })
}
})

Seed.bootstrap();