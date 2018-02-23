/*eslint-env node, es6*/
/*eslint no-console: 0*/

var asyncLib = require('async');
var getCookies = require('./getCookies.js');
var dlCourse = require('./dlCourse.js');
var fs = require('fs');

module.exports = (userData, finalCb) => {

    var potentialDownloadLocation = path.resolve('.', userData.downloadLocation);

    fs.readdir(potentialDownloadLocation, (err, files) => {
        if (err) console.log(err);
        if (files.includes(userData.name + '.zip')) {
            console.log('File with the same name exists at download location - it will NOT be overwritten.');
        }


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
    });
};
