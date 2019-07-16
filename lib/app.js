const DataValidationError = require('./datavalidationerror');
const DependencyLoader = require('./dependencyloader');
const Module = require('./module');
const path = require('path');
const Utils = require('./utils');

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
    const pkg = require(path.join(process.cwd(), 'package.json'));
    super(null, Object.assign(pkg, { name: 'app', dir: path.join(__dirname, '..') }));
    // must have the App reference for parent class, and can't pass 'this' to
    // the super constructor because it doesn't exist yet
    Utils.defineGetter(this, 'app', this);
    /**
    * Module for handling system configuration storage
    * @type {AbstractConfig}
    */
    this.config = {};
    /**
    * Module for translating strings
    * @type {AbstractLang}
    */
    this.lang = {};
    /**
    * Module for logging messages
    * @type {AbstractLogger}
    */
    this.logger = {};


    this.initialiseDependencies();
  }

  initialiseDependencies() {
    let hasErrored = false;
    /**
    * Reference to the DependencyLoader instance
    * @type {DependencyLoader}
    */
    this.dependencyloader = new DependencyLoader(this.pkg.dependencies, this);
    this.dependencyloader.on('error', e => {
      if(e instanceof DataValidationError) {
        this.log('error', `${e.messagePrefix}`);
        e.errors.forEach(error => this.log('error', `- ${error}`));
      } else {
        this.log('error', e);
      }
      hasErrored = true;
    });
    this.dependencyloader.initialiseUtilities(['lang', 'config', 'logger']);
    this.dependencyloader.initialiseModules();
  }

  getModules() {
    return this.dependencyloader.modules;
  }
  /**
  * Retrieves a loaded module by name (shortcut for {@link DependencyLoader#getModule})
  * @param {String} name
  * @return {Module} module instance
  */
  getModule(name) {
    return this.dependencyloader.getModule(name);
  }
  /**
  * Starts the app
  */
  async start() {
    try {
      await this.dependencyloader.preloadModules();
      await this.dependencyloader.bootModules();
      this.log('info', `running application from ${process.cwd()}`);
    } catch(e) {
      this.log('error', `failed to start application: ${e}\n${e.stack}`);
    }
  }
}

module.exports = App;
