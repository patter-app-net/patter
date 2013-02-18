// Category.js
//
// Handler for a category of room in the lobby

/*global define: true */
define(['jquery', 'appnet'], function ($, appnet) {
  

  function Category(id, title)
  {
    this.id = id;
    this.wrapper = $('#' + id);
    this.tag = $('<div class="span6 offset3"/>');
    this.title = title;
  }

  Category.prototype.match = function (channel)
  {
    var found = false;
    var settings = appnet.note.findPatterSettings(channel);
    var i = 0;
    if (settings.categories && settings.categories.length)
    {
      for (i = 0; i < settings.categories.length; i += 1)
      {
        if (settings.categories[i] === this.id)
        {
          found = true;
          break;
        }
      }
    }
    return found;
  };

  return Category;
});
