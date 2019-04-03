const Errors = require('./errors');
const Logger = require('adapt-authoring-logger');

/**
 * Convenience class for sending HTTP responses in a standard format
 */
class Responder {
  /**
   * Instanciates the Responder
   * @param {http~ServerResponse} response
   */
  constructor(response) {
    /** @ignore */
    this.response = response;
  }

  /**
   * Returns a success response to the client
   * @param {Object} data data to return in the response
   * @param {Number} statusCode HTTP status code to send with response
   */
  success(data = {}, statusCode = 200) {
    respond(this.response, data, statusCode);
  }
  /**
   * Returns an error response to the client
   * @param {String|Error} error error to return
   * @param {Number} statusCode HTTP status code to send with response
   */
  error(error, statusCode = 500) {
    if(error instanceof Error) {
      statusCode = error.statusCode || statusCode;
      error = error.toString();
    } else if(typeof error !== 'string') {
      error = Errors.UnknownError;
    }
    respond(this.response, { error: error }, statusCode);
  }
}
/**
 * Delegate function to send an HTTP response
 * @param {http~ServerResponse} response
 * @param {Object} data data to send with response
 * @param {Number} statusCode HTTP status code to send with response
 */
function respond(response, data, statusCode) {
  if(!response || !response.status || !response.send) {
    Logger.log('error', 'Cannot send response, invalid response object set');
  }
  if(!data.statusCode) {
    data.statusCode = statusCode;
  }
  response.status(statusCode).send(data);
}

module.exports = Responder;
