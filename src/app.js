import seed from './main';

var app = seed.create({
  id: 'test',
  // template
  scope: {
      msg: 'hello',
      hello: 'WHWHWHW',
      changeMessage: function () {
      app.scope.msg = 'hola'
      }
  }
})