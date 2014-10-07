"use strict";

var _ = require('underscore');
var async = require('async');

var config = require( '../config')(process.env.NODE_ENV);

var os = require('../lib');
var api = os.api(config);
var server = os.server(config);

var client = require('nodeunit-httpclient').create({
  host: config.server.host,
  port: config.server.port,
  path: '/',
  status: 200
});

var myEvent;

exports.rest = {

  setUp: function(done) {
    // setup here
    done();
  },

  'reset': function(test) {
    // just reset once, at the start of the sequence
    api.reset( function() {
      test.done();
    });
  },

  'server-start': function(test) {
    server.start(function(){
      test.done();
    });
  },

  'stats': function(test) {
    test.expect(3);
    client.get(
      test, 
      'stats', function(res) {
        test.equals(typeof res.data, 'object');
        test.ok(res.data.hasOwnProperty('events'));
        test.done();
      });
  },

  'get-none': function(test) {
    test.expect(6);
    client.get(
      test, 
      'events', function(res) {
        test.equals(typeof res.data, 'object');
        test.ok(res.data.hasOwnProperty('data'));
        test.ok(res.data.hasOwnProperty('count'));
        test.equals(res.data.count, 0);
        test.equals(res.data.data.length, 0);
        test.done();
      });
  },

  'add': function(test) {
    test.expect(9);

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

    client.post(
      test, 
      'events', {
        data: myEvent
      }, function(res) {
        myEvent.id = res.data.id;
        test.equals(typeof res.data, 'object');
        test.ok(res.data.hasOwnProperty('at')); 
        test.equal(res.data.sub_type, myEvent.sub_type);
        test.equal(res.data.sub_id, myEvent.sub_id);
        test.equal(res.data.verb, myEvent.verb);
        test.equal(res.data.obj_type, myEvent.obj_type);
        test.equal(res.data.obj_id, myEvent.obj_id);
        test.deepEqual(res.data.attrs, myEvent.attrs);
        test.done();
      });
  },

  'get-one': function(test) {
    test.expect(9);
    client.get(
      test,
      'events/' + myEvent.id, 
      function(res) {
        test.equals(typeof res.data, 'object');
        test.ok(res.data.hasOwnProperty('at'));
        test.equal(res.data.sub_type, myEvent.sub_type);
        test.equal(res.data.sub_id, myEvent.sub_id);
        test.equal(res.data.verb, myEvent.verb);
        test.equal(res.data.obj_type, myEvent.obj_type);
        test.equal(res.data.obj_id, myEvent.obj_id);
        test.deepEqual(res.data.attrs, myEvent.attrs);
        test.done();
      });
  },

  'stats-one': function(test) {
    test.expect(2);
    client.get(
      test, 
      'stats', 
      function(res) {
        test.equals(res.data.events, 1);
        test.done();
      });
  },

  'del': function(test) {
    test.expect(1);

    client.del(
      test, 
      'events/' + myEvent.id,
      function(res) {
        test.done();
      });
  },

  'del-done-stats': function(test) {
    test.expect(2);
    client.get(
      test, 
      'stats', {
      }, function(res) {
        test.equals(res.data.events, 0);
        test.done();
      });
  },

  'del-done-get?': function(test) {
    test.expect(1);
    client.get(
      test,
      'events/' + myEvent.id, {
      }, {
        status: 404
      }, function(res) {
        test.done();
      });
  },


  'server-stop': function(test) {
    server.stop(function(){
      test.done();
    });
  }

};
