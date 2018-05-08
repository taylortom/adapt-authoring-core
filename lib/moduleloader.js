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

  preloadModules() {
    return new Promise((resolve, reject) => {
      Promise.all(Object.keys(this.dependencies).map(this.preloadModule.bind(this)))
        .then(resolve).catch(reject);
    });
  }

  preloadModule(moduleName) {
    return new Promise((resolve, reject) => {
      this.instantiateModule(moduleName).then(instance => {
        /**
        * modules aren't required to return an instance, but exclude it from
        * the preload/boot preocess if this is the case
        */
        if(!instance) {
          return resolve();
        }
        this.modules.push(instance);
        if(!instance.preloadDelegate) {
          return resolve();
        }
        instance.preloadDelegate(this.app).then(resolve).catch(reject);

      }).catch(reject);
    });
  }

  instantiateModule(moduleName) {
    return new Promise((resolve, reject) => {
      const pkgDir = path.join(process.cwd(), 'node_modules', moduleName, 'package.json');
      // First check it's a valid authoring tool module using package.json
      try {
        var isModule = require(pkgDir).adapt_authoring.module;
        if(!isModule) return resolve();
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
        var instance = new ModClass(this.app);
        resolve(instance);

      } catch(e) {
        console.log(`Failed to load '${moduleName}', ${e}`);
        resolve();
      }
    });
  }

  bootModules() {
    return new Promise((resolve, reject) => {
      Promise.all(
        this.modules.map(this.bootModule.bind(this))
      ).then(resolve).catch(reject);
    });
  }

  bootModule(instance) {
    return new Promise((resolve, reject) => {
      if(!instance.bootDelegate) {
        resolve();
      }
      instance.bootDelegate(this.app).then(resolve).catch(reject);
    });
  }
}

module.exports = ModuleLoader;
