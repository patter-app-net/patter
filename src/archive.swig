{% extends 'base.swig' %}
{% block title %}A chat client for App.net{% endblock %}

{% block css %}
<link rel="stylesheet" type="text/css" href="/fonts/ss-standard.css">
<link rel="stylesheet" type="text/css" href="/fonts/ss-social.css">
<link href='https://fonts.googleapis.com/css?family=Cabin:400,400italic|Open+Sans:400italic,400' rel='stylesheet' type='text/css'>
<link rel="stylesheet" style="text/css"
      href="/css/post.css" title="sms">
<link rel="stylesheet" style="text/css"
      href="/css/user.css" title="sms">
<link rel="stylesheet" style="text/css"
      href="/css/room.css" title="sms">
{% endblock %}

{% block javascript %}
  <script src="/js/core/config.js"></script>
{% endblock %}

{% block server %}
  {% if site_config.using_server %}
  <div class="container">
    <div class="navbar navbar-default">
      <div class="navbar-header">
        <a class="navbar-brand patter-logo" style="padding: 8px 20px 1px;" href="index.html"><img src="/images/patter-logo-alt.png" width="70" height="15"></a>
      </div>
    </div>
    <div class="page-header"><h1><%- name %></h1></div>
    <p><%- blurb %> </p>
    <p><% if (channelId) { %><a href="room.html?channel=<%- channelId %>" class="btn btn-primary">Chat Live</a><% } %></p>

    <% if (hasOlder) { %>
      <a href="<%= olderUrl %>" class="btn btn-default">Older</a>
    <% } %>
    <% if (hasNewer) { %>
      <a href="<%= newerUrl %>" class="btn btn-default pull-right">Newer</a>
    <% } else { %>
      <a href="<%= newerUrl %>" class="btn btn-default pull-right">Refresh</a>
    <% } %>

    <table class="table table-hover">
      <% _.each(messages, function (message) { if (! message.is_deleted) {%>
        <tr>
          <td class="danger"><a href="http://alpha.app.net/<%- message.user.username %>" target="_blank" style="color: #888888"><b>@<%- message.user.username %></b></a></td>
          <td><%= message.html %></td>
          <td width="110px"><small class="text-muted table-date"><%- message.created_at %></small></td>
        </tr>  
      <% }}) %>
    </table>

    <% if (hasOlder) { %>
      <a href="<%= olderUrl %>" class="btn btn-default">Older</a>
    <% } %>
    <% if (hasNewer) { %>
      <a href="<%= newerUrl %>" class="btn btn-default pull-right">Newer</a>
    <% } else { %>
      <a href="<%= newerUrl %>" class="btn btn-default pull-right">Refresh</a>
    <% } %>

  </div>
  {% endif %}
{% endblock %}

{% block body %}
{% endblock %}

{% block bottom_js %}
  <script type="text/javascript" src="fonts/ss-standard.js"></script>
  <script type="text/javascript" src="fonts/ss-social.js"></script>
  <script>
    (function ()
    {
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      var padZero = function (num)
      {
        var result = '' + num;
        if (num < 10)
        {
          result = '0' + num;
        }
        return result;
      }

      var now = new Date();
      var nodeList = document.querySelectorAll('.table-date');
      var i = 0;
      for (; i < nodeList.length; i += 1)
      {
        var date = new Date(nodeList[i].innerHTML);
        var month = months[date.getMonth()] + ' ' + date.getDate() + ' ';
        var year = date.getFullYear() + ' ';
        var time = date.getHours() + ':' + padZero(date.getMinutes());
        var result = '';
        if (now.getFullYear() !== date.getFullYear())
        {
          result = month + year;
        }
        else if (now.getDate() !== date.getDate() ||
                 now.getMonth() !== date.getMonth())
        {
          result = month;
        }
        else
        {
          result = 'Today ';
        }
        result += time;
        nodeList[i].innerHTML = result;
      }
    }());
  </script>
{% endblock %}
