const prompt = require('prompt');
const chalk = require('chalk');

prompt.message = chalk.whiteBright('');
prompt.delimiter = chalk.whiteBright('');

module.exports = (callback) => {

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
    ];

    prompt.message = chalk.whiteBright('');
    prompt.delimiter = chalk.whiteBright('');

    prompt.get(promptSettings, (err, promptData) => {
        if (err) {
            callback(err, promptData);
            return;
        }
        promptData.subdomain = 'no';
        promptData.source = './CLI/gauntlets.csv';
        promptData.maxConcurrent = '10';
        callback(null, promptData);
    });
};
