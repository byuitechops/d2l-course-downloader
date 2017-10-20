/*eslint-env node, es6*/
/*eslint no-console: 0*/

var fs = require('fs');
var path = require('path');
var d3 = require('d3-dsv');
var asyncLib = require('async');
var getCookies = require('./getCookies.js');
var dlCourse = require('./dlCourse.js');
var chalk = require('chalk');

module.exports = (promptData) => {

    var domain = promptData.subdomain === 'yes' ? 'pathway' : 'byui';

    if (promptData.source.includes('.csv')) {
        /* Read in the CSV */
        fs.readFile(path.join('.', promptData.csvName), 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            } else {

                /* Parse the CSV */
                var csvData = d3.csvParse(data);
                // console.log(csvData);

                /* Determine settings */
                var settings = {
                    userName: promptData.userName,
                    userNameSelector: '#userName',
                    password: promptData.password,
                    passwordSelector: '#password',
                    doneButtonSelector: '[primary="primary"]',
                    loginURL: `https://${domain}.brightspace.com/d2l/login?noredirect=1`,
                    afterLoginURL: `https://${domain}.brightspace.com/d2l/home`
                };

                /* Get them cookies */
                getCookies(settings, (errorCookies, cookies) => {
                    if (errorCookies) {
                        console.log(chalk.red(errorCookies));
                    } else {
                        // console.log(csvData);
                        /* Set parameters for download */
                        var courses = csvData.map(course => {
                            return {
                                domain: domain,
                                ou: course.OU,
                                name: '',
                                nightmareCookies: cookies,
                                loginURL: settings.loginURL,
                                userName: promptData.userName,
                                password: promptData.password,
                                devtools: true,
                            };
                        });
                        /* Download ALL the courses */
                        asyncLib.mapLimit(courses, promptData.maxConcurrent, dlCourse, (
                            mapError, results) => {
                            var stringified = results.map(result => JSON.stringify(
                                result));
                            fs.writeFile('./results.json', stringified, errorFS => {
                                if (errorFS) {
                                    console.log(chalk.red(errorFS));
                                } else {
                                    var failList = results.filter(course =>
                                        !course.success);
                                    if (failList.length === 0) {
                                        console.log(chalk.green(
                                            `All ${chalk.yellow(results.length)} courses successfully downloaded.`
                                        ));
                                    } else {
                                        console.log(chalk.redBright(
                                            `These ${chalk.red(failList.length)} courses failed to download:`
                                        ));
                                        console.log(failList);
                                    }
                                }
                            });
                        });
                    }
                });
            }
        });
    }
}
