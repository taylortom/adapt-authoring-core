const Logger = require('adapt-authoring-logger');

function Responder(response) {
  const respond = (data, statusCode) => {
    if(!response.status || !response.send) {
      Logger.log('error', 'Cannot send response, invalid response object set');
    }
    response.status(statusCode).send(data);
  };
  return {
    success: (data, statusCode = 200) => {
      respond(Object.assign({ success: true }, data), statusCode);
    },
    error: (data, statusCode = 500) => {
      if(typeof data === 'string') {
        data = { error: data };
      } else if(data instanceof Error) {
        statusCode = data.statusCode || statusCode;
        data = { error: data.message };
      }
      respond(Object.assign({ success: false, statusCode: statusCode }, data), statusCode);
    }
  };
}

module.exports = Responder;
