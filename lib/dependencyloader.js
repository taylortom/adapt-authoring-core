const Events = require('./events');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const util = require('util');
const Utils = require('./utils');
/** @ignore */ const globPromise = util.promisify(glob);
/**
* Handles the loading of Adapt authoring tool module dependencies.
*/
class DependencyLoader extends Events {
  /**
  * @param {Object} app The main app instance
  */
  constructor(app) {
    super();
    /**
    * Name of the class (onvenience function to stay consistent with other classes)
    * @type {String}
    */
    this.name = this.constructor.name;
    /**
    * Reference to the main app
    * @type {App}
    */
    this.app = app;
    /**
    * Key/value store of Adapt module dependencies and their configs
    * @type {Object}
    */
    this.dependencies = {};
    /**
    * List of dependency instances
    * @type {object}
    */
    this.instances = {};
  }
  /**
  * Returns a list of installed Adapt modules
  * @return {Array} List of dependencies
  */
  async getDependencies() {
    const globs = await globPromise('node_modules/**/adapt.json');
    return globs.map(d => d.replace('/adapt.json', ''));
  }
  /**
  * Loads all Adapt module dependencies
  * @return {Promise}
  */
  async load() {
    const essentials = [], theRest = [];
    // preload all modules
    await Promise.all((await this.getDependencies()).map(async d => {
      const c = await this.loadModuleConfig(d);
      (c.isEssential) ? essentials.push(c) : theRest.push(c);
      this.dependencies[c.name] = c;
    }));
    // load any 'essential' modules
    await this.loadModules(essentials.map(m => m.name));
    // load all remaining modules
    await this.loadModules(theRest.map(m => m.name));
  }
  /**
  * Loads a single Adapt module. Should not need to be called directly.
  * @param {String} modName Name of module to load
  * @return {Promise} Resolves with module instance on module.onReady
  */
  async loadModule(modName) {
    if(this.instances[modName]) {
      throw new Error(`Module '${modName}' already exists`);
    }
    const config = this.dependencies[modName];

    if(config.module === false) {
      return;
    }
    let ModClass;
    let instance;
    let interval;
    try {
      ModClass = require(config.name);
    } catch(e) {
      throw new Error(`Failed to import module '${modName}' at ${config.rootDir}, ${e}`);
    }
    if(ModClass.Module) {
      ModClass = ModClass.Module;
    }
    if(!Utils.isFunction(ModClass)) {
      throw new Error(`Expected class to be exported by '${modName}'`);
    }
    try {
      instance = new ModClass(this.app, config);
    } catch(e) {
      throw new Error(`Failed to instanciate module '${modName}', ${e}`);
    }
    if(!Utils.isFunction(instance.onReady)) {
      throw new Error(`Module '${modName}' must define onReady function`);
    }
    return await new Promise((resolve, reject) => {
      const tID = setTimeout(() => reject(`Load of module '${modName}' timed out`), 10000);
      instance.onReady().then(() => {
        clearTimeout(tID);
        this.instances[modName] = instance;
        this.emit('moduleloaded', modName, instance);
        resolve(instance);
      });
    });
  }
  /**
  * Loads the relevant configuration files for an Adapt module
  * @param {String} modPath Path of module
  * @return {Promise} Resolves with config object
  */
  async loadModuleConfig(modPath) {
    modPath = path.join(process.cwd(), modPath);
    try {
      return {
        ...(await fs.readJson(path.join(modPath, 'package.json'))),
        ...(await fs.readJson(path.join(modPath, 'adapt.json'))),
        rootDir: modPath
      };
    } catch(e) {
      throw new Error(`Failed to load module config for ${modPath}, ${e}`);
    }
  }
  /**
  * Loads a list of Adapt modules. Should not need to be called directly.
  * @param {Array} modules Module names
  * @return {Promise} Resolves When all modules have loaded (or failed to load)
  */
  async loadModules(modules) {
    await Promise.all(modules.map(async d => {
      try {
        await this.loadModule(d);
      } catch(e) {
        this.logError(e);
      }
    }));
  }
  /**
  * Returns a single module instance
  * @param {String} modName Name of module to retrieve
  * @return {AbstractModule} The module instance
  */
  getModuleInstance(modName) {
    const longName = `adapt-authoring-${modName}`;
    const instance = this.instances[modName] || this.instances[longName];
    if(instance && instance._isReady) return instance;
  }
  /**
  * Waits for a single module to load
  * @param {String} modName Name of module to wait for
  * @return {Promise} Resolves with module instance on module.onReady
  */
  async waitForModule(modName) {
    const longName = `adapt-authoring-${modName}`;
    const exists = this.dependencies[modName] || this.dependencies[longName];
    if(!exists) {
      throw new Error(`Missing required module '${modName}'`);
      return;
    }
    const instance = this.instances[modName] || this.instances[longName];
    if(instance) {
      return instance.onReady();
    }
    return await new Promise(resolve => {
      const l = async (name, instance) => {
        if(name === modName || name === longName) {
          this.off('moduleloaded', l);
          resolve((await instance.onReady()));
        }
      };
      this.on('moduleloaded', l);
    });
  }
  /**
  * Logs an error message
  * @param {String} message Message to log
  */
  logError(message) {
    if(this.app.logger && this.app.logger._isReady) {
      this.app.logger.log('error', this.name, message);
    } else {
      console.log(message);
    }
  }
}

module.exports = DependencyLoader;
