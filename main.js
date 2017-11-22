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

    var domain = data.platform === 'pathway' ? 'pathway' : 'byui';

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

    var setup = {
        domain: domain,
        ou: data.courseOU,
        name: '',
        nightmareCookies: data.cookies,
        loginURL: settings.loginURL,
        userName: data.userName,
        password: data.password,
        devtools: true,
    };

    dlCourse(setup, (err, courseObj) => {
        if (err) finalCb(err, courseObj);
        else {
            finalCb(null, courseObj);
        }
    });
}
