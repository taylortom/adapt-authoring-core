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
      try {
        var ModClass = require(moduleName);
      }
      catch(e) {
        console.log(`Failed to load '${moduleName}', ${e}`);
        resolve();
      }
      if(typeof ModClass !== 'function') {
        console.warn(`'${moduleName}' is not a valid module`);
        resolve();
      }
      var instance = new ModClass();
      this.modules.push(instance);

      if(!instance.preloadDelegate) {
        resolve();
      }
      instance.preloadDelegate(this.app).then(resolve).catch(reject);
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
