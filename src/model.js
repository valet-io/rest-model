'use strict';

var Promise = require('bluebird');
var needle  = Promise.promisifyAll(require('needle'));
var extend  = require('extend');

var internals = {};

internals.populate = function (attributes) {
  extend(this, attributes);
  return this;
};

internals.save = function () {
  var method = this.isNew() ? 'POST' : 'PUT';
  return [method, this.url(), this, {
    json: true
  }];
};

internals.validate = function (response) {
  return response;
};

internals.disallowNew = function (method) {
  if (this.isNew()) throw new Error('Cannot ' + method + ' a new model');
};

var Model = function (attributes) {
  internals.populate.call(this, attributes);
};

Model.prototype.isNew = function () {
  return (typeof this.id === 'undefined' || this.id === null);
};

Model.prototype.url = function () {
  return this.base + '/' + this.path + (this.isNew() ? '' : '/' + this.id);
};

Model.prototype.reset = function () {
  Object.keys(this)
    .forEach(function (key) {
      this[key] = undefined;
    }, this);
  return this;
};

Model.prototype.fetch = Promise.method(function () {
  internals.disallowNew.call(this, 'fetch');
  return needle
    .getAsync(this.url())
    .then(internals.validate)
    .bind(this)
    .get('body')
    .then(internals.populate);
});

Model.prototype.save = function () {
  return Promise
    .bind(this)
    .then(internals.save)
    .spread(needle.requestAsync)
    .then(internals.validate)
    .get('body')
    .then(internals.populate);
};

Model.prototype.destroy = Promise.method(function () {
  internals.disallowNew.call(this, 'destroy');
  return needle
    .deleteAsync(this.url())
    .bind(this)
    .then(internals.validate)
    .then(this.reset);
});

module.exports = Model;