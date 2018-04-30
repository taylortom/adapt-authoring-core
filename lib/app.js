const Module = require('./datatypes/module');
const ModuleLoader = require('adapt-authoring-moduleloader');
const dependencies = require('../package').dependencies;

/**
 * The main application class
 * @constructor
 */
class App extends Module {
  preload(resolve, reject) {
    this.moduleloader = new ModuleLoader(dependencies, this);
    this.moduleloader.preloadModules().then(resolve).catch(reject);
  }

  boot(resolve, reject) {
    this.moduleloader.bootModules().then(resolve).catch(reject);
  }
}

module.exports = App;
