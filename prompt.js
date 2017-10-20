var prompt = require('prompt');
var chalk = require('chalk');
var main = require('./main.js');

var promptSettings = [{
    name: 'userName',
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
    default: '15',
    message: 'Must be a number.'
  },
  {
    name: 'subdomain',
    type: 'string',
    description: 'Is this for pathway? (yes/no)',
    before: (value) => {
      if (value.toLowerCase() != 'yes' || value.toLowerCase() != 'y') {
        return 'no';
      } else {
        return 'yes';
      }
    }
  },
];

// prompt.start();

prompt.get(promptSettings, (err, promptData) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log(promptData);
    main(promptData);
});
