"use strict";

var async = require('async');
var Hapi = require('hapi');
var logger = require('./logger');
var validate = require('./validate');
var Path = require('path');

module.exports = function(opts){

  opts = opts || {};

  if(!opts.hasOwnProperty('server')){
    opts.server = {
      host: '127.0.0.1',
      port: 8102
    };
  }

  var api = require('./api.js')(opts);

  var root = __dirname + '/server/public';

  var serverOptions = {
    views: {
      engines: {
        html: require('handlebars')
      },
      path: Path.join(__dirname, 'server/views')
    }
  };
  
  var server = Hapi.createServer(
    opts.server.host, 
    opts.server.port,
    serverOptions
  );

  // asset routes - css, js, images

  server.route({
    method: 'GET',
    path: '/images/{path*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'server/public/images'),
        listing: false,
        index: false
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/vendor/{path*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'server/public/vendor'),
        listing: false,
        index: false
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/js/{path*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'server/public/js'),
        listing: false,
        index: false
      }
    }
  });

  // less

  server.pack.register({
    plugin: require('hapi-less'),
    options: {
      home: Path.join(__dirname, 'server/public/less'),
      route: '/css/{filename*}',
      less: {
        compress: true
      }
    }
  }, function (err) {
    if (err) {
      console.log('Failed loading hapi-less');
    }
  });

  // view routes - html

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.view('app');
    }
  });


  // rest methods

  server.route({
    method: 'GET',
    path: '/api',
    handler: function (request, reply) {
      reply(api.version);
    }
  });

  server.route({
    method: 'GET',
    path: '/stats',
    handler: function (request, reply) {
      api.stats(function(err, res){
        reply(res);
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/reset',
    handler: function (request, reply) {
      api.reset(function(err, res){
        reply(res);
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/events',
    handler: function (request, reply) {
      api.filter(request.query, function(err, res){
        reply(res);
      });     
    }
  });

  server.route({
    method: 'POST',
    path: '/events',
    handler: function (request, reply) {
      api.add(
        request.payload,
        function(err, obj){
          reply(obj);
        });
    }
  });

  server.route({
    method: 'DELETE',
    path: '/events/{id}',
    handler: function (request, reply) {
      api.del(
        request.params.id,
        function(err){
          reply();
        });
    }
  });

  server.route({
    method: 'GET',
    path: '/events/{id}',
    handler: function (request, reply) {
      api.get(
        request.params.id,
        function(err, obj){
          if(!obj){
            return reply(false).code(404);
          }
          reply(obj);
        });
    }
  });


  var start = function(done){
    server.start(function(){
      if(done){
        done();
      }
    });
  };

  var stop = function(done){
    api.quit(function(){
      server.stop({
        timeout: 1000
      }, function(err, res){
        done();
      });
    });
  };

  return {
    start: start,
    stop: stop
  };

};

