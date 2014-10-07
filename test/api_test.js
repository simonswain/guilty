"use strict";

var async = require('async');

var config = require( '../config')(process.env.NODE_ENV);

var al = require('../lib');
var api = al.api(config);

var fooUuid = '00000000-0000-0000-0000-000000000000';

var myEvent;

exports.api = {
  'reset': function(test) {
    api.reset(function() {
      test.done();
    });
  },
  'find-none': function(test) {
    test.expect(2);
    api.find(
      {},
      function(err, objs) {
        test.equal(err, null);
        test.equal(objs.length, 0);
        test.done();
      });
  },
  'get-not-found': function(test) {
    test.expect(2);
    api.get(
      fooUuid,
      function(err, res) {
        test.equal(err, null);
        test.equal(res, false);
        test.done();
      });
  },
  'add': function(test){
    test.expect(7);

    myEvent = {
      sub_type: 'user',
      sub_id: '00000000-0000-0000-0000-000000000001',
      obj_type: 'doc',
      obj_id: '00000000-0000-0000-0000-000000000002',
      verb: 'create',
      attrs: {
        foo: 'bar'
      }
    };

    api.add(
      myEvent,
      function(err, res){
        myEvent.id = res.id;
        test.equal(err, null);
        test.equal(res.sub_type, myEvent.sub_type);
        test.equal(res.sub_id, myEvent.sub_id);
        test.equal(res.verb, myEvent.verb);
        test.equal(res.obj_type, myEvent.obj_type);
        test.equal(res.obj_id, myEvent.obj_id);
        test.deepEqual(res.attrs, myEvent.attrs);
        test.done();
      });
  },
  'get': function(test) {
    test.expect(3);
    api.get(
      myEvent.id,
      function(err, res) {
        test.equal(err, null);
        test.equal(res.id, myEvent.id);
        test.deepEqual(res.attrs, myEvent.attrs);
        test.done();
      });
  },
  'find-one': function(test) {
    test.expect(3);
    api.find(
      {},
      function(err, events) {
        test.equal(err, null);
        test.equal(events.length, 1);
        test.equal(events[0].id, myEvent.id);
        test.done();
      });
  },
  'filter-one': function(test) {
    test.expect(4);
    api.filter(
      {},
      function(err, res) {
        test.equal(err, null);
        test.equal(res.count, 1);
        test.equal(res.data.length, 1);
        test.equal(res.data[0].id, myEvent.id);
        test.done();
      });
  },
  'del': function(test) {
    test.expect(1);
    api.del(
      myEvent.id,
      function(err, res) {
        test.equal(err, null);
        test.done();
      });
  },
  'get-deleted': function(test) {
    test.expect(2);
    api.get(
      myEvent.id,
      function(err, res) {
        test.equal(err, null);
        test.equal(res, false);
        test.done();
      });
  },
  'quit': function(test) {
    api.quit(
      function(err, res) {
        test.done();
      });
  }

};
