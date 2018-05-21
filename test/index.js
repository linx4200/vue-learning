import Vue from '../src/main';
var assert = require('assert');

describe('Vue', function () {
  it('should have a create method', function () {
    assert.ok(Vue.create)
  });
});