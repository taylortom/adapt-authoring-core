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
    * @type {Module[]}
    */
    this.modules = [];
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
    const pkgDir = path.join(process.cwd(), 'node_modules', moduleName, 'package.json');
    // First check it's a valid authoring tool module using package.json
    try {
      var moduleConfig = require(pkgDir).adapt_authoring;
      if(!moduleConfig.module) return;
    } catch(e) {
      return;
    }
    // now try and import the module, and make sure it provides a function export
    try {
      var ModClass = require(moduleName);

      if(typeof ModClass !== 'function') {
        console.warn(`'${moduleName}' is not a valid module`);
        return;
      }
      var instance = new ModClass(this.app, moduleConfig);

    } catch(e) {
      console.log(`Failed to load '${moduleName}', ${e}`);
      return;
    }
    // store any modules that get this far and include in the preload/boot process
    this.modules.push(instance);
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
    return new Promise((resolve, reject) => {
      Promise.all(this.modules.map(instance => {
        return new Promise((nestResolve, nestReject) => {
          if(!instance[funcName]) return nestResolve();
          instance[funcName](this.app).then(nestResolve).catch(nestReject);
        });
      })).then(resolve).catch(reject);
    });
  }
}

module.exports = ModuleLoader;
