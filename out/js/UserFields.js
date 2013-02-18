// UserFields.js
//
// Expandable list of input fields which are validated against app.net

/*global define:true */
define(['jquery', 'util', 'appnet'],
function ($, util, appnet) {
  
  function UserFields(prefix)
  {
    this.prefix = prefix;
    this.moreDiv = $('#' + prefix + '-more-div');
    this.fieldCount = 0;
    this.memberNames = {};
    this.callback = null;
    $('#' + prefix + '-more-button').click($.proxy(this.clickMore, this));
  }

  UserFields.prototype.clickMore = function (event)
  {
    event.preventDefault();
    this.addField();
    return false;
  };

  // Create a new user name field
  UserFields.prototype.addField = function (val)
  {
    var fieldset = $('<fieldset/>');
    var newItem = $('<div id="' + this.prefix + '-wrapper-' +
                    this.fieldCount +
                    '" class="input-append control-group pull-left"/>');
    newItem.append('<input id="' + this.prefix + '-input-' + this.fieldCount +
                   '" class="input" type="text" placeholder="@user">');
    newItem.append('<button tabindex="-1" id="' + this.prefix + '-remove-' +
                   this.fieldCount +
                   '" class="btn btn-danger"><i class="icon-remove"></i></button>');
    fieldset.append(newItem);
    this.moreDiv.before(fieldset);
    if (val) {
      $('#' + this.prefix + '-input-' + this.fieldCount).val(val);
    }
    $('#' + this.prefix + '-remove-' + this.fieldCount).on('click', null, { index: this.fieldCount, obj: this }, function (event) {
      event.preventDefault();
      event.data.obj.removeField(event.data.index);
      return false;
    });
    this.fieldCount += 1;
  };

  // Remove a new user name field
  UserFields.prototype.removeField = function (index)
  {
    var i = 0;
    if (index >= 0 && index < this.fieldCount) {
      $('#' + this.prefix + '-wrapper-' + index).remove();
      var vals = [];
      for (i = index + 1; i < this.fieldCount; i += 1)
      {
        vals.push($('#' + this.prefix + '-input-' + i).val());
        $('#' + this.prefix + '-wrapper-' + i).remove();
      }
      this.fieldCount = index;
      for (i = 0; i < vals.length; i += 1)
      {
        this.addField(vals[i]);
      }
    }
  };

  // Check validity of names, mark invalid names, then callback with a
  // list of names or an empty list on failure.
  UserFields.prototype.checkNames = function (callback)
  {
    this.callback = callback;
    this.memberNames = {};
    var foundName = false;
    var i = 0;
    for (i = 0; i < this.fieldCount; i += 1) {
      var newName = $('#' + this.prefix + '-input-' + i).val();
      if (newName.substr(0, 1) !== '@')
      {
        newName = '@' + newName;
      }
      if (newName !== '' && newName !== '@')
      {
        this.memberNames[newName] = i;
        foundName = true;
      }
    }
    if (foundName)
    {
      appnet.api.getUserList(Object.keys(this.memberNames),
                             { include_annotations: 1 },
                             $.proxy(this.processNames, this),
                             $.proxy(this.failNames, this));
    }
    else
    {
      this.callback([]);
    }
  };

  UserFields.prototype.failNames = function (response)
  {
    util.flagError(this.prefix + '-error-div',
                   'Could not connect to app.net');
    if (this.callback)
    {
      this.callback(null);
    }
  };

  UserFields.prototype.processNames = function (response)
  {
    var validNames = {};
    var i = 0;
    for (i = 0; i < response.data.length; i += 1)
    {
      validNames['@' + response.data[i].username] = 1;
    }
    var keys = Object.keys(this.memberNames);
    var allOk = true;
    for (i = 0; i < keys.length; i += 1)
    {
      var index = this.memberNames[keys[i]];
      $('#' + this.prefix + '-wrapper-' + index).removeClass('error');
      if (validNames[keys[i]] === undefined)
      {
        allOk = false;
        $('#' + this.prefix + '-wrapper-' + index).addClass('error');
      }
    }
    var callbackArray = null;
    if (allOk)
    {
      callbackArray = keys;
    }
    else
    {
      util.flagError(this.prefix + '-error-div',
                     'Fix Invalid Usernames');
    }
    if (this.callback)
    {
      this.callback(callbackArray);
    }
  };

  UserFields.prototype.hide = function ()
  {
    var i = 0;
    $('#' + this.prefix + '-more-button').hide();
    $('#' + this.prefix + '-more-div').hide();
    for (i = 0; i < this.fieldCount; i += 1) {
      $('#' + this.prefix + '-wrapper-' + i).hide();
    }
  };

  UserFields.prototype.show = function ()
  {
    var i = 0;
    $('#' + this.prefix + '-more-button').show();
    $('#' + this.prefix + '-more-div').show();
    for (i = 0; i < this.fieldCount; i += 1) {
      $('#' + this.prefix + '-wrapper-' + i).show();
    }
  };

  UserFields.prototype.disable = function ()
  {
    var i = 0;
    $('#' + this.prefix + '-more-button').hide();
    for (i = 0; i < this.fieldCount; i += 1) {
      $('#' + this.prefix + '-input-' + i).attr('disabled', true);
      $('#' + this.prefix + '-remove-' + i).hide();
    }
  };

  UserFields.prototype.enable = function ()
  {
    var i = 0;
    $('#' + this.prefix + '-more-button').show();
    for (i = 0; i < this.fieldCount; i += 1) {
      $('#' + this.prefix + '-input-' + i).attr('disabled', false);
      $('#' + this.prefix + '-remove-' + i).show();
    }
  };

  UserFields.prototype.reset = function ()
  {
    this.enable();
    while (this.fieldCount > 0) {
      this.removeField(this.fieldCount - 1);
    }
  };

  return UserFields;
});
