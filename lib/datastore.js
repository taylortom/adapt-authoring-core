const DataStoreQuery = require('./datastorequery');
const AbstractModule = require('./abstractmodule');
/**
 * An abstract module for storing the application data.
 * This should not be used directly, sub-classes should be used instead.
 */
class DataStore extends AbstractModule {
  /**
  * Creates a new DataStoreQuery for the passed type
  * @param {String} type Data type of query
  * @return {DataStoreQuery} New query instance
  */
  static createQuery(type) {
    return new DataStoreQuery(type);
  }
  /**
  * Transforms a DataStoreQuery into a format accepted by the DataStore
  * @param {DataStoreQuery} query to be formatted
  * @return {Object} formatted query
  */
  static formatQuery(query) {
    throw new Error('Must be overridden by subclass');
  }
  /**
  * Connects to the database
  * @param {Object} options Any options
  * @return {Promise}
  */
  connect(options = {}) {
    throw new Error('Must be overridden by subclass');
  }
  /**
  * Adds a new object to the data store
  * @param {Object} data
  * @return {Promise} promise
  */
  create(data) {
    throw new Error('Must be overridden by subclass');
  }
  /**
  * Retrieves a new object from the data store
  * @param {DataStoreQuery} query
  * @return {Promise} promise
  */
  retrieve(query) {
    throw new Error('Must be overridden by subclass');
  }
  /**
  * Updates existing objects in the data store
  * @param {DataStoreQuery} query
  * @param {Object} data
  * @return {Promise} promise
  */
  update(query, data) {
    throw new Error('Must be overridden by subclass');
  }
  /**
  * Removes a new object from the data store
  * @param {DataStoreQuery} query
  * @return {Promise} promise
  */
  delete(query) {
    throw new Error('Must be overridden by subclass');
  }
}

module.exports = DataStore;
