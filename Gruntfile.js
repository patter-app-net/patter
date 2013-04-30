/*global module: true, require: true */
module.exports = function (grunt) {
  'use strict';

  var deploy_conf = {};
  try {
    deploy_conf = grunt.file.readJSON('deploy.json');
  } catch (e) {}

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['gruntfile.js', 'src/js/*.js'],
      options: grunt.file.readJSON('.jshintrc')
    },
    rsync: {
      mod_html: {
        src: './',
        dest: '../dist',
        recursive: true,
        exclude: ['.git*','*.scss']
      },
      mod_js: {
        src: './',
        dest: '../dist',
        recursive: true,
        exclude: ['.git*','*.scss']
      }
    },
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
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-contrib-requirejs');




};