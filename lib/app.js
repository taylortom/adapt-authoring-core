const Module = require('./datatypes/module');
const ModuleLoader = require('adapt-authoring-moduleloader');
/**
 * The main application class
 */
class App extends Module {
  preload(resolve, reject) {
    this.moduleloader = new ModuleLoader(this);
    this.moduleloader.preloadModules().then(resolve).catch(reject);
  }

  boot(resolve, reject) {
    this.moduleloader.bootModules().then(resolve).catch(reject);
  }
}

module.exports = App;
