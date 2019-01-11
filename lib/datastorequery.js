
/**
* Abstract builder class to define a DataStore query
*
*/
class DataStoreQuery {
  constructor(type) {
    this.type = type;
    this.fields = {};
  }

  withFieldMatching(key, value) {
    if(key && typeof key === 'string' && value !== undefined) {
      this.fields[key] = value;
    }
    return this;
  }

  withFieldsMatching(data) {
    Object.keys(data).forEach(key => this.withFieldMatching(key, data[key]));
    return this;
  }

  /**
  * Specifies which fields should be aggregated with values from other collections
  */
  aggregateFields(fields) {
    this.aggregate = fields;
    return this;
  }

  startResultsFrom(count) {
    if(count >= 1) this.skip = count;
    return this;
  }

  limitResultsTo(count) {
    if(count >= 1) this.limit = count;
    return this;
  }

  /**
  * Sorts the results by the provided field
  * @param {String} field Name of field to sort by
  * @param {Number} order Number indicating sort order (-1: descending, 1: ascending)
  */
  sortResultsBy(field, order) {
    if(!this.fields[field]) {
      return console.log(`DataStoreQuery#sortResultsBy: WARNING, NO FIELD MATCHING '${field}'`);
    }
    if(order !== -1 && order !== 1) {
      return console.log(`DataStoreQuery#sortResultsBy: WARNING, INVALID ORDER '${order}'`);
    }
    this.sort = { field: order };
  }
}

module.exports = DataStoreQuery;
