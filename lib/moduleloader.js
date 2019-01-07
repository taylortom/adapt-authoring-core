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
    this.dependencies = dependencies;
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
  * Initialises all defined dependent modules
  */
  initialiseModules() {
    Object.keys(this.dependencies).map(this.initialiseModule.bind(this));
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
    try {
      // check it's a valid authoring tool module using package.json
      const moduleConfig = require(pkgDir);

      if(!moduleConfig.adapt_authoring.module) return;
      // try and import the module, and make sure it provides a function export
      const ModClass = require(moduleName);

      if(typeof ModClass !== 'function') {
        console.warn(`'${moduleName}' is not a valid module. Expected an exported function, recieved ${typeof ModClass}`);
        return;
      }
      // store any modules that get this far so it's included in the preload/boot process
      this.modules[moduleName] = new ModClass(this.app, moduleConfig);

    } catch(e) {
      console.log(`Failed to load '${moduleName}', ${e}`);
      return;
    }
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
