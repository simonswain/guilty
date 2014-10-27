"use strict";

var _ = require('underscore');
var async = require('async');
var validate = require('./validate.js');

module.exports = function(config){

  var db = require('./db.js')(config);

  var api = {};

  api.version = {
    'guilty': '0.0.1'
  };

  /**
   * initialise the database
   */
  api.reset = function(next){

    var fs = require('fs');

    var schema = fs.readFileSync (
      __dirname + '/../db/schema.sql',
      'ascii'
    );

    schema = schema.trim();
    schema = schema.split(';');
    schema = _.reduce(
      schema,
      function(memo, sql){
        sql = sql.trim();
        if(sql !== ''){
          memo.push(sql);
        }
        return memo;
      }, []);

    async.eachSeries(
      schema,
      db.query,
      function(err){
        next();
      });

  };

  api.quit = function(done){
    db.close();
    if(done){
      done();
    }
  };

  /**
   * delete all data from the database
   */
  api.purge = function(next){

    var events = function(done){
      var sql;
      sql = "DELETE FROM events ";
      db.query(
        sql,
        function(err){
          done(err);
        });
    };

    async.series([events], next);

  };

  /**
   * get some basic stats
   */
  api.stats = function(next){

    var sql;
    sql = "SELECT ";
    sql += " (SELECT COUNT(*) FROM events) AS events ";

    db.queryOne(
      sql,
      next
    );

  };


  /**
   * all events
   */
  api.all = function(opts, next) {

    var sql;
    var args;

    args = [];

    // related objs query
    sql = "SELECT * ";
    sql += " FROM events ";
    sql += " ORDER BY at DESC";

    // sql += " ORDER BY o." + opts.sort;
    // if(opts.order === -1){
    //   sql += " DESC";
    // }

    // sql += " LIMIT " + opts.limit;
    // if(opts.base > 0){
    //   sql += " OFFSET " + opts.base;
    // }

    db.query(
      sql,
      //args,
      function(err, rows){
        next(err, rows);
      });

  };


  /**
   * shared routine to clean up opts used by #find and #count
   */
  var cleanOpts = function(opts){

    if (!opts.hasOwnProperty('type')){
      opts.type = false;
    }

    if (!opts.hasOwnProperty('sub_type')){
      opts.sub_type = false;
    }

    if (!opts.hasOwnProperty('sub_id')){
      opts.sub_id = false;
    }

    if (!opts.hasOwnProperty('obj_type')){
      opts.obj_type = false;
    }

    if (!opts.hasOwnProperty('obj_id')){
      opts.obj_id = false;
    }

    if (!opts.hasOwnProperty('verb')){
      opts.verb = false;
    }

    if (opts.hasOwnProperty('base')){
      opts.base = Number(opts.base);
    }

    if (!opts.hasOwnProperty('base') || ! opts.base || ! _.isNumber(opts.base)){
      opts.base = 0;
    }

    if (opts.hasOwnProperty('limit')){
      opts.limit = Number(opts.limit);
    }

    if (!opts.hasOwnProperty('limit') || !opts.limit || ! _.isNumber(opts.limit)) {
      opts.limit = 100;
    }

    if (!opts.hasOwnProperty('sort') || typeof opts.sort !== 'undefined') {
      opts.sort = false;
    }

    if(!opts.sort){
      opts.sort = 'at';
    }

    opts.order = 1;

    if (opts.sort && opts.sort.substr(0,1) === '-') {
      opts.order = -1;
    }

    return opts;

  };

  var keys = [
    'sub_type','sub_id',
    'verb',
    'obj_type','obj_id'
  ];

  /**
   * find a set of events
   */
  api.find = function(opts, next) {
    
    opts = cleanOpts(opts);

    if(!opts){
      return next(null, []);
    }

    var sql;
    var args = [];
    var conds = [];
    var ix = 1;
    var cx;

    // related objs query
    sql = "SELECT *";
    sql += " FROM events ";

    _.each(keys, function(key){
      if(opts[key]){
        conds.push(key + " = $" + ix);
        args.push(opts[key]);
        ix ++;
      }
    });

    // create query

    if(conds.length>0){
      sql += " WHERE ";
      sql += conds.join(" AND ");
    }

    // sql += " ORDER BY o." + opts.sort;
    // if(opts.order === -1){
    //   sql += " DESC";
    // }

    sql += " ORDER BY at DESC";

    sql += " LIMIT " + opts.limit;
    if(opts.base > 0){
      sql += " OFFSET " + opts.base;
    }

    db.query(
      sql,
      args,
      function(err, rows){
        next(err, rows);
      });

  };


  /**
   * count how many objects exists according to criteria
   */
  api.count = function(opts, next) {

    opts = cleanOpts(opts);

    if(!opts){
      return next(null, []);
    }

    var sql;
    var args = [];
    var conds = [];
    var ix = 1;
    var cx;

    // related objs query
    sql = "SELECT COUNT(*) AS count";
    sql += " FROM events ";

    _.each(keys, function(key){
      if(opts[key]){
        conds.push(key + " = $" + ix);
        args.push(opts[key]);
        ix ++;
      }
    });

    // create query

    if(conds.length>0){
      sql += " WHERE ";
      sql += conds.join(" AND ");
    }

    db.queryOne(
      sql,
      args,
      function(err, rows){
        next(err, Number(rows.count));
      });

  };


  api.filter = function(query, done){

    var response = {
      count: 0,
      data: []
    };

    var find = function(next){
      api.find(query, function(err, rows){
        response.data = rows;
        next();
      });
    };

    var count = function(next){
      api.count(query, function(err, count){
        response.count = count;
        next();
      });
    };

    async.parallel([
      find, 
      count
    ], function(){
      done(null, response);
    });

  };



  /**
   * create an event in the log
   */
  api.add = function(event, next) {

    _.each(keys, function(key){
      if(!event.hasOwnProperty(key)){
        event[key] = null;
      }
    });

    if(!event.hasOwnProperty('attrs')){
      event.attrs = {};
    }

    var add = function(done){
      var sql;
      sql = "INSERT INTO events";
      sql += " (at, sub_type, sub_id, verb, obj_type, obj_id, attrs) ";
      sql += " VALUES ";
      sql += " ($1, $2, $3, $4, $5, $6, $7) ";
      sql += " RETURNING id;";

      event.at = new Date();      

      db.queryOne(
        sql,
        [event.at,
         event.sub_type, event.sub_id,
         event.verb,
         event.obj_type, event.obj_id,
         event.attrs
        ],
        function(err, row){
          event.id = row.id;
          done();
        });
    };

    async.series(
      [add],
      function(){
        next(null, event);
      });

  };


  /**
   * get an event by id
   */
  api.get = function(id, next) {

    if (!validate.uuid(id)) {
      return next(new Error('invalid id'));
    }

    var sql;
    sql = "SELECT * ";
    sql += " FROM events ";
    sql += " WHERE id = $1";

    db.queryOne(
      sql,
      [id],
      function(err, row){
        next(err, row);
      });

  };

  /**
   * delete an event by id
   */
  api.del = function(id, next) {

    if (!validate.uuid(id)) {
      return next(new Error('invalid id'));
    }

    var sql;
    sql = "DELETE ";
    sql += " FROM events ";
    sql += " WHERE id = $1";

    db.query(
      sql,
      [id],
      function(err){
        next(err);
      });

  };

  // export the api methods
  return api;

};
