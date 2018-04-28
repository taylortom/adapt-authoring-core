const EventEmitter = require('events');
const ModuleLoader = require('adapt-authoring-moduleloader');

/**
 * The main application class
 * @constructor
 */
class App extends EventEmitter {
  constructor() {
    super();
    this.preload();
  }

  preload() {
    ModuleLoader.loadModules()
      .then(function() {
        console.log('done load');
      });
  }

  registerModule({ name, moduleclass }) {
    var instance = new moduleclass();
    this[name] = instance;
  }
}

/**
 * Module exports
 */
module.exports = function createApp() {
  console.log('hello');
  if (!this.app || !this.app instanceof App) {
    this.app = new App();
  }
  return this.app;
};
