import seed from './main';

var app = seed.create({
  id: 'test',
  // template
  scope: {
      'msg.wow': 'wow',
      hello: 'hello',
      changeMessage: function () {
        app.scope['msg.wow'] = 'hola'
      },
      remove: function () {
        app.destroy();
      }
  }
})