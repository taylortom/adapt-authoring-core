/**
* Error for validation issues in which multiple errors are summarised in a single parent error
* @class
*/
class DataValidationError extends Error {
  /**
  * @param {String} messagePrefix String to prefix the Error.message
  * @param {Array} errors Child errors
  */
  constructor(messagePrefix, errors) {
    super(...arguments);
    /**
    * Name of the error
    * @type {String}
    */
    this.name = this.constructor.name;
    /**
    * String to prefix the Error.message
    * @type {String}
    */
    this.messagePrefix = messagePrefix;
    /**
    * Child errors
    * @type {Array<Error>}
    */
    this.errors = errors || [];
    /**
    * The concatenated error message
    * @type {String}
    */
    this.message;

    this.updateMessage();
  }
  /**
  * Adds a 'child' error to the list, and updates the error's message
  * @param {...Error} error Error(s) to add
  */
  addError(...error) {
    error.forEach(e => this.errors.push(e));
    this.updateMessage();
  }
  /**
  * Makes sure the error.message represents the current list of child errors
  */
  updateMessage() {
    this.message = `${this.messagePrefix}: ${this.errors.join(', ')}.`;
  }
}

module.exports = DataValidationError;
