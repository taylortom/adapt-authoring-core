const Module = require('./module');
const ModuleLoader = require( './moduleloader');
const path = require( 'path');
/**
 * The main application class
 */
class App extends Module {
  /**
  * Initialises the application
  */
  constructor() {
    super();
    // NOTE this uses the package.json in the process root
    const modules = require(path.join(process.cwd(), 'package.json')).dependencies;
    /**
    * Reference to the ModuleLoader instance.
    * @type {ModuleLoader}
    */
    this.moduleloader = new ModuleLoader(modules, this);
    this.moduleloader.initialiseModules();
  }

  preload(app, resolve, reject) {
    this.moduleloader.preloadModules().then(resolve).catch(reject);
  }
  boot(app, resolve, reject) {
    this.moduleloader.bootModules().then(resolve).catch(reject);
  }

  async start() {
    try {
      await this.moduleloader.preloadModules();
      await this.moduleloader.bootModules();
      console.log(`Running application from ${process.cwd()}`);
    } catch(e) {
      console.log(`Failed to start application: ${e}\n${e.stack}`);
    }
  }
}

module.exports = App;
