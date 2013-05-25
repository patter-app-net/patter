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
  <script data-main="js/core/room" src="/js/deps/require-jquery.js"></script>
{% endblock %}

{% block body %}
  <div class="container-fluid">

    <div id="main-logged" class="chatClientWrap">
      <div id="room-menu" class="navbar"></div>
      <div class="row-fluid" id="chat-display-row">
        <div class="column9 postWindow chat-history">
        </div>
        <div class="column3 userWindow user-list">
        </div>
        <div style="clear: both"></div>
      </div>
      <div class="row-fluid chatForm chat-input-row">
      </div>
    </div>

    <div id="modal-container"></div>
{% endblock %}

{% block bottom_js %}
  <script type="text/javascript" src="fonts/ss-standard.js"></script>
  <script type="text/javascript" src="fonts/ss-social.js"></script>
{% endblock %}
