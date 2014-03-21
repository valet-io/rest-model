'use strict';

var Collection = require('../../src/collection');
var Request    = require('../../src/request');
var ModelBase  = require('../../src/model');

describe('Collection', function () {

  var collection;
  beforeEach(function () {
    collection = new Collection();
  });

  describe('Constructor', function () {

    it('inherits from Array', function () {
      expect(collection).to.be.an.instanceOf(Array);
    });

    it('copies the provided attributes', function () {
      expect(new Collection({foo: 'bar'}))
        .to.have.deep.property('attributes.foo', 'bar');
    });

  });

  describe('#reset', function () {

    it('empties the array', function () {
      collection.push('foo', 'bar');
      collection.reset();
      expect(collection).to.have.length(0);
    });

    it('clears the attributes', function () {
      collection.attributes = {foo: 'bar'};
      collection.reset();
      expect(collection.attributes).to.not.have.property('foo');
    });

  });

  describe('#fetch', function () {

    var send;
    beforeEach(function () {
      send = sinon.stub(Request.prototype, 'send').resolves([]);
    });

    afterEach(function () {
      send.restore();
    });

    var Model;
    beforeEach(function () {
      Model = function () {
        ModelBase.apply(this, arguments);
      };
      Model.prototype = Object.create(ModelBase.prototype);
      Model.prototype.url = function () {
        return 'http://url';
      };
      collection.model = Model;
    });

    it('fetches the base URL if no attributes are defined', function () {
      return collection.fetch().finally(function () {
        expect(send).to.have.been.calledOn(sinon.match.has('url', 'http://url'));
      });
    });

    it('adds attributes to the query string', function () {
      collection.attributes = {
        foo: 'bar',
        baz: 'qux'
      };
      return collection.fetch().finally(function () {
        expect(send).to.have.been.calledOn(sinon.match.has(
          'url', 'http://url?foo=bar&baz=qux'));
      });
    });

    it('updates existing models in the collection in place by ID', function () {
      var model = new Model({
        id: 1
      });
      collection.push(model);
      send.resolves([{
        id: 1,
        foo: 'bar'
      }]);
      return collection.fetch().finally(function () {
        expect(collection).to.have.length(1);
        expect(collection[0])
          .to.equal(model)
          .and.to.have.property('foo', 'bar');
      });
    });

    it('adds new models to the collection', function () {
      send.resolves([{
        id: 1
      }]);
      return collection.fetch().finally(function () {
        expect(collection).to.have.length(1);
        expect(collection[0])
          .to.be.an.instanceOf(Model)
          .and.to.have.property('id', 1);
      });
    });

  });

});