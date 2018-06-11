import seed from './main';

var app = seed.create({
  id: 'test',
  // template
  scope: {
      'msg.wow': 'wow',
      hello: 'hello',
      todos: [
        {
          title: 'make this shit work',
          done: false
        },
        {
          title: 'mkae this shit kinda work',
          done: true
        }
      ],
      changeMessage: function () {
        app.scope['msg.wow'] = 'hola'
      },
      remove: function () {
        app.destroy();
      }
  }
})