/*
 * room.js
 *
 * Handler for /archive.html endpoint
 *
 */

var config = require('./config');

var fs = require('q-io/fs');
var appnet = require(config.appnetPath);
var _ = require('underscore');

var pageSize = 50;

appnet.authorize(null, config.token);

function execute(request, response)
{
  fs.read(__dirname + '/../dist/archive.html').then(function (archiveFile) {
    try {
      setupArchive(request, response, _.template(archiveFile));
    } catch (e) { console.dir(e); }
  });
}

function setupArchive(request, response, archiveTemplate)
{
  var channelId = request.query['channel'];
  var afterId = request.query['a'];
  var beforeId = request.query['b'];
  if (! channelId ||
      (afterId && beforeId)) {
    printError(response, archiveTemplate,
               'Error: Malformed args');
  }
  else
  {
    fetchArchive(response, archiveTemplate, channelId, afterId, beforeId);
  }
}

function fetchArchive(response, archiveTemplate, channelId, afterId, beforeId)
{
  var recent = (! afterId && ! beforeId);
  var isBefore = (! afterId);
  var channel;
  var settings;
  var promise = appnet.channel.get(channelId,
                                   { include_annotations: 1,
                                     include_recent_message: 1 });
  promise.then(function (buffer) {
    try {
    buffer = JSON.parse(buffer.toString());
    channel = buffer.data;
    settings = appnet.note.find('net.patter-app.settings',
                                buffer.data.annotations);
    return processChannel(response, archiveTemplate, buffer, settings,
                          afterId, beforeId);
    } catch (e) { console.log(e); return null; }
  }).then(function (buffer) {
    try {
    if (buffer) {
      buffer = JSON.parse(buffer.toString());
      var messages = buffer.data;
      var more = buffer.meta.more;
      var data = constructData(recent, isBefore, channel, settings,
                               messages, more);
      printResponse(response, archiveTemplate, data);
    }
    }  catch (e) { console.log(e); }
  }, thenPrintError(response, archiveTemplate,
                    'Error: Failed to connect to app.net'));
}

function processChannel(response, archiveTemplate, buffer, settings,
                        afterId, beforeId)
{
  var result;
  if (buffer.data.readers['public'] && settings && settings.blurb_id)
  {
    var options = {
      count: '' + pageSize,
      include_deleted: 1
    };
    if (afterId)
    {
      options.count = '-' + pageSize;
      options.since_id = afterId;
    }
    if (beforeId)
    {
      options.count = '' + pageSize;
      options.before_id = beforeId;
    }
    result = appnet.message.getChannel(buffer.data.id, options);
  }
  else
  {
    printError(response, archiveTemplate,
               'Error: Not a public Patter channel');
  }
  return result;
}

function constructData(recent, isBefore, channel, settings, messages, more)
{
  var result = {};
  result.channelId = channel.id;
  result.name = settings.name;
  result.blurb = settings.blurb;
  result.hasOlder = (! isBefore) || (isBefore && more);
  result.hasNewer = ! recent && (isBefore || more);
  if (recent)
  {
    var messageCount = findCount(channel, messages);
    result.messages = messages.slice(0, messageCount).reverse();
  }
  else
  {
    result.messages = messages.reverse();
  }
  result.olderUrl = 'archive.html?channel=' + channel.id;
  result.newerUrl = 'archive.html?channel=' + channel.id;
  if (result.messages.length > 0)
  {
    result.olderUrl = 'archive.html?channel=' + channel.id +
      '&b=' + result.messages[0].id;
    if (result.hasNewer)
    {
      result.newerUrl = 'archive.html?channel=' + channel.id +
        '&a=' + result.messages[result.messages.length - 1].id;
    }
  }
  return result;
}

// When archive is called without a before or after id, find the size
// of the partial page which is at the end of the archive.
function findCount(channel, messages)
{
  var count = 0;
  if (channel.recent_message_id)
  {
    var extra = 0;
    while (extra < messages.length &&
           messages[extra].id !== channel.recent_message_id)
    {
      extra += 1;
    }
    count = (channel.counts.messages + extra) % pageSize;
    if (count === 0)
    {
      count = pageSize;
    }
  }
  else
  {
    count = messages.length;
  }
  return count;
}

function printResponse(response, archiveTemplate, data)
{
  var body = archiveTemplate(data);
  response.setHeader('Content-Type', 'text/html');
  response.setHeader('Content-Length', body.length);
  response.end(body);
}

function printError(response, archiveTemplate, error, extra)
{
  var blurb = '';
  if (extra)
  {
    blurb = extra;
  }
  var data = {
    name: error,
    blurb: blurb,
    channelId: '',
    messages: [],
    hasOlder: false,
    hasNewer: false,
    newerUrl: '',
    olderUrl: ''
  };
  printResponse(response, archiveTemplate, data);
}

function thenPrintError(response, archivetemplate, error)
{
  var handler = function (e)
  {
    console.log(e);
    printError(response, archiveTemplate, error, e.toString());
  };
  return handler;
}

exports.execute = execute;
