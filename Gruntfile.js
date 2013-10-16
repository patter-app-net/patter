/*global module: true, require: true */
module.exports = function (grunt) {
  'use strict';

  var user_conf = {
    patter_client_id: 'PSeXh2zXVCABT3DqCKBSfZMFZCemvWez',
    dev: {
      using_server: false
    },
    prod: {
      using_server: false
    }
  };
  try {
    user_conf = grunt.file.readJSON('config.json');
  } catch (e) {
    grunt.log.writeln(e);
    grunt.log.warn('Couldn\'t find config.json in root will use default configuration');
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['gruntfile.js', 'src/js/core/*.js'],
      options: grunt.file.readJSON('.jshintrc')
    },
    assemble: {
      options: {
        ext: '.js',
        flatten: true,
        patter_client_id: user_conf.patter_client_id
      },
      patter: {
        files: {
          'build/js/core/': ['src/template/config.hbs']
        }
      }
    },
    swig: {
      dev: {
        root: 'src',
        dest: './build/',
        src: ['src/*.swig'],
        site_config: user_conf.dev
      },
      prod: {
        root: 'src/',
        dest: 'build/',
        src: ['src/*.swig'],
        site_config: user_conf.prod
      }
    },
    copy: {
      normal: {
        files: [{
          expand: true,
          flatten: false,
          cwd: 'build',
          src: ['*.html', '**/*.css', 'js/**/*.js', '**/*.ico', '**/*.png', '**/*.jpg', '**/*.gif', '**/*.mp3', 'fonts/*'],
          dest: 'dist/'
        }]
      }
    },
    connect: {
      server: {
        options: {
          port: 9001,
          base: 'dist'
        }
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
            'jquery': 'js/deps/require-jquery',
            'jquery-caret': 'js/deps/jquery.caret.min',
            'jquery-cookie': 'js/deps/jquery.cookie',
            'jquery-desknoty': 'js/deps/jquery.desknoty',
            'jquery-easydate': 'js/deps/jquery.easydate-0.2.4.min',
            'jquery-imagesloaded': 'js/deps/lib/jquery.imagesloaded.min',
            'jquery-jfontsize': 'js/deps/jquery.jfontsize-1.0',
            'jquery-titlealert': 'js/deps/jquery.titlealert.min',
            'jquery-translator': 'js/deps/jquery.translator',
            'underscore': 'js/deps/underscore-min',
            'bootstrap': 'js/deps/bootstrap.min',
            'moment': 'js/deps/moment.min',
            'util': 'js/core/util',
            'appnet': 'js/core/appnet',
            'appnet-api': 'js/core/appnet-api',
            'appnet-note': 'js/core/appnet-note',
            'backbone': 'js/deps/backbone-min',
            'jquery-appnet': 'js/deps/appnet',
            'jquery-cloud': 'js/deps/jqcloud-1.0.4.min'
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
            'jquery-cloud': ['jquery'],
            'bootstrap': ['jquery'],
            'underscore': {
              'exports': '_'
            },
            'backbone': {
              'exports': 'Backbone'
            }
          },

          modules: [
            //Optimize the application files. jQuery is not
            //included since it is already in require-jquery.js
            {
              name: 'js/core/room',
              exclude: ['jquery']
            },
            {
              name: 'js/core/lobby',
              exclude: ['jquery']
            },
            {
              name: 'js/core/auth',
              exclude: ['jquery']
            }
          ]
        }
      }
    },
    watch: {
      scripts: {
        files: ['src/**/*.js'],
        tasks: ['jshint', 'requirejs', 'assemble', 'copy']
      },
      css: {
        files: ['src/**/*.css'],
        tasks: ['copy']
      },
      swig: {
        files: ['src/**/*.swig'],
        tasks: ['swig', 'copy']
      },
      html: {
        files: ['src/**/*.html'],
        tasks: ['requirejs', 'assemble', 'copy']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-swig');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('ensure_folders', function () {
    var folders = ['./dist/js'];
    folders.forEach(function (folder) {
      grunt.file.mkdir(folder);
    });
  });


  grunt.registerTask('dist', ['clean', 'ensure_folders', 'jshint', 'requirejs', 'assemble', 'swig', 'copy']);
  grunt.registerTask('dev', ['ensure_folders', 'jshint', 'requirejs', 'assemble', 'swig', 'copy']);
  grunt.registerTask('server', [
    'dev',
    'connect',
    'watch'
  ]);
};
