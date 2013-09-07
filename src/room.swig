{% extends 'base.swig' %}
{% block title %}A chat client for App.net{% endblock %}

{% block css %}
<link rel="stylesheet" type="text/css" href="/fonts/ss-standard.css">
<link rel="stylesheet" type="text/css" href="/fonts/ss-social.css">
<link href='https://fonts.googleapis.com/css?family=Cabin:400,400italic|Open+Sans:400italic,400' rel='stylesheet' type='text/css'>
<!--
<link rel="stylesheet" style="text/css"
      href="/css/post.css" title="sms">
<link rel="stylesheet" style="text/css"
      href="/css/user.css" title="sms">
<link rel="stylesheet" style="text/css"
      href="/css/room.css" title="sms">
-->
<link rel="stylesheet" style="text/css"
      href="/css/reset.css" title="sms">
<link rel="stylesheet" style="text/css"
      href="/css/style.css" title="sms">
                                                                                   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-status-bar-style" content="black" />
   <meta name="viewport" content = "width=device-width, initial-scale=1.0, user-scalable=no" />
{% endblock %}

{% block javascript %}
  <script src="/js/core/config.js"></script>
  <script data-main="js/core/room" src="/js/deps/require-jquery.js"></script>
{% endblock %}

{% block server %}
  {% if site_config.using_server %}
  <% if (name !== '') { %>
    <div class="modal fade" id="intro-modal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title"><%- name %></h4>
          </div>
          <div class="modal-body">
            <p><%- blurb %></p>
          </div>
          <div class="modal-footer">
            <a href="archive.html?channel=<%- channelId %>" class="btn btn-default pull-left">Archive</a>
            <button type="button" class="btn btn-primary" data-dismiss="modal">Ok</button>
          </div>
        </div>
      </div>
    </div>
  <% } %>
  {% endif %}
{% endblock %}

{% block body %}
  <div id="container">
    <header class="menuBar">
      <a id="lobby_btn" class="header_btn" href="index.html"><span class="ss-standard ss-icon white-icon">home</span></a>
      <div id="logo"></div>
      <a id="room_btn" data-toggle="dropdown" data-target="#settings" class="header_btn"><span class="ss-standard ss-icon white-icon">gear</span></a>
      <div id="settings" class="dropdown pull-right">
        <ul class="dropdown-menu" role="menu">
          <li role="presentation"><a role="menuitem" id="subscribe" href="#" data-toggle="dropdown" data-target="#settings">Subscribe</a></li>
          <li role="presentation"><a role="menuitem" id="view" href="#" data-toggle="dropdown" data-target="#settings">View Room</a></li>
          <li role="presentation"><a role="menuitem" id="archive" href="archive.html" target="_blank" data-toggle="dropdown" data-target="#settings">Archive</a></li>
          <li role="presentation" class="divider"></li>
          <li role="presentation"><a role="menuitem" id="help" href="faq.html" target="_blank" data-toggle="dropdown" data-target="#settings">Help</a></li>
        </ul>
      </div>
    </header>

    <section id="content">

      <div id="room_header">
        <h1 class="room_title"><span class="participants"></span></h1>
      </div>
      <div id="messages">
        <ul class="messageList">
        </ul>
      </div>

      <div id="users">
        <ul class="userList">
        </ul>
      </div>
    </section>
    <footer>
      <div id="chatInput">
        <form id="chat-form">
          <input type="text" id="chatBox" placeholder="Enter text here." maxlength="2000" autofocus="true">
        </form>
        <a id="chatSend"><span class="ss-standard ss-icon white-icon">Chat</span></a>
        <a id="chatBroadcast"><span class="ss-standard ss-icon white-icon">Wifi</span></a>
        <a id="chatEmbed"><span class="ss-standard ss-icon white-icon">Attach</span></a>
      </div>
      <div class="must-authorize">
        <p>You must <a class="authorizeButton btn btn-primary">Authorize</a>
           Patter to chat.</p>
      </div>
      <div class="read-only">
        <p>This room is read-only. You can watch, but not chat.</p>
      </div>
    </footer>

  </div>

  <div id="modal-container"></div>
{% endblock %}

{% block bottom_js %}
  <script type="text/javascript" src="fonts/ss-standard.js"></script>
  <script type="text/javascript" src="fonts/ss-social.js"></script>
{% endblock %}
