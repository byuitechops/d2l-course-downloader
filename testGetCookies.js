/*eslint-env node, es6*/
/*eslint no-unused-vars:0, no-console:0*/

var getCookies = require('./getCookies.js'),
    settings = {
        userName: 'userName',
        userNameSelector: '#userName',
        password: 'password',
        passwordSelector: '#password',
        doneButtonSelector: '',
        loginURL: '',
        afterLoginURL: '',
        show: true
    };

getCookies(settings, function (err, cookies) {
    if (err) {
        console.log("Error:");
        console.log(err);
    } else {
        console.log("It Worked!:");
        console.log(cookies);
    }
});
