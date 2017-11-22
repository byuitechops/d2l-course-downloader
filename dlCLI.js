const prompt = require('prompt');
const chalk = require('chalk');
const main = require('./main');

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
    }
];

module.exports = (orders, callback) => {
    prompt.get(promptSettings, (err, promptData) => {
        if (err) {
            callback(err, promptData);
            return;
        }
        promptData.maxConcurrent = '10';

        orders.forEach(order => {
            console.log(Object.assign(order, promptData));
        });


        // callback(null, promptData);
    });

};
