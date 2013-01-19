({
  appDir: ".",
  baseUrl: ".",
  dir: "../out",

//  optimize: "uglify2",
//  generateSourceMaps: true,
//  preserveLicenseComments: false,

  optimize: "none",
  useSourceUrl: true,

  fileExclusionRegExp: /(^\.)|(~$)/,
  findNestedDependencies: true,
  optimizeAllPluginResources: true,

  text: {
    env: "node"
  },

  paths: {
    "jquery": "require-jquery",
    "jquery-caret": "../lib/jquery.caret.min",
    "jquery-cookie": "../lib/jquery.cookie",
    "jquery-desknoty": "../lib/jquery.desknoty",
    "jquery-easydate": "../lib/jquery.easydate-0.2.4.min",
    "jquery-imagesloaded": "../lib/jquery.imagesloaded.min",
    "jquery-jfontsize": "../lib/jquery.jfontsize-1.0",
    "jquery-titlealert": "../lib/jquery.titlealert.min",
    "bootstrap": "../lib/bootstrap.min"
  },

  shim: {
    "jquery-caret": ["jquery"],
    "jquery-cookie": ["jquery"],
    "jquery-desknoty": ["jquery"],
    "jquery-easydate": ["jquery"],
    "jquery-imagefit": ["jquery"],
    "jquery-imagesloaded": ["jquery"],
    "jquery-jfontsize": ["jquery"],
    "jquery-titlealert": ["jquery"],
    "bootstrap": ["jquery"]
  },

  modules: [
    //Optimize the application files. jQuery is not 
    //included since it is already in require-jquery.js
    {
      name: "js/room",
      exclude: ["jquery"]
    },
    {
      name: "js/lobby",
      exclude: ["jquery"]
    }
  ]
})
