{% extends 'base.swig' %}

{% block css %}
  <link rel="stylesheet" type="text/css" href="/fonts/ss-standard.css">
  <link rel="stylesheet" type="text/css" href="/fonts/ss-social.css">
  <link rel="stylesheet" style="text/css"
        href="/css/lobby.css">
{% endblock %}

{% block faq_header %}
    <header class="menuBar">
      <a id="lobby_btn" class="header_btn" href="index.html"><span class="ss-standard ss-icon white-icon">home</span></a>
      <div id="logo"></div>
    </header>
    <br><br><br>
    <div class="container">
      <ul class="nav nav-pills">
      <li id="lang_en"><a href="faq.html">English</a></li>
      <li id="lang_de"><a href="faq_de.html">Deutsche</a></li>
      <li id="lang_pt"><a href="faq_pt.html">Portugues</a></li>
      <li id="lang_es"><a href="faq_es.html">Espanol</a></li>
    </div>

{% endblock %}

{% block bottom_js %}
  <script type="text/javascript" src="fonts/ss-standard.js"></script>
  <script type="text/javascript" src="fonts/ss-social.js"></script>
{% endblock %}
