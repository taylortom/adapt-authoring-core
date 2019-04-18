const Module = require('./module');
const ModuleLoader = require( './moduleloader');
const path = require( 'path');

let instance;
/**
 * The main application class
 */
class App extends Module {
  /**
   * Returns the singleton instance, or initialises if there isn't one
   * @return {App} The instance
   */
  static get instance() {
    if(!instance) {
      instance = new App();
    }
    return instance;
  }
  /**
  * Initialises the application
  */
  constructor() {
    super(null, { name: 'app' });
    // NOTE this uses the package.json in the process root
    const modules = require(path.join(process.cwd(), 'package.json')).dependencies;
    /**
    * Reference to the ModuleLoader instance.
    * @type {ModuleLoader}
    */
    this.moduleloader = new ModuleLoader(modules, this);
    this.moduleloader.initialiseModules();
  }
  /**
  * Retrieves a loaded module (if module name begins with 'adapt-authoring', this can be omitted)
  * @param {String} moduleName
  * @return {Module} module instance
  */
  getModule(moduleName) {
    return this.moduleloader.modules[moduleName] || this.moduleloader.modules[`adapt-authoring-${moduleName}`];
  }
  /**
  * Starts the app
  */
  start() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.moduleloader.preloadModules();
        await this.moduleloader.bootModules();
        this.log('info', `running application from ${process.cwd()}`);
        resolve();
      } catch(e) {
        this.log('error', `failed to start application: ${e}\n${e.stack}`);
        reject();
      }
    });
  }
}

module.exports = App;
