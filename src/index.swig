{% extends 'base.swig' %}

{% block css %}
  <link rel="stylesheet" type="text/css" href="/fonts/ss-standard.css">
  <link rel="stylesheet" type="text/css" href="/fonts/ss-social.css">
  <link rel="stylesheet" style="text/css"
        href="/css/jqcloud.css">
  <link rel="stylesheet" style="text/css"
        href="/css/lobby.css">
{% endblock %}

{% block javascript %}
<script data-main="js/core/lobby" src="/js/deps/require-jquery.js"></script>
{% endblock %}
{% block body  %}
    <header class="menuBar">
      <a id="lobby_btn" class="header_btn" href="index.html" data-toggle="dropdown" data-target="#compose"><span class="ss-standard ss-icon white-icon" style="color: white">plus</span></a>

      <div id="logo"></div>

      <a id="room_btn" data-toggle="dropdown" data-target="#settings" class="header_btn"><span class="ss-standard ss-icon white-icon">gear</span></a>

      <div id="compose" class="dropdown">
        <ul class="dropdown-menu" role="menu">
          <li role="presentation"><a role="menuitem" id="compose-pm" href="#" data-toggle="dropdown" data-target="#compose">Send Private Message</a></li>
          <li role="presentation"><a role="menuitem" id="compose-room" href="#" data-toggle="dropdown" data-target="#compose">Create Room</a></li>
        </ul>
      </div>


      <div id="settings" class="dropdown pull-right">
        <ul class="dropdown-menu" role="menu">
          <li role="presentation" class="dropdown-header" id="username">@username</li>
          <li role="presentation" class="divider"></li>
          <li role="presentation"><a role="menuitem" href="" id="options-button">Options</a></li>
          <li role="presentation"><a role="menuitem" href="faq.html">FAQ</a></li>
          <li role="presentation" class="divider"></li>
          <li role="presentation"><a role="menuitem" id="logout" href="#" data-toggle="dropdown" data-target="#settings">Logout</a></li>
        </ul>
      </div>
    </header>

  <div class="container" id="main-body">

    <div id="main-lobby">

<br/><br/><br/>

      <div class="tabbable tabs-left">
        <ul class="nav nav-tabs">
          <li id="home-tab" class="active"><a href="#home" data-toggle="tab">Home</a></li>
          <li id="room-tab" style="display: none"><a id="room-tab-link" href="#rooms" data-toggle="tab">My Rooms <span class="badge" style="display: none" id="unread"></span></a></li>
          <li id="pm-tab" style="display: none"><a id="pm-tab-link" href="#pms" data-toggle="tab">Private Messages <span class="badge" style="display: none" id="unread"></span></a></li>
          <li id="public-tab" style="display: none"><a id="public-tab-link" href="#public" data-toggle="tab">Public Rooms</a></li>
          <li id="search-tab" style="display: none"><a id="search-tab-link" href="#search" data-toggle="tab">Search</a></li>
        </ul>
        <div class="tab-content">
          <div id="home" class="tab-pane active">
            <div class="row">
              <div class="col-md-9">
                <div id="fallback-home" style="display: none">
                  <h1>Welcome to Patter</h1>
                  <p>With Patter, you can chat privately with friends or join public chat rooms. There are several ways to get started:</p>
                  <div class="row well well-small">
                  <div class="col-md-3"><button id="new-find-rooms" class="btn btn-primary">Find Public Rooms</button></div><div class="col-md-9"> Find a public room about a topic you are interested in.</div>
                  </div>
                  <br>
                  <div class="row well well-small">
                  <div class="col-md-3"><button id="new-send-pm" class="btn btn-primary">Private Message</button></div><div class="col-md-9"> If you already have friends here, send them a message.</div>
                  </div>
                  <br>
                  <div class="row well well-small">
                  <div class="col-md-3"><a href="http://test.patter-app.net/room.html?channel=964" class="btn btn-primary">Welcome to Patter</a></div><div class="col-md-9"> If you have questions about how to use Patter or suggestions for how to make it better, come say hi.</div>
                  </div>
                </div>
                <div id="loading-home">
                  <div class="text-center">
                    <h4>Loading...</h4>
                    <img src="images/spinner-big.gif" width="32" height="32"
                         alt="Loading...">
                  </div>
                </div>
                <div id="error-home" style="display: none">
                  <div class="text-center">
                    <h4>Failed on Load</h4>
                    <p id="error-message"></p>
                    <button id="retry-button" class="btn btn-default">Retry</button>
                  </div>
                </div>
                <div id="main-home" style="display: none"></div>
              </div>
              <div class="col-md-3">
                <h3>Patter News</h3>
                <iframe frameborder="0" src="http://blog-app.net/embed.html#2508" width="100%" height="600" >
                </iframe>
              </div>
            </div>

      <br>
      <div class="well well-small">
        <p>For troubleshooting, contact <a href="http://alpha.app.net/duerig">@duerig</a>. In-room design by <a href="http://alpha.app.net/zenimpulse">@zenimpulse.</a>. Patter for iOS was created by <a href="http://alpha.app.net/boxenjim">@boxenjim</a>. The Patter logo was created by <a href="http://alpha.app.net/tellingtales">@tellingtales</a>.</p>
      </div>
      <div class="well well-small">
        <p>If you wish to buy me a coffee or help pay my way to the upcoming hackathon, here is a button for you. Include your app.net name if you want me to know who donated:</p>

<form action="https://www.paypal.com/cgi-bin/webscr" method="post">
<input type="hidden" name="cmd" value="_s-xclick">
<table>
<tr><td><input type="hidden" name="on0" value="app.net username">app.net username</td></tr><tr><td><input type="text" name="os0" maxlength="200"></td></tr>
</table>
<input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----
">
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_paynowCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
</form>

      </div>


          </div>
          <div id="rooms" class="tab-pane"></div>
          <div id="pms" class="tab-pane"></div>
          <div id="public" class="tab-pane"></div>
          <div id="search" class="tab-pane"></div>
        </div>
      </div>

    </div>

    <div id="modal-container"></div>
    <div id="options-wrapper"></div>
{% endblock %}

{% block bottom_js %}
  <script type="text/javascript" src="fonts/ss-standard.js"></script>
  <script type="text/javascript" src="fonts/ss-social.js"></script>
{% endblock %}
