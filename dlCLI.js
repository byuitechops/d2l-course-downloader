const prompt = require('prompt');
const chalk = require('chalk');
const main = require('./main');
const getCookies = require('./getCookies.js');
const asyncLib = require('async');

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

        var settings = {
            userNameSelector: '#userName',
            passwordSelector: '#password',
            doneButtonSelector: '[primary="primary"]',
            loginURL: `https://byui.brightspace.com/d2l/login?noredirect=1`,
            afterLoginURL: `https://byui.brightspace.com/d2l/home`,
        }

        // Set the maxConcurrent downloads
        promptData.maxConcurrent = '10';

        asyncLib.each(orders, (order, eachCb) => {
            // Combine all the pieces
            var data = Object.assign(order, promptData);

            // Get them cookies
            getCookies(settings, (errorCookies, cookies) => {
                    if (errorCookies) {
                        console.log('ERROR');
                        console.log(chalk.red(errorCookies));
                        return;
                    } else {
                        data.cookies = cookies;
                        // download the course
                        console.log(data);
                        downloader(data, () => {
                            eachCb(null);
                        });
                    }
            });
        });
    });
}
