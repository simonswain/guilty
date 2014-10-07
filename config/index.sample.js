module.exports = function(env){

  var env = process.env.NODE_ENV || 'development';

  var nickname = 'al';

  var pg = {
    host:'localhost',
    port: 5432,
    username: nickname,
    password: nickname,
    database: ''
  };

  var server = {
    host: '127.0.0.1',
    port: 8102
  };

  switch ( env ) {
  case 'test' :
    exports.port = 8103;
    pg.database = nickname + '_test';
    break;

  case 'development' :
    exports.port = 8102;
    pg.database = nickname + '_dev';
    break;

  case 'production' :
    exports.port = 8101;
    pg.database = nickname + '_live';
    break;
  }

  var db = {
    url: 'postgres://' + pg.username + ':' + pg.password + '@' + pg.host + '/' + pg.database
  };

  return {
    nickname: nickname,
    env: env,
    server: server,
    db: db
  };

};
