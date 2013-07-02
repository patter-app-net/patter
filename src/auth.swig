{% extends 'base.swig' %}
{% block title %}Authorization Required{% endblock %}
{% block javascript %}
  <script src="/js/core/config.js"></script>
  <script data-main="js/core/auth" src="/js/deps/require-jquery.js"></script>
  <script src="//d2zh9g63fcvyrq.cloudfront.net/adn.js"></script>
{% endblock %}

{% block body %}
  <div class="container">
    <div id="main" class="hero-unit">
      <h1>Patter Authorization</h1>
      <hr>
      <p>Patter allows you to chat privately with your friends or
      publicly in open chat rooms using
        <a href="http://app.net" target="_blank">app.net</a>. You can see our <a href="faq.html">FAQ</a> for more information about how Patter works and what it does. To begin:
        <p><a id="authorize-button" style='visibility:hidden;'>Authorize Patter</a></p>
        <p>For troubleshooting, contact @duerig.</p>
        <p>Our privacy policy is <a href="http://www.privacychoice.org/policy/mobile?policy=7e57611e9551c6105db81e5c27f3a415">here</a>.</p>
        <p>Patter interacts with <a href="http://app.net">app.net</a> on your behalf, and any message you create will be subject to their policies.</p>
    </div>
  </div>
{% endblock %}