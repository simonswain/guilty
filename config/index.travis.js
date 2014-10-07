module.exports = function(env){

  var env = process.env.NODE_ENV || 'development';

  var nickname = 'al';

  var server = {
    host: 'localhost',
    port: 8103
  };

  var db = {
    url: 'postgres://postgres@localhost:5432/al_test'
  };

  return {
    nickname: nickname,
    env: 'test',
    server: server,
    db: db
  };

};
