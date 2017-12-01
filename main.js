/*eslint-env node, es6*/
/*eslint no-console: 0*/

var asyncLib = require('async');
var getCookies = require('./getCookies.js');
var dlCourse = require('./dlCourse.js');

module.exports = (userData, finalCb) => {

    /* Determine settings */
    getCookies(userData, (err, cookies) => {
        if (err) {
            finalCb(err);
            return;
        }
        userData.cookies = cookies;
        userData.loginURL = `https://${userData.domain}.brightspace.com/d2l/login?noredirect=1`;
        userData.name = '';

        asyncLib.mapLimit(userData.ous, 10, (ou, callback) => {
            console.log(userData.downloadLocation, userData.ous);
            userData.ou = ou;
            var dataClone = Object.assign({}, userData);
            dlCourse(dataClone, callback);
        }, (err, courses) => {
            if (err) {
                finalCb(err);
            } else {
                finalCb(null, courses);
            }
        });

    });
}
