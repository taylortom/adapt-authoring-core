const App = require('./app');
/**
 * Convenience class for sending HTTP responses in a standard format
 */
class Responder {
  /**
  * HTTP status codes for common responses
  * @type {Object} StatusCodes
  * @property {Object} Success Success status codes
  * @property {Number} Success.post 201 (Created)
  * @property {Number} Success.get 200 (OK)
  * @property {Number} Success.put 200 (OK)
  * @property {Number} Success.patch 200 (OK)
  * @property {Number} Success.delete 204 (No Content)
  * @property {Object} Error Error status codes
  * @property {Number} Error.User 400 (Bad Request)
  * @property {Number} Error.Authenticate 401 (Unauthorized)
  * @property {Number} Error.Authorise 403 (Forbidden)
  * @property {Number} Error.Missing 404 (Not Found)
  */
  static get StatusCodes() {
    return {
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
  }
  /**
   * Instanciates the Responder
   * @param {ServerResponse} response
   */
  constructor(response) {
    this.app = App.instance;

    this.name = this.constructor.name.toLowerCase();
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
  success(data = {}, options) {
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
      error = { error: error.toString() };
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
  const errorPrefix = instance.app.lang.t('error.cannotsendresponse');
  if(!options.statusCode) {
    return logError(errorPrefix);
  }
  const response = instance.response;

  if(!response || !response.status || !response.send) {
    return logError(`${errorPrefix}, ${instance.app.lang.t('error.invalidresponse')}`);
  }
  response.status(options.statusCode);

  if(instance.sendJson) {
    return response.json(data);
  }

  if(instance.sendHtml) {
    if(!options.filepath) {
      return logError(`${errorPrefix}, ${instance.app.lang.t('error.nofilepath')}`);
    }
    return response.render(options.filepath, data);
  }

  function logError(...message) {
    instance.app.logger.error(instance.name, ...message);
  }
}

module.exports = Responder;
