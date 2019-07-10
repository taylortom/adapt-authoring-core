const path = require('path');

module.exports = {
  definition: {
    temp_dir: {
      type: 'String',
      default: path.join(process.cwd(), 'temp')
    }
  }
};
