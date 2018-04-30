class ModuleLoader {
  /**
  * Loads a list of npm module dependencies and stores on the memo object
  * @param dependencies object in package.json dependencies format
  * @param memo object used to store module references
  */
  constructor(dependencies, memo) {
    this.dependencies = dependencies;
    this.memo = app;
    this.modules = [];
  }

  preloadModules() {
    return new Promise((resolve, reject) => {
      Promise.all(
        Object.keys(this.dependencies).map(this.preloadModule.bind(this))
      ).then(resolve).catch(reject);
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
      var instance = new ModClass(this.memo);
      this.modules.push(instance);
      // add a reference to app
      this.memo[instance.instanceKey] = instance;

      if(!instance.preloadDelegate) {
        resolve();
      }
      instance.preloadDelegate().then(resolve).catch(reject);
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
      instance.bootDelegate().then(resolve).catch(reject);
    });
  }
}

module.exports = ModuleLoader;
