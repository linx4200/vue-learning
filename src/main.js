var bindingMark = 'data-element-binding';

function Element(id, initData) {
  var self = this;
  var el = self.el = document.getElementById(id);
  var bindings = {}; // the internal copy
  var data = self.data = {}; // the external interface

  function markToken (match, variable) {
    bindings[variable] = {};
    return '<span ' + bindingMark + '="' + variable +'"></span>';
  }

  // Mustache
  // 1. 替换 {{msg}} 为 <span data-element-binding="msg"> 
  // 2. 同时 bindings['msg'] = {}
  var content  = el.innerHTML.replace(/\{\{(.*)\}\}/g, markToken);
  el.innerHTML = content;
  
  // 遍历 bindings
  // $vm.data.msg = ''
  for (var variable in bindings) {
    bind(variable)
  }

  if (initData) {
    for (var variable in initData) {
      // 触发 setter, 修改 binding.msg 的 值，和对应 el 的 textContent
      data[variable] = initData[variable]  
    }
  }
  
  function bind (variable) {
    // 移除 bindingmark ( <span data-element-binding="msg"> )
    bindings[variable].els = el.querySelectorAll('[' + bindingMark + '="' + variable + '"]');
    [].forEach.call(bindings[variable].els, function (e) {
      e.removeAttribute(bindingMark)
    })

    // 把 variable 都作为 $vm.data 的属性值
    // 把 value 副本保存在 bindings 内
    Object.defineProperty(data, variable, {
      set: function (newVal) {
        [].forEach.call(bindings[variable].els, function (e) {
          bindings[variable].value = e.textContent = newVal
        })
      },
      get: function () {
        return bindings[variable].value
      }
    })
  }
}

var app = new Element('test', {
  msg: 'hello',
  what: 'world'
})