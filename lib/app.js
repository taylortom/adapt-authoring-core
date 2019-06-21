const Module = require('./module');
const ModuleLoader = require('./moduleloader');
const path = require('path');

let instance;
/**
* The main application class
*/
class App extends Module {
  /**
  * Returns the singleton instance, or initialises it if there isn't one
  * @return {App} The instance
  */
  static get instance() {
    if(!instance) {
      instance = new App();
    }
    return instance;
  }
  /**
  * Create the application instance
  */
  constructor() {
    super(null, { name: 'app' });
    /**
    * A copy of the process user environment
    * @type {Object}
    * @see https://nodejs.org/api/process.html#process_process_env
    */
    this.env = process.env;
    /**
    * The application's package.json
    * @type {Object}
    * @see https://docs.npmjs.com/files/package.json
    */
    this.pkg = require(path.join(process.cwd(), 'package.json'));
    /**
    * Reference to the ModuleLoader instance
    * @type {ModuleLoader}
    */
    this.moduleloader = new ModuleLoader(this.pkg.dependencies, this);
    this.moduleloader.initialiseModules();
  }
  /**
  * Retrieves a loaded module by name (if module name begins with 'adapt-authoring', this can be omitted)
  * @param {String} moduleName
  * @return {Module} module instance
  * @example
  * App.instance.getModule('adapt-authoring-myModule');
  * // or
  * App.instance.getModule('myModule');
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
