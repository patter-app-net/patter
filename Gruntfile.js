/*global module: true, require: true */
module.exports = function (grunt) {
  'use strict';

  var scp_conf = {};
  try {
    // For information on how to construct this file checkout out: https://github.com/spmjs/grunt-scp
    // An Example:
    // {
    //  "options": {
    //     "host": "jonathonduerig.com",
    //     "username": "duerig",
    //     "agent": "/tmp/launch-5VBS3x/Listeners"
    //   },
    //   "root_path": "/var/www/patter-app.net/"
    // }
    scp_conf = grunt.file.readJSON('scp.json');
  } catch (e) {
    grunt.log.writeln(e);
    grunt.log.warn('Couldn\'t find scp.json in root will use default configuration');
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: {
      remote_root: scp_conf.root_path
    },
    jshint: {
      files: ['gruntfile.js', 'src/js/*.js'],
      options: grunt.file.readJSON('.jshintrc')
    },
    copy: {
      mod: {
        files: [{
          expand: true,
          cwd: 'build',
          src: ['auth.html', 'room.html', 'room.css', 'index.html'],
          dest: 'dist/mod/'
        },{
          expand: true,
          cwd: 'build',
          src: ['js/room.js', 'js/lobby.js'],
          dest: 'dist/mod/'
        }]
      },
      normal: {
        files: [{
          expand: true,
          cwd: 'build',
          src: ['auth.html', 'room.html', 'room.css', 'index.html'],
          dest: 'dist/'
        },{
          expand: true,
          cwd: 'build',
          src: ['js/room.js', 'js/lobby.js'],
          dest: 'dist/'
        }]
      }
    },
    scp: {
      options: scp_conf.options,
      your_target: {
        files: [{
          cwd: 'dist',
          src: '*',
          filter: 'isFile',
          // path on the server
          dest: '<%= config.remote_root %>'
        },{
          cwd: 'dist/js',
          src: '*',
          filter: 'isFile',
          // path on the server
          dest: '<%= config.remote_root %>js'
        },{
          cwd: 'dist/mod',
          src: '*',
          filter: 'isFile',
          // path on the server
          dest: '<%= config.remote_root %>mod'
        },{
          cwd: 'dist/mod/js',
          src: '*',
          filter: 'isFile',
          // path on the server
          dest: '<%= config.remote_root %>mod/js'
        }]
      }
    },
    clean: ['build', 'dist'],
    requirejs: {
      compile: {
        options: {
          appDir: 'src',
          baseUrl: '.',
          dir: 'build',
          optimize: 'none',
          useSourceUrl: true,
          fileExclusionRegExp: /(^\.)|(~$)/,
          findNestedDependencies: true,
          optimizeAllPluginResources: true,

          text: {
            env: 'node'
          },

          paths: {
            'jquery': 'require-jquery',
            'jquery-caret': '../lib/jquery.caret.min',
            'jquery-cookie': '../lib/jquery.cookie',
            'jquery-desknoty': '../lib/jquery.desknoty',
            'jquery-easydate': '../lib/jquery.easydate-0.2.4.min',
            'jquery-imagesloaded': '../lib/jquery.imagesloaded.min',
            'jquery-jfontsize': '../lib/jquery.jfontsize-1.0',
            'jquery-titlealert': '../lib/jquery.titlealert.min',
            'jquery-translator': '../lib/jquery.translator',
            'bootstrap': '../lib/bootstrap.min',
            'util': 'js/util',
            'appnet': 'js/appnet',
            'appnet-api': 'js/appnet-api',
            'appnet-note': 'js/appnet-note'
            //    'util': '../../../lib/util',
            //    'appnet': '../../../lib/appnet',
            //    'appnet-api': '../../../lib/appnet-api',
            //    'appnet-note': '../../../lib/appnet-note'
          },

          shim: {
            'jquery-caret': ['jquery'],
            'jquery-cookie': ['jquery'],
            'jquery-desknoty': ['jquery'],
            'jquery-easydate': ['jquery'],
            'jquery-imagefit': ['jquery'],
            'jquery-imagesloaded': ['jquery'],
            'jquery-jfontsize': ['jquery'],
            'jquery-titlealert': ['jquery'],
            'jquery-translator': ['jquery'],
            'bootstrap': ['jquery']
          },

          modules: [
            //Optimize the application files. jQuery is not
            //included since it is already in require-jquery.js
            {
              name: 'js/room',
              exclude: ['jquery']
            },
            {
              name: 'js/lobby',
              exclude: ['jquery']
            }
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-scp');

  grunt.registerTask('ensure_folders', function () {
    var folders = ['./dist/mod/js', './dist/js'];
    folders.forEach(function (folder) {
      grunt.file.mkdir(folder);
    });
  });


  grunt.registerTask('dist', ['clean', 'ensure_folders', 'jshint', 'requirejs', 'copy', 'scp']);


};