const Module = require('./module');
/**
 * An abstract module for storing the application data.
 * This should not be used directly, sub-classes should be used instead.
 */
class DataStore extends Module {
  /**
  * Adds a new object to the data store
  * @param {Object} data
  * @return {Promise} promise
  */
  create() {
    logger.warn(`DataStore::create: this function needs to be overridden in the extending object`);
  }
  /**
  * Retrieves a new object from the data store
  * @param {Object} query
  * @param {Object} options
  * @return {Promise} promise
  */
  retrieve() {
    logger.warn(`DataStore::read: this function needs to be overridden in the extending object`);
  }
  /**
  * Updates existing objects in the data store
  * @param {Object} query
  * @param {Object} data
  * @return {Promise} promise
  */
  update() {
    logger.warn(`DataStore::update: this function needs to be overridden in the extending object`);
  }
  /**
  * Removes a new object from the data store
  * @param {Object} data
  * @return {Promise} promise
  */
  delete() {
    logger.warn(`DataStore::delete: this function needs to be overriden in the subclass`);
  }
}

module.exports = DataStore;
