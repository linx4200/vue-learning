var keyCodes = {
  enter: 13,
  tab: 9,
  'delete': 46,
  up: 38,
  left: 37,
  right: 39,
  down: 40
};

module.exports = {

  capitalize: function (value) {
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  },

  uppercase: function(value) {
    return value.toString().toUpperCase();
  },

  currency: function (value, args) {
    if (!value) return value
    var sign = (args && args[0]) || '$',
        i = value % 3,
        f = '.' + value.toFixed(2).slice(-2),
        s = Math.floor(value).toString()
    return sign + s.slice(0, i) + s.slice(i).replace(/(\d{3})(?=\d)/g, '$1,') + f
  },

  key: function (handler, args) {
    var code = keyCodes[args[0]];
    if (!code) {
      code = parseInt(args[0], 10);
    }
    return function (e) {
      if (e.originalEvent.keyCode === code) {
        handler(e);
      }
    }
  }

  // TODO probably there's a better way.
  // Angular doesn't support delegate either
  // any real performance gain?
  // delegate: function (handler, args) {
  //   var selector = args[0]
  //   return function (e) {
  //     var oe = e.originalEvent;
  //     var target = delegateCheck(oe.target, or.currentTarget, selector);
  //     if (target) {
  //       e.el = target;
  //       e.seed = target.seed;
  //       handler.call(this, e);
  //     }
  //   }
  // }
}

// function delegateCheck (current, top, selector) {
//   if (current.webkitMatchesSelector(selector)) {
//     return current
//   } else if (current === top) {
//     return false
//   } else {
//     return delegateCheck(current.parentNode, top, selector)
//   }
// }