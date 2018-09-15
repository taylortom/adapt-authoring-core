const Module = require('./module');
const ModuleLoader = require( './moduleloader');
/**
 * An abstracted module for storing the application data.
 * This should be used directly, sub-classes should be used instead.
 */
class DataStore extends Module {
  /**
  * Adds a new object to the data store
  * @param {Object} data
  * @return {Promise} promise
  */
  create() {
    logger.warn(`${this.name}::create: this function needs to be overriden in the subclass`);
  }

  /**
  * Retrieves a new object from the data store
  * @param {Object} query
  * @param {Object} options
  * @return {Promise} promise
  */
  read() {
    logger.warn(`${this.name}::read: this function needs to be overriden in the subclass`);
  }

  /**
  * Updates existing objects in the data store
  * @param {Object} query
  * @param {Object} data
  * @return {Promise} promise
  */
  update() {
    logger.warn(`${this.name}::update: this function needs to be overriden in the subclass`);
  }

  /**
  * Replaces an existing object in the data store
  * @param {Object} query
  * @param {Object} data
  * @return {Promise} promise
  */
  replace() {
    logger.warn(`${this.name}::replace: this function needs to be overriden in the subclass`);
  }

  /**
  * Removes a new object from the data store
  * @param {Object} data
  * @return {Promise} promise
  */
  delete() {
    logger.warn(`${this.name}::delete: this function needs to be overriden in the subclass`);
  }
}

module.exports = DataStore;
