const Module = require('./datatypes/module');
const modules = require('adapt-authoring-modules');
const ModuleLoader = require('./moduleloader');

/**
 * The main application class
 */
class App extends Module {
  preload(resolve, reject) {
    this.moduleloader = new ModuleLoader(modules, this);
    this.moduleloader.preloadModules().then(resolve).catch(reject);
  }

  boot(resolve, reject) {
    this.moduleloader.bootModules().then(resolve).catch(reject);
  }
}

module.exports = App;
