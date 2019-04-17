const Errors = require('./errors');
// TODO remove this dependency
const Logger = require('adapt-authoring-logger');
const path = require('path');
/**
* Handles the loading of Adapt authoring tool module dependencies.
*/
class ModuleLoader {
  /**
  * @constructor
  * @param {Object} dependencies List of module dependencies (in package.json format)
  * @param {Object} app Used to store module references
  */
  constructor(dependencies, app) {
    /**
    * List of dependent modules in NPM package.json dependencies format
    * @type {object}
    */
    this.dependencies = Object.keys(dependencies);
    /**
    * Reference to the main app
    * @type {App}
    */
    this.app = app;
    /**
    * List of module instances
    * @type {object}
    */
    this.modules = {};
  }
  /**
  * Log a message using the Logger module
  * @param {String} level Log level of message
  * @param {...Object} rest Arguments to log
  */
  log(level, ...rest) {
    Logger[level]('moduleloader', ...rest);
  }
  /**
  * Initialises all defined dependent modules
  */
  initialiseModules() {
    this.dependencies.forEach(d => this.initialiseModule(d));
  }
  /**
  * Initialises a single module
  * @param {Object} moduleName Name of the module to initialise
  */
  initialiseModule(moduleName) {
    if(this.modules[moduleName]) {
      return; // already loaded
    }
    const pkgDir = path.join(process.cwd(), 'node_modules', moduleName, 'package.json');
    let moduleConfig, ModClass;
    // check it's a valid authoring tool module using package.json
    try {
      moduleConfig = require(pkgDir);
    } catch(e) {
      return this.log('error', `${Errors.ModuleLoad}, ${Errors.MissingPackageJson}, ${e}`);
    }
    if(!moduleConfig.adapt_authoring || !moduleConfig.adapt_authoring.module) {
      return;
    }
    if(moduleConfig.adapt_authoring.moduleDependencies) {
      moduleConfig.adapt_authoring.moduleDependencies.forEach(d => {
        if(!this.dependencies.includes(d)) {
          this.log('warn', `${Errors.ModuleLoad}: missing '${moduleName}' required by '${d}'`)
          return;
        }
      });
    }
    try { // try and import the module, and make sure it provides a function export
      ModClass = require(moduleName);
    } catch(e) {
      return this.log('error', `${Errors.ModuleLoad} '${moduleName}', ${e}\n\n${e.stack}`);
    }
    if(typeof ModClass === 'object' && ModClass.Module) {
      ModClass = ModClass.Module;
    } else if(typeof ModClass !== 'function') {
      return this.log('error', `${Errors.ModuleLoad} '${moduleName}', 'expected class'`);
    }
    // store any modules that get this far so it's included in the preload/boot process
    this.modules[moduleName] = new ModClass(this.app, moduleConfig);
  }
  /**
  * Preloads all defined dependent modules
  * @return {Promise}
  */
  preloadModules() {
    return this.callFunctionOnModules('preloadDelegate');
  }
  /**
  * Boots all defined dependent modules
  * @return {Promise}
  */
  bootModules() {
    return this.callFunctionOnModules('bootDelegate');
  }
  /**
  * @ignore
  * Asynchronously calls a function on all this.modules
  */
  callFunctionOnModules(funcName) {
    return Promise.all(Object.values(this.modules).map(instance => {
      return new Promise((resolve, reject) => {
        if(!instance[funcName]) return resolve();
        instance[funcName](this.app).then(resolve).catch(reject);
      });
    }));
  }
}

module.exports = ModuleLoader;
