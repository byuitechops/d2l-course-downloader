/*eslint-env node, es6*/
/*eslint no-console:1*/

const prompt = require('prompt');
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
}
];

var courseDomain = [{
    name: 'domain',
    description: chalk.cyanBright('Is this for Pathway?'),
    type: 'string',
    default: 'no',
    required: true,
    message: 'Password cannot be empty.',
    before: (value) => {
        if (value.toLowerCase() != 'yes' || value.toLowerCase() != 'y') {
            return 'byui';
        } else {
            return 'pathway';
        }
    }
}];

var downloadPrompt = function (userData, cb) {
    function enterResponse(err, responses) {
        if (err) {
            console.error(err);
            cb(err);
        }
        var resKeys = Object.keys(responses);
        resKeys.forEach((key) => {
            userData[key] = responses[key];
        });
        checkValues();
    }

    function checkValues() {
        /* if not given username / password, get them */
        if (!userData.username || !userData.password) {
            prompt.get(promptQuestions, enterResponse);
        } else if (!userData.domain) {
            prompt.get(courseDomain, enterResponse);
        } else {
            console.log('Beginning download process...');
            cb(null);
        }
    }
    checkValues();
};

module.exports = downloadPrompt; 