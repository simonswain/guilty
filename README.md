# Guilty

Version: 0.0.2

[![Build Status](https://travis-ci.org/simonswain/guilty.png)](https://travis-ci.org/simonswain/guilty)

Guilty is a simple activity logger for web apps.

It saves a record of who did what to whom.


## Quickstart

### Node Module

```bash
npm install guilty
```

See `config/index.sample.js` for an example of how the config object
should look.

```javascript
var log = require('guilty').api(config);

var event = {
  sub_type: 'some-subject',
  sub_id: '<guid>',
  verb: 'some-action',
  obj_type: 'some-object',
  obj_id: '<guid>',
  attrs: {options: values}
};

log.add(event, next);
```

### Simple server

```bash
npm install guilty
```

```javascript
var server = require('guilty').server(config);
server.reset(next); // inits database, deletes all data
server.start(next);
```


## Release History

* 07/10/2014 0.0.1 Pre-release verion
* 27/10/2014 0.0.2 First cut

## License

Copyright (c) 2014 Simon Swain

Licensed under the MIT license.
