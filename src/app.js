import Seed from './main';

Seed.filter('money', function (value) {
  return '$' + value.toFixed(2)
})

// define a seed
var Todos = Seed.extend({
  id: 0,
  changeMessage: function () {
    this.scope['msg.wow'] = 'hola'
  },
  remove: function () {
    this.destroy()
  }
})
var todos = new Todos('#test', {
  total     : 1000,
  'msg.wow' : 'wow',
  hello     : 'hello',
  todos     : [
    {
      title: 'make this shit work',
      done: false
    },
    {
      title: 'make this shit kinda work',
      done: true
    }
  ]
})
