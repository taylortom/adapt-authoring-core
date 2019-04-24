const Errors = require('./errors');
const Logger = require('adapt-authoring-logger');

/**
 * Convenience class for sending HTTP responses in a standard format
 */
class Responder {
  /**
  * A map of status codes for reference
  * @type {Object}
  * @example
  * {
  *   Success: {
  *     post: 201,
  *     get: 200,
  *     put: 200,
  *     patch: 200,
  *     delete: 204
  *   },
  *   Error: {
  *     User: 400,
  *     Missing: 404,
  *     Authenticate: 401,
  *     Authorise: 403
  *   }
  * }
  */
  static get StatusCodes() {
    return STATUS_CODES;
  }
  /**
   * Instanciates the Responder
   * @param {http~ServerResponse} response
   */
  constructor(response) {
    /** @ignore */
    this.response = response;
    /**
    * @desc Configures class to send an HTML response
    * @type {Boolean}
    */
    this.sendHtml = false;
    /**
    * @desc Configures class to send a JSON response
    * @type {Boolean}
    */
    this.sendJson = true;
  }
  /**
  * Chainable function to configure class to send JSON responses
  */
  json() {
    this.sendJson = true
    this.sendHtml = false;
    return this;
  }
  /**
  * Chainable function to configure class to send HTML responses
  */
  html() {
    this.sendHtml = true;
    this.sendJson = false;
    return this;
  }
  /**
   * Returns a success response to the client
   * @param {Object} data data to return in the response
   * @param {Object} options Options to pass to function
   */
  success(data, options) {
    respond(this, data, Object.assign({ statusCode: 200 }, options));
  }
  /**
   * Returns an error response to the client
   * @param {String|Error|Object} error error to return
   * @param {Object} options Options to pass to function
   */
  error(error, options) {
    let statusCode = 500;
    if(typeof error === 'string') {
      error = { error: error };
    }
    if(error.statusCode) {
      statusCode = error.statusCode;
    }
    if(error instanceof Error) {
      error = { error: error.message };
    }
    respond(this, error, Object.assign({ statusCode }, options));
  }
}
/**
 * Delegate function to send an HTTP response
 * @param {Responder} instance The responder instance
 * @param {Object} data Data to send with response
 * @param {Object} options Options to pass to function
 */
function respond(instance, data, options) {
  if(!options.statusCode) {
    return Logger.log('error', 'Cannot send response, options.statusCode required');
  }
  const response = instance.response;

  if(!response || !response.status || !response.send) {
    return Logger.log('error', 'Cannot send response, invalid response object set');
  }
  if(!data.statusCode) {
    data.statusCode = options.statusCode;
  }
  response.status(data.statusCode);

  if(instance.sendJson) {
    return response.json(data);
  }
  if(instance.sendHtml) {
    if(!options.filepath) {
      return Logger.log('error', 'Cannot send response, options.filepath required');
    }
    return response.render(options.filepath, data);
  }
}

const STATUS_CODES = {
  Success: {
    post: 201,
    get: 200,
    put: 200,
    patch: 200,
    delete: 204
  },
  Error: {
    User: 400,
    Missing: 404,
    Authenticate: 401,
    Authorise: 403
  }
};

module.exports = Responder;
