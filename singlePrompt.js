const prompt = require('prompt');
const chalk = require('chalk');

prompt.message = chalk.whiteBright('');
prompt.delimiter = chalk.whiteBright('');

var promptSettings = [{
        name: 'userName',
        type: 'string',
        description: chalk.cyanBright('Enter your username:'),
        required: true,
        message: 'Username cannot be empty.'
    },
    {
        name: 'password',
        description: chalk.cyanBright('Enter your password:'),
        type: 'string',
        required: true,
        hidden: true,
        replace: '*',
        message: 'Password cannot be empty.'
    },
    {
        name: 'source',
        type: 'string',
        description: chalk.cyanBright('Enter the D2L OU:'),
        required: true,
        pattern: /(\d+)|(\S+.csv$)/
    },
    {
        name: 'subdomain',
        type: 'string',
        description: chalk.cyanBright('Is this for pathway? (yes/no)'),
        before: (value) => {
            if (value.toLowerCase() != 'yes' || value.toLowerCase() != 'y') {
                return 'no';
            } else {
                return 'yes';
            }
        }
    },
];

module.exports = (callback) => {

    prompt.get(promptSettings, (err, promptData) => {
        if (err) {
            callback(err, promptData);
            return;
        }
        promptData.maxConcurrent = '10';
        callback(null, promptData);
    });

};
