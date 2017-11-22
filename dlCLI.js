const prompt = require('prompt');
const chalk = require('chalk');
const main = require('./main');
const getCookies = require('./getCookies.js');

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

            getCookies(settings, (errorCookies, cookies) => {
                if (errorCookies) {
                    console.log(chalk.red(errorCookies));
                    return;
                } else {

                    asyncLib.each(orders, (order, eachCb) => {
                        // Combine all the pieces
                        var data = Object.assign(order, promptData);
                        data.cookies = cookies;

                        // Do the download thingy
                        downloader(data, () => {

                            eachCb(null);
                        });
                    }, err2 => {
                        if (err2) console.error(err2);
                        else {
                            console.log('Complete!');
                            callback(orders);
                        }
                    });
                }
            });
        });
}