var prompt = require('prompt');

var promptSettings = [{
    name: 'username',
    type: 'string',
    description: 'Enter your username',
    required: true,
    message: 'Username cannot be empty.'
  },
  {
    name: 'password',
    description: 'Enter your password',
    type: 'string',
    required: true,
    hidden: true,
    replace: '*',
    message: 'Password cannot be empty.'
  },
  {
    name: 'csvName',
    type: 'string',
    description: 'Enter your the name of the CSV',
    required: true
  },
  {
    name: 'maxConcurrent',
    type: 'number',
    description: 'Enter the max number of concurrent downloads allowed',
    required: true,
    default: '50',
    message: 'Must be a number.'
  },
  {
    name: 'subdomain',
    type: 'string',
    description: 'Is this for pathway? (yes/no)',
    before: (value) => {
      if (value.toLowerCase() != 'yes') {
        return 'no';
      } else {
        return value;
      }
    }
  },
];

module.exports = (callback) => {

  function promptCB(err, promptData) {
    if (err) {
      callback(err, null);
      return;
    }

    callback(null, promptData);
  }

  prompt.get(promptSettings, promptCB);

  prompt.start();

};
