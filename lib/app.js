import Module from'./module';
import ModuleLoader from './moduleloader';
import path from 'path';
// NOTE this uses the package.json in the process root
const modules = require(path.join(process.cwd(), 'package.json')).dependencies;

/**
 * The main application class
 */
export default class App extends Module {
  /**
  * Initialises the application
  * @return {Promise}
  */
  initialise() {
    /**
    * Reference to the ModuleLoader instance.
    * @type {ModuleLoader}
    */
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
