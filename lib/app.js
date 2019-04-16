const Module = require('./module');
const ModuleLoader = require( './moduleloader');
const path = require( 'path');
/**
 * The main application class
 * @implements {Singleton}
 */
class App extends Module {
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
  async start() {
    try {
      await this.moduleloader.preloadModules();
      await this.moduleloader.bootModules();
      this.log('info', `running application from ${process.cwd()}`);
    } catch(e) {
      this.log('error', `failed to start application: ${e}\n${e.stack}`);
    }
  }
}

module.exports = App;
