// RoomMenu.js
//
// Handlers for the menu bar

/*global define: true */
define(['jquery', 'appnet', 'js/roomInfo', 'js/editRoomModal',
        'text!template/roomMenu.html',
        'jquery-jfontsize'],
function ($, appnet, roomInfo, editRoomModal, menuTemplate) {
  

  var roomMenu = {};

  var container;

  roomMenu.init = function (menuContainer, history)
  {
    container = menuContainer;
    container.append(menuTemplate);

    initNotify();
    $('#edit-room-button').click(clickEditRoom);
    $('#subscribe-button').click(clickSubscribe);
    initFontsize(history);
    editRoomModal.init();
    roomMenu.updateChannelView();
  };

  function initNotify()
  {
    var button = $('#notify-button', container);
    if (window.webkitNotifications &&
        window.webkitNotifications.checkPermission() !== 0) {
      button.show();
      button.click(clickNotify);
    } else {
      button.hide();
    }
  }

  function clickNotify(event)
  {
    event.preventDefault();
    window.webkitNotifications.requestPermission();
    $('#notify-button', container).hide();
    return false;
  }

  function clickEditRoom(event)
  {
    event.preventDefault();
    editRoomModal.update(roomInfo.channel);
    editRoomModal.show();
    return false;
  }

  function clickSubscribe(event)
  {
    event.preventDefault();
    toggleSubscribe();
    return false;
  }

  function initFontsize(history)
  {
    $('#chat-display-row').jfontsize({
      btnMinusClasseId: '#jfontsize-minus',
      btnDefaultClasseId: '#jfontsize-default',
      btnPlusClasseId: '#jfontsize-plus',
      btnMinusMaxHits: 2,
      btnPlusMaxHits: 9,
      sizeChange: 3
    });
    var scrollMethod = $.proxy(history.scrollToBottom, history);
    $('#jfontsize-minus').click(scrollMethod);
    $('#jfontsize-default').click(scrollMethod);
    $('#jfontsize-plus').click(scrollMethod);
  }

  roomMenu.updateChannelView = function ()
  {
    var name = appnet.note.findPatterName(roomInfo.channel);
    if (! name)
    {
      name = 'PM';
    }
    var status = appnet.renderStatus(roomInfo.channel);
    $('#room-name').html('<strong>' + name + '</strong>');
    $('#room-status').html(status);
    if (roomInfo.channel.you_subscribed) {
      $('#subscribe-button').html('Unsubscribe');
    } else {
      $('#subscribe-button').html('Subscribe');
    }
    if (editRoomModal.canEditChannel(roomInfo.channel)) {
      $('#edit-room-button').html('Edit Room');
    } else {
      $('#edit-room-button').html('View Room');
    }
  };

  function toggleSubscribe()
  {
    if (roomInfo.channel.you_subscribed)
    {
      appnet.api.deleteSubscription(roomInfo.id, { include_annotations: 1 },
                                    $.proxy(roomInfo.completeChannelInfo,
                                            roomInfo),
                                    failToggleSubscribe);
    }
    else
    {
      appnet.api.createSubscription(roomInfo.id, { include_annotations: 1 },
                                    $.proxy(roomInfo.completeChannelInfo,
                                            roomInfo),
                                    failToggleSubscribe);
    }
  }

  function failToggleSubscribe(response)
  {
  }

  return roomMenu;
});
