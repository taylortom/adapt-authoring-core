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

  getModule(moduleName) {
    return this.moduleloader.modules[moduleName];
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

let instance;

module.exports = function getInstance() {
  if(!instance) instance = new App();
  return instance;
}
