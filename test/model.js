'use strict';

var Model      = require('../src/model');

describe('Model', function () {

  var model;
  beforeEach(function () {
    model = new Model();
  });

  it('is an EventEmitter', function () {
    expect(model).to.respondTo('emit');
  });

  it('uses emitThen', function () {
    expect(model).to.respondTo('emitThen');
  });

  describe('Constructor', function () {

    it('sets up attributes', function () {
      expect(new Model({foo: 'bar'})).to.have.property('foo', 'bar');
    });

  });

  describe('#isNew', function () {

    it('is not new if the model has an id', function () {
      model.id = 0;
      expect(model.isNew()).to.be.false;
    });

    it('is new if the id is undefined', function () {
      model.id = undefined;
      expect(model.isNew()).to.be.true;
    });

    it('is new if the id is null', function () {
      model.id = null;
      expect(model.isNew()).to.be.true;
    });

  });

  describe('#set', function () {

    it('copies an object to the model', function () {
      expect(model.set({
        foo: 'bar'
      }))
      .to.have.property('foo', 'bar');
    });

  });

  describe('#reset', function () {

    it('removes properties from the model', function () {
      model.foo = 'bar';
      model.reset();
      expect(model).to.not.have.property('foo');
    });

    it('does not touch prototype methods', function () {
      model.reset();
      expect(model).to.respondTo('emit');
    });

    it('does not touch private properties', function () {
      model.reset();
      expect(model).to.have.property('_events');
    });

  });
  
});