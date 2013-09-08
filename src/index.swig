{% extends 'base.swig' %}
{% block javascript %}
<script data-main="js/core/lobby" src="/js/deps/require-jquery.js"></script>
{% endblock %}
{% block body  %}
  <div class="container" id="main-body" style="display: none">

    <div id="main-lobby">
      <div class="navbar navbar-default" role="navigation">
        <div class="navbar-header">
    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
      <span class="sr-only">Toggle navigation</span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
    </button>
          <a class="navbar-brand patter-logo" href="index.html"><img src="/images/patter-logo-alt.png" width="70" height="15"></a>
        </div>
        <div class="collapse navbar-collapse navbar-ex1-collapse">
          <ul class="nav navbar-nav">
            <li><a href="" id="create-patter-button">Create Room</a></li>
            <li><a href="" id="create-pm-button">Compose Private Message</a></li>
          </ul>
          <ul class="nav navbar-nav navbar-right">
            <li><a href="" id="auto-refresh">Auto-Refresh: On</a></li>
            <li><a href="faq.html">FAQ (en)</a></li>
            <li><a href="faq_de.html">FAQ (de)</a></li>
            <li><a href="" id="logout-button">Logout</a></li>
          </ul>
        </div>
      </div>

      <div class="well well-small hidden" id="refresh-wrapper">
        <a href="" id="refresh" class="btn btn-success"><i class="icon-refresh"></i> Refresh</a>
      </div>

      <div class="tabbable tabs-left">
        <ul class="nav nav-tabs">
          <li id="home-tab" class="active"><a href="#home" data-toggle="tab">Home</a></li>
          <li id="room-tab"><a href="#rooms" data-toggle="tab">My Rooms</a></li>
          <li id="pm-tab"><a href="#pms" data-toggle="tab">Private Messages</a></li>
<!--
          <li><a href="#general" data-toggle="tab">General</a></li>
          <li><a href="#fun" data-toggle="tab">Fun</a></li>
          <li><a href="#lifestyle" data-toggle="tab">Lifestyle</a></li>
          <li><a href="#profession" data-toggle="tab">Professional</a></li>
          <li><a href="#language" data-toggle="tab">Language/Region</a></li>
          <li><a href="#community" data-toggle="tab">Community</a></li>
          <li><a href="#tech" data-toggle="tab">Tech</a></li>
          <li><a href="#event" data-toggle="tab">Event</a></li>
-->
        </ul>
        <div class="tab-content">
          <div id="home" class="tab-pane active">
          <div id="results-view">
            <h1 id="results-heading"></h1>
            <table id="results-body"></table>
          </div>
          <div id="default-view">
          <div class="row">
            <div class="col-md-9">
              <h1>Welcome to Patter</h1>
              <p>With Patter, you can chat privately with friends or join public chat rooms. There are a few options below for finding rooms to chat in:</p>
              <div class="panel panel-default">
                <div class="panel-body">
                  <p>Search the Patter directory for rooms on a particular topic.</p>
                  <form role="form" class="form-inline" id="search-rooms">
                    <div class="form-group">
                      <label class="sr-only" for="search-text">Search Public Directory</label>
                      <input type="text" class="form-control" id="search-text" placeholder="Search Directory">
                    </div>
                    <button type="submit" class="btn btn-default"><i class="icon-search"></i></button>
                  </form>
                </div>
              </div>
              <div class="panel panel-default">
                <div class="panel-body">
                  <p>Browse recently-created rooms in the Patter directory.</p>
                  <button class="btn btn-default" id="recent-rooms">Recent Rooms</button>
                </div>
              </div>
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

      </div></div>


          </div>
          <div id="rooms" class="tab-pane"><h1>Loading</h1></div>
          <div id="pms" class="tab-pane"><h1>Loading</h1></div>
<!--
          <div id="general" class="tab-pane"><h1>Loading</h1></div>
          <div id="fun" class="tab-pane"><h1>Loading</h1></div>
          <div id="lifestyle" class="tab-pane"><h1>Loading</h1></div>
          <div id="profession" class="tab-pane"><h1>Loading</h1></div>
          <div id="language" class="tab-pane"><h1>Loading</h1></div>
          <div id="community" class="tab-pane"><h1>Loading</h1></div>
          <div id="tech" class="tab-pane"><h1>Loading</h1></div>
          <div id="event" class="tab-pane"><h1>Loading</h1></div>
-->
        </div>
      </div>

    </div>

    <div id="modal-container"></div>
{% endblock %}
