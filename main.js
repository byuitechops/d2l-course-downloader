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

module.exports = (data, finalCb) => {

    /* Determine settings */
    var settings = {
        userName: data.userName,
        userNameSelector: '#userName',
        password: data.password,
        passwordSelector: '#password',
        doneButtonSelector: '[primary="primary"]',
        loginURL: `https://${domain}.brightspace.com/d2l/login?noredirect=1`,
        afterLoginURL: `https://${domain}.brightspace.com/d2l/home`
    };

    console.log(settings);

    if (data.platform === 'Campus' ||
        data.platform === 'Online') {
        data.platform = 'byui';
    } else {
        data.platform = 'pathway';
    }

    var setup = {
        domain: data.platform,
        ou: data.courseOU,
        name: '',
        nightmareCookies: data.cookies,
        loginURL: settings.loginURL,
        userName: data.userName,
        password: data.password,
        devtools: true,
    };

    // function downloadCourse() {
        dlCourse(settings, (err, courseObj) => {
            if (err) console.error(err);
            else {
                console.log(courseObj);
            }
        });
    // }
    // function downloadCourses(courseList) {
    //     /* Get them cookies */
    //
    //             /* Download ALL the courses */
    //             asyncLib.mapLimit(courses, data.maxConcurrent, dlCourse, (
    //                 mapError, results) => {
    //                 var stringified = results.map(result => JSON.stringify(
    //                     result));
    //                 fs.writeFile('./results.json', stringified, errorFS => {
    //                     if (errorFS) {
    //                         console.log(chalk.red(errorFS));
    //                     } else {
    //                         var failList = results.filter(course =>
    //                             !course.success);
    //                         if (failList.length === 0) {
    //                             console.log(chalk.green(
    //                                 `All ${chalk.yellow(results.length)} courses successfully downloaded.`
    //                             ));
    //                         } else {
    //                             console.log(chalk.redBright(
    //                                 `These ${chalk.red(failList.length)} courses failed to download:`
    //                             ));
    //                             console.log(failList);
    //                         }
    //                     }
    //                     /* Call this here? And pass back location of exports folder..*/
    //                     finalCb(results);
    //                 });
    //             });
    //         }
    //     });
    // }

}
