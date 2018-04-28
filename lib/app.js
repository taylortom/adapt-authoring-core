const EventEmitter = require('events');
const ModuleLoader = require('adapt-authoring-moduleloader');

/**
 * The main application class
 * @constructor
 */
class App extends EventEmitter {
  constructor() {
    console.log('App.constructor');
    super();
    this.preload();
  }

  preload() {
    console.log('App.preload');
    ModuleLoader.preloadModules(this)
      .then(this.boot)
      .catch(console.log);
  }

  boot() {
    console.log('App.boot');
    ModuleLoader.bootdModules(this)
    .then(function() {
      console.log('App suited and booted');
    })
    .catch(console.log);
  }
}

module.exports = function createApp() {
  if(!this.app || !this.app instanceof App) {
    this.app = new App();
  }
  return this.app;
};
