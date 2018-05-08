const Module = require('./module');
const ModuleLoader = require('./moduleloader');
const path = require('path');
// NOTE this uses the package.json in the process root
const modules = require(path.join(process.cwd(), 'package.json')).dependencies;

/**
 * The main application class
 */
class App extends Module {
  initialise() {
    this.moduleloader = new ModuleLoader(modules, this);
    return new Promise((resolve, reject) => {
      this.moduleloader.initialiseModules().then(resolve).catch(reject);
    });
  }

  preload(app, resolve, reject) {
    this.moduleloader.preloadModules().then(resolve).catch(reject);
  }

  boot(app, resolve, reject) {
    this.moduleloader.bootModules().then(resolve).catch(reject);
  }
}

module.exports = App;
