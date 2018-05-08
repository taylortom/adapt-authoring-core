const path = require('path');

class ModuleLoader {
  /**
  * Loads a list of npm module dependencies
  * @param {Object} dependencies List of module dependencies (in package.json format)
  * @param {Object} app Used to store module references
  */
  constructor(dependencies, app) {
    this.dependencies = dependencies;
    this.app = app;
    this.modules = [];
  }

  initialiseModules() {
    return new Promise((resolve, reject) => {
      Promise.all(Object.keys(this.dependencies).map(this.initialiseModule.bind(this)))
        .then(resolve).catch(reject);
    });
  }

  initialiseModule(moduleName) {
    return new Promise((resolve, reject) => {
      const pkgDir = path.join(process.cwd(), 'node_modules', moduleName, 'package.json');
      // First check it's a valid authoring tool module using package.json
      try {
        var moduleConfig = require(pkgDir).adapt_authoring;
        if(!moduleConfig.module) return resolve();
      } catch(e) {
        return resolve();
      }
      // now try and import the module, and make sure it provides a function export
      try {
        var ModClass = require(moduleName);

        if(typeof ModClass !== 'function') {
          console.warn(`'${moduleName}' is not a valid module`);
          return resolve();
        }
        var instance = new ModClass(this.app, moduleConfig);

      } catch(e) {
        console.log(`Failed to load '${moduleName}', ${e}`);
        resolve();
      }
      /**
      * Any modules that have made it this far should be added to the array and
      * included in the preload/boot preocess
      */
      this.modules.push(instance);
      resolve();
    });
  }

  preloadModules() {
    return this.callFunctionOnModules('preloadDelegate');
  }

  bootModules() {
    return this.callFunctionOnModules('bootDelegate');
  }

  /**
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
