const path = require('path');

module.exports = {
  definition: {
    root_dir: {
      type: 'String',
      default: process.cwd(),
      description: 'Path to the root folder'
    },
    temp_dir: {
      type: 'String',
      default: path.join(process.cwd(), 'temp'),
      description: 'Path to the temporary folder'
    }
  }
};
