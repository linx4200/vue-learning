import Seed from './main';

Seed.filter('money', function (value) {
  return '$' + value.toFixed(2)
})

// define a seed
var list = [
  {
    title: 'make this shit kinda work',
    done: true
  },
  {
    title: 'make this shit work',
    done: false
  },
  {
    title: 'more feature!',
    done: false
  }
]

var s = Date.now();

var todos = new Seed('#test', {
  total     : Math.random() * 100000,
  'msg.wow' : 'wow',
  hello     : 'hello',
  todos     : list,
  changeMessage: function () {
    this.scope['msg.wow'] = 'hola'
  },
  remove: function () {
    this.destroy()
  }
})

console.log(Date.now() - s + 'ms')
