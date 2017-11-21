/*eslint-env node, es6*/
/*eslint no-console: 0*/

var fs = require('fs');
var path = require('path');
var d3 = require('d3-dsv');
var asyncLib = require('async');
var getCookies = require('./getCookies.js');
var dlCourse = require('./dlCourse.js');
var path = require('path');
var chalk = require('chalk');

module.exports = (promptData, finalCb) => {
    console.log(promptData);

    var domain = promptData.subdomain === 'yes' ? 'pathway' : 'byui';

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

    function getCSVData(callback) {
        /* Read in the CSV */
        fs.readFile(path.join('.', promptData.source), 'utf8', (err, data) => {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                /* Parse the CSV */
                var csvData = d3.csvParse(data);
                callback(null, csvData);
            }
        });
    }

    function downloadCourses(courseList) {
        /* Get them cookies */
        getCookies(settings, (errorCookies, cookies) => {
            if (errorCookies) {
                console.log(chalk.red(errorCookies));
                return;
            } else {
                /* Set parameters for download */
                var courses = courseList.map(course => {
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
                        /* Call this here? And pass back location of exports folder..*/
                        finalCb(results);
                    });
                });
            }
        });
    }

    if (promptData.source.includes('.csv')) {
        getCSVData((d3Error, csvData) => {
            if (d3Error) {
                console.error(d3Error);
                return;
            } else {
                downloadCourses(csvData);
            }
        });
    } else {
        downloadCourses([{
            OU: promptData.source
        }]);
    }
}
