const Module = require('./datatypes/module');
const ModuleLoader = require('adapt-authoring-moduleloader');

/**
 * The main application class
 * @constructor
 */
class App extends Module {
  preloadDelegate(resolve, reject) {
    ModuleLoader.preloadModules(this).then(resolve).catch(reject);
  }

  bootDelegate(resolve, reject) {
    ModuleLoader.bootModules().then(resolve).catch(reject);
  }
}

module.exports = App;
