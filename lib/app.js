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
    ModuleLoader.loadModules(this)
      .then(boot)
      .catch(function(error) {
        console.log('App.preload: failed');
      });
  }

  boot() {
    console.log('App.boot');
  }
}

module.exports = function createApp() {
  if (!this.app instanceof App) {
    this.app = this.app || new App();
  }
  return this.app;
};
