{% extends 'base.swig' %}
{% block title %}A chat client for App.net{% endblock %}

{% block css %}
<link rel="stylesheet" type="text/css" href="/fonts/ss-standard.css">
<link rel="stylesheet" type="text/css" href="/fonts/ss-social.css">

<script type='text/javascript'>
(function () {
  var styles = [
    'https://fonts.googleapis.com/css?family=Cabin:400,400italic|Open+Sans:400italic,400',
    '/css/post.css',
    '/css/user.css',
    '/css/room.css'
  ];

  var query = window.location.search.substring(1);
  var vars = query.split('&');
  var query_params = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    query_params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  console.log(query_params);
  // replace the default styles with your own
  if (query_params['replace_styles']) {
    styles = query_params['replace_styles'].split(',');
  }
  // Append styles to the default styles
  if (query_params['append_styles']) {
    styles.push(query_params['append_styles']);
  }

  for (var i = 0; i < styles.length; i++) {
    document.write('<link rel="stylesheet" type="text/css" href="' + styles[i] + '">');
  }

}())
</script>

{% endblock %}

{% block javascript %}
<script>
  window.PATTER = window.PATTER || {};
  window.PATTER.embedded = true;
</script>
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
