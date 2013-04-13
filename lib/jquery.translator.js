(function ($) {
  var language = navigator.browserLanguage || navigator.language || navigator.userLanguage || '';
  if (language) language = language.split('-')[0];
  language = language || 'en';

  var defaults = {
    backgroundColor        : '#ffff00',
    language               : language,
    autoChangeButtonText   : true,
    sectionalNodeClassName : 'goog-trans-section',
    controlNodeClassName   : 'goog-trans-control',
    debug                  : false
  };

  var translator  = null;
  var initialized = false;
  var settings    = {};

  $.fn.translatable = function(options) {
    settings = $.extend(defaults, settings, options);

    if (!settings.contentNodeSelector || !settings.translateButtonSelector) {
error('Required options { contentNodeSelector, translateButtonSelector }');
      return;
    }

    var $elems = this;

    $elems.each(function() {
      if (this.translatable) return;
      this.translatable = true;

      var $elem = $(this);

      var $section = $(settings.contentNodeSelector, $elem)
        .addClass(settings.sectionalNodeClassName);

      $('<div/>')
        .addClass(settings.controlNodeClassName)
        .css({
          display : 'none'
        })
        .appendTo($section)
        .bind('translated', function(event, text) {
log('translated');
          var $button = $(settings.translateButtonSelector, $elem);
          $button.addClass('translated');
          if (settings.autoChangeButtonText) replaceTextNode($button.get(0).childNodes, text);
        });

      $(settings.translateButtonSelector, $elem).hide().click(function() {
        var $actual_button = $('a.goog-te-gadget-link', $elem);
        fireClickEvent($actual_button.get(0));
        var $this = $(this);
        if ($this.hasClass('translated')) {
          $this.removeClass('translated');
          if (settings.autoChangeButtonText) replaceTextNode(this.childNodes, $actual_button.text());
        }
        return false;
      });
    });

    if (!initialized) {
      initialized = true;

log('Initializing');
      window.googleSectionalElementInit = function() {
log('Start');
        translator = new google.translate.SectionalElement({
          sectionalNodeClassName : settings.sectionalNodeClassName,
          controlNodeClassName   : settings.controlNodeClassName,
          background             : settings.backgroundColor
        });
log(translator);
        $(settings.translateButtonSelector, $elems).show();

        var _hook = translator.f.Rb;
        translator.f.Rb = function() {
          var _func = arguments[2];
          var Di    = this.b.a[arguments[3]];
          arguments[2] = function() {
            try {
              _func.apply(this, arguments);
            } catch(e) {}
            var $control = $(Di.Y.Y);
            $control.trigger('translated', [$control.text()]);
          };
          _hook.apply(translator.f, arguments);
        };
      };

      $.getScript('https://translate.google.com/translate_a/element.js?' + $.param({
        cb : 'googleSectionalElementInit',
        ug : 'section',
        hl : settings.language
      }));
    }
    else {
      if (translator) {
log('Update');
        translator.update();
        $(settings.translateButtonSelector, $elems).show();
      }
      else {
        setTimeout(function() {
          $elems.translatable();
        }, 500);
      }
    }

    return this;
  };

  function replaceTextNode(childNodes, text) {
    for (var i = 0, len = childNodes.length ; i < len ; i++) {
      var node = childNodes[i];
      if (node.nodeType === 3) {
        node.nodeValue = text;
        return node;
      }
      if (node.nodeType === 1) {
        node = getTextNode(node.childNodes);
        if (node) {
          node.nodeValue = text;
          return node;
        }
      }
    }
    return null;
  }

  function fireClickEvent(elem) {
    if (elem.fireEvent) {
      elem.fireEvent('onclick');
    }
    else {
      var evt = document.createEvent('MouseEvents');
      if (evt.initMouseEvent) { // Safari
        evt.initMouseEvent('click', false, true, document.defaultView, 1, 0, 0, 0, 0,
          false, false, false, false, 0, null);
      }
      else {
        evt.initEvent('click', false, true);
        evt.shiftKey = evt.metaKey = evt.altKey = evt.ctrlKey = false;
      }
      elem.dispatchEvent(evt);
    }
  }

  function log() {
    if (!settings.debug) return;
    if (window.console && window.console.log) {
      window.console.log.apply(window.console, arguments);
    }
  }
  function error() {
    if (window.console && window.console.error) {
      window.console.error.apply(window.console, arguments);
    }
    else {
      $.error.apply($, arguments);
    }
  }
}(jQuery));