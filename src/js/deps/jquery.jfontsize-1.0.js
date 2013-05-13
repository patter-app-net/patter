/*
 * jQuery jFontSize Plugin
 * Examples and documentation: http://jfontsize.com
 * Author: Frederico Soares Vanelli
 *         fredsvanelli@gmail.com
 *         http://twitter.com/fredvanelli
 *         http://facebook.com/fred.vanelli
 *
 * Copyright (c) 2011
 * Version: 1.0 (2011-07-13)
 * Dual licensed under the MIT and GPL licenses.
 * http://jfontsize.com/license
 * Requires: jQuery v1.2.6 or later
 */

(function($){
    $.fn.jfontsize = function(opcoes) {
        var $this=$(this);
	    var defaults = {
		    btnMinusClasseId: '#jfontsize-minus',
		    btnDefaultClasseId: '#jfontsize-default',
		    btnPlusClasseId: '#jfontsize-plus',
            btnMinusMaxHits: 10,
            btnPlusMaxHits: 10,
            sizeChange: 1
	    };

            opcoes = $.extend(defaults, opcoes);

        var limite=new Array();
        var fontsize_padrao=new Array();

        $(this).each(function(i){
            limite[i]=0;
            fontsize_padrao[i];
        })

        $('#jfontsize-minus, #jfontsize-default, #jfontsize-plus').removeAttr('href');
        $('#jfontsize-minus, #jfontsize-default, #jfontsize-plus').css('cursor', 'pointer');

      var decreaseFont = function(i) {
        if (limite[i]>(-(opcoes.btnMinusMaxHits))){
          fontsize_padrao[i]=$(this).css('font-size');
          fontsize_padrao[i]=fontsize_padrao[i].replace('px', '');
          fontsize=$(this).css('font-size');
          fontsize=parseInt(fontsize.replace('px', ''));
          fontsize=fontsize-(opcoes.sizeChange);
          fontsize_padrao[i]=fontsize_padrao[i]-(limite[i]*opcoes.sizeChange);
          limite[i]--;
          $(this).css('font-size', fontsize+'px');
	  $(this).css('line-height', (fontsize + 6) + 'px')
        }
      }

      var increaseFont = function(i) {
        if (limite[i]<opcoes.btnPlusMaxHits){
          fontsize_padrao[i]=$(this).css('font-size');
          fontsize_padrao[i]=fontsize_padrao[i].replace('px', '');
          fontsize=$(this).css('font-size');
          fontsize=parseInt(fontsize.replace('px', ''));
          fontsize=fontsize+opcoes.sizeChange;
          fontsize_padrao[i]=fontsize_padrao[i]-(limite[i]*opcoes.sizeChange);
          limite[i]++;
          $(this).css('font-size', fontsize+'px');
	  $(this).css('line-height', (fontsize + 6) + 'px')
        }
      }

      var fontStr = $.cookie("fontSize");
      if (fontStr != null) {
	var fonts = JSON.parse(fontStr);
	if (fonts != null) {
	  $this.each(function(i) {
	    var increase = $.proxy(increaseFont, $(this));
	    var decrease = $.proxy(decreaseFont, $(this));
	    var counter = 0;
	    if (fonts.length > i) {
	      counter = fonts[i];
	    }
	    while (counter > 0) {
	      increase(i);
	      --counter;
	    }
	    while (counter < 0) {
	      decrease(i);
	      ++counter;
	    }
	  });
	}
      }

        /* Ação do Botão A- */
        $('#jfontsize-minus').click(function(){
          $this.each(decreaseFont);
	  $.cookie("fontSize", JSON.stringify(limite), { expires: 365, path: "/" });
        })

        /* Ação do Botão A */
        $('#jfontsize-default').click(function(){
          $this.each(function(i){
            limite[i]=0;
            $(this).css('font-size', fontsize_padrao[i]+'px');
	    $(this).css('line-height', (fontsize_padrao[i] + 6) + 'px')
          });
	  $.cookie("fontSize", JSON.stringify(limite), { expires: 365, path: "/" });
        })

        /* Ação do Botão A+ */
        $('#jfontsize-plus').click(function(){
          $this.each(increaseFont);
	  $.cookie("fontSize", JSON.stringify(limite), { expires: 365, path: "/" });
        })
    };
})(jQuery);