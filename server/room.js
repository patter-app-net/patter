/*
 * room.js
 *
 * Handler for /room.html endpoint
 *
 */

var config = require('./config');

var fs = require('q-io/fs');
var appnet = require(config.appnetPath);
var _ = require('underscore');

function execute(request, response)
{
  fs.read(__dirname + '/../dist/room.html').then(function (roomFile) {
    try {
    fetchRoom(request, response, _.template(roomFile));
    } catch (e) { console.log(e); }
  });
}

function fetchRoom(request, response, roomTemplate)
{
  response.setHeader('Content-Type', 'text/html');
  var channelId = request.query['channel'];
  if (! channelId)
  {
    skipServer(request, response, roomTemplate)();
  }
  else
  {
    appnet.authorize(null, config.token);
    var promise = appnet.channel.get(channelId, {include_annotations: 1});
    promise.then(function (buffer) {
      try {
      buffer = JSON.parse(buffer.toString());
      var settings = appnet.note.find('net.patter-app.settings',
                                      buffer.data.annotations);
      if (buffer.data.readers['public'] && settings && settings.blurb_id)
      {
        var blurb = '';
        if (settings.blurb)
        {
          blurb = settings.blurb;
        }
        var data = {
          name: settings.name,
          blurb: blurb,
          channelId: channelId
        };
        var body = roomTemplate(data);
        response.setHeader('Content-Length', body.length);
        response.end(body);
      }
      else
      {
        skipServer(request, response, roomTemplate)();
      }
    } catch (e) { console.log(e); }
    }, skipServer(request, response, roomTemplate));
  }
}

function skipServer(request, response, roomTemplate)
{
  var handler = function (error)
  {
    var body = roomTemplate({ name: '', blurb: '', channelId: '' });
    response.setHeader('Content-Length', body.length);
    response.end(body);
  };
  return handler;
}

exports.execute = execute;
