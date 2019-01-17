
/**
* Abstract builder class to define a DataStore query
*
*/
class DataStoreQuery {
  constructor(options = {}) {
    if(typeof options === 'string') {
      options = { type: options };
    }
    // set some defaults
    Object.assign(this, {
      fieldsMatching: {}
    }, options);
  }

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
    if(this.sortResultsBy.field && this.sortResultsBy.order !== -1 && this.sortResultsBy.order !== 1) {
      throw new DataStoreQueryValidationError(`Sort value must be either -1 or 1, '${this.sortResultsBy.order}'`);
    }
  }
}

class DataStoreQueryValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = DataStoreQuery;
