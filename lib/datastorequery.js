
/**
* Abstract builder class to define a DataStore query
*
*/
class DataStoreQuery {
  /**
  * Creates a new DataStoreQuery instanc
  * @param {Object} options Options to define query
  */
  constructor(options = {}) {
    if(typeof options === 'string') {
      options = { type: options };
    }
    // set some defaults
    Object.assign(this, {
      fieldsMatching: {}
    }, options);
  }
  /**
   * Checks the query's attributes for any errors, throwing an error where approriate
  * @throws {DataStoreQueryValidationError}
  */
  validate() {
    if(!this.type || typeof this.type !== 'string') {
      throw new DataStoreQueryValidationError(`Invalid type, '${this.type}'`);
    }
    if(this.startResultsFrom < 0) {
      throw new DataStoreQueryValidationError(`Skip value must be greater than 0, '${this.startResultsFrom}'`);
    }
    if(this.limitResultsTo < 1) {
      throw new DataStoreQueryValidationError(`Limit value must be greater than 1, '${this.limitResultsTo}'`);
    }
    if(this.sortResultsBy && this.sortResultsBy.field && this.sortResultsBy.order !== -1 && this.sortResultsBy.order !== 1) {
      throw new DataStoreQueryValidationError(`Sort value must be either -1 or 1, '${this.sortResultsBy.order}'`);
    }
  }
}

/**
* Class to encapsulate DataStoreQuery-related validation errors
*/
class DataStoreQueryValidationError extends Error {
  /**
  * Creates a new error instance
  */
  constructor(message) {
    super(message);
    /**
    * Human-readable name for the error
    * @type {String}
    */
    this.name = this.constructor.name;
    /**
    * Http status code
    * @type {Number}
    */
    this.statusCode = 400;
  }
}

module.exports = DataStoreQuery;
