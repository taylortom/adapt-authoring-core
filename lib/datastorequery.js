const App = require('./app');
const Responder = require('./responder');
const Utils = require('./utils');
/**
* Defines a query for a DataStore.
*/
class DataStoreQuery {
  /**
  * Creates a new DataStoreQuery instance from a client request
  * @param {ServerResponse} req Client request
  * @return {DataStoreQuery} The generated query
  */
  static fromRequest(req) {
    const q = new DataStoreQuery(req.type);
    q.fieldsMatching = Object.assign({}, req.params, req.query);
    q.validate();
    req.dsquery = q;
    return q;
  }
  /**
  * Creates a new DataStoreQuery instance
  * @param {Object} options Options to define query
  */
  constructor(options = {}) {
    if(Utils.isString(options)) {
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
    if(!Utils.isString(this.type)) {
      throwError('invalidquerytype', { type: this.type });
    }
    if(this.startResultsFrom < 0) {
      throwError('invalidqueryskip', { skip: this.startResultsFrom });
    }
    if(this.limitResultsTo < 1) {
      throwError('invalidquerylimit', { limit: this.limitResultsTo });
    }
    if(this.sortResultsBy && this.sortResultsBy.field && this.sortResultsBy.order !== -1 && this.sortResultsBy.order !== 1) {
      throwError('invalidquerysort', { sort: this.sortResultsBy.order });
    }
  }
}
/** @ignore */
function throwError(key, data) {
  throw new DataStoreQueryValidationError(App.instance.lang.t(`error.${key}`, data));
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
    this.statusCode = Responder.StatusCodes.Error.User;
  }
}

module.exports = DataStoreQuery;
