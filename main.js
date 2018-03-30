const getCookies = require('./getCookies.js');
const dlCourse = require('./dlCourse.js');
const fs = require('fs');

module.exports = (userData) => {

    /* Add the downlocation if it wasn't provided */
    if (!userData.downloadLocation) {
        userData.downloadLocation = './factory/originalZip';
    }

    /* Set the domain value based on the platform */
    if (userData.platform === 'online' || userData.platform === 'campus') {
        userData.domain = 'byui';
    } else {
        userData.domain = 'pathway';
    }

    /* If the "-e" flag is used, just find the first zip file and return it */
    if (process.argv.includes('-e')) {
        return new Promise((resolve, reject) => {
            fs.readdir('./factory/originalZip', (err, files) => {
                if (err) {
                    reject(err);
                }

                if (files) {
                    userData.name = files.find(file => file.includes('.zip'));
                    resolve(userData);
                } else {
                    reject(new Error('There aren\'t any course zips ready to be used.'));
                }
            });
        });
    }

    console.log('Retrieving cookies...');
    return getCookies(userData)
        .then((cookies) => {
            userData.cookies = cookies;
            return userData;
        })
        .then(dlCourse)
        .catch(console.error);
};