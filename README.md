patter-mod
==========

A major refactoring of Patter into many modules.

## Setting up patter

Everything depends on you having node, npm, and grunt-cli installed. We are going to install all the dependencies and then setup a credentials file.

Your `scp.json` files should look something like this:

```json
{
 "options": {
    "host": "jonathonduerig.com",
    "username": "duerig",
  },
  "root_path": "/var/www/patter-app.net/"
}
```

You will need to add the location of your keyagent, or your password.

__Remember: Do not check in your scp.json file__

### Run these commands

```sh
>>> npm install
>>> touch scp.json
>>> vi scp.json
>>> grunt dist
```