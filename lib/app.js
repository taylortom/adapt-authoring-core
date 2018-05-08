const Module = require('./module');
const ModuleLoader = require('./moduleloader');
const path = require('path');
// NOTE this uses the package.json in the process root
const modules = require(path.join(process.cwd(), 'package.json'));

/**
 * The main application class
 */
class App extends Module {
  preload(app, resolve, reject) {
    this.moduleloader = new ModuleLoader(modules, this);
    this.moduleloader.preloadModules().then(resolve).catch(reject);
  }

  boot(app, resolve, reject) {
    this.moduleloader.bootModules().then(resolve).catch(reject);
  }
}

module.exports = App;
