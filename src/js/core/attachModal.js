// attachModal.js
//
// A dialog box for attaching links, images, files, or pastes to a chat.

/*global define:true */
define(['jquery', 'util', 'appnet',
       'text@template/attachModal.html'],
function ($, util, appnet, attachTemplate) {
  'use strict';

  var attachModal = {};

  attachModal.init = function ()
  {
    var that = this;
    $('#modal-container').append(attachTemplate);
    this.root = $('#attach-modal');
    this.root.find('#attach-form').on('submit', function (event) {
      event.preventDefault();
      that.root.find('#attach-confirm').click();
      return false;
    });
    this.root.find('#attach-confirm').click($.proxy(this.clickConfirm, this));
  };

  attachModal.show = function ()
  {
    this.root.find('#attach-modal').modal();
  };

  attachModal.clickConfirm = function (event)
  {
  };

  return attachModal;
});
