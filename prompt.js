/*eslint-env node, es6*/
/*eslint no-console:1*/

const prompt = require('prompt');
const main = require('./main.js');

const chalk = require('chalk');


prompt.message = chalk.whiteBright('');
prompt.delimiter = chalk.whiteBright('');
var promptQuestions = [{
        name: 'username',
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
    }];

module.exports = (userData) => {
    /* if not given username / password, get them */
    if (!userData.username || !userData.password) {
        prompt.get(promptQuestions, (responses) => {
            userData.username = responses.username;
            userData.password = responses.password;
            main(userData);
        });
    } else {
        main(userData);
    }
};
