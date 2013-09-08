var express = require('express');

var config = require('./config');
var room = require('./room');
var archive = require('./archive');

var app = express();

app.get('/room.html', room.execute);
app.get('/archive.html', archive.execute);
app.use(express.static(__dirname + '/../dist', { maxAge: 60 * 60 * 1000 }));

app.listen(config.port, config.ip);
console.log('Listening on port ' + config.ip + ':' + config.port);

