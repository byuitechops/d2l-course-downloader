/*eslint-env node, es6*/
/*eslint no-console:1*/

var prompt = require('prompt');
var main = require('./main.js');
var chalk = require('chalk');

module.exports = (finalCb) => {

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
            description: chalk.cyanBright('Enter the D2L OU or the name of the CSV:'),
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

    var downloadMax = [{
        name: 'maxConcurrent',
        type: 'number',
        description: chalk.cyanBright('Enter the max number of concurrent downloads allowed:'),
        required: true,
        default: '15',
        message: 'Must be a number.'
}];

    prompt.message = chalk.whiteBright('');
    prompt.delimiter = chalk.whiteBright('');

    prompt.get(promptSettings, (err, promptData) => {
        if (err) {
            console.log(err);
            return;
        }

        if (promptData.source.includes('.csv')) {
            prompt.get(downloadMax, (err, downloadMaxValue) => {
                if (err) {
                    console.error(err);
                    return;
                }
                promptData.maxConcurrent = downloadMaxValue.maxConcurrent;
                main(promptData, finalCb);
            });
        } else {
            promptData.maxConcurrent = '1';
            main(promptData, finalCb);
        }
    });
}
