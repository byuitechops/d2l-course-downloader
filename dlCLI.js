const prompt = require('prompt');
const chalk = require('chalk');
const downloader = require('./main');
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
        promptData.maxConcurrent = '10'; // Do we need this still?

        var settings = {
            userNameSelector: '#userName',
            passwordSelector: '#password',
            doneButtonSelector: '[primary="primary"]',
            loginURL: `https://byui.brightspace.com/d2l/login?noredirect=1`,
            afterLoginURL: `https://byui.brightspace.com/d2l/home`,
            userName: promptData.userName,
            password: promptData.password,
        }

        getCookies(settings, (errorCookies, cookies) => {
            if (errorCookies) {
                console.log(chalk.red(errorCookies));
                return;
            } else {
                // Set the maxConcurrent downloads
                var userCookies = {
                    cookies: cookies
                };

                asyncLib.map(orders, (order, eachCb) => {
                    // Combine all the pieces
                    data = Object.assign(userCookies, order, promptData, settings);
                    downloader(data, (err3, courseObj) => {
                        if (err3) console.error(err3);
                        else {
                            eachCb(null, courseObj);
                        }
                    });
                }, (err4, resultCourses) => {
                    if (err4) console.error(err4);
                    else {
                        callback(null, resultCourses)
                    }
                });
            }
        });
    });
}
