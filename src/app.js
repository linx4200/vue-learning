import Seed from './main';

Seed.filter('money', function (value) {
  return '$' + value.toFixed(2)
})


// define a seed
Seed.seed('test', {
  // data
  total 	  : 1000,
    'msg.wow' : 'wow',
    hello 	  : 'hello',
    todos     : [
      {
        title: 'make this shit work',
        done: false
      },
      {
        title: 'make this shit kinda work',
        done: true
      }
    ],
    // handlers
    changeMessage: function () {
        this.scope['msg.wow'] = 'hola'
    },
    remove: function () {
        this.destroy()
    }
})
// boots everything
Seed.plant()