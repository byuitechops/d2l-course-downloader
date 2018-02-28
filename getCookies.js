/*eslint-env browser, node, es6*/
/*eslint no-unused-vars:0, no-console:0*/

//set up the nightmare class
var Nightmare = require('nightmare');
require('nightmare-helpers')(Nightmare);

var userNameSelector = '#userName';
var passwordSelector = '#password';
var doneButtonSelector = '[primary="primary"]';

//this is where the magic happens
module.exports = function getCookies(userData, cb) {

    var loginURL = `https://${userData.domain}.brightspace.com/d2l/login?noredirect=1`;
    var afterLoginUrl = `https://${userData.domain}.brightspace.com/d2l/home`;
    var nightmarePrefs = {
        show: false,
        typeInterval: 20,
        alwaysOnTop: false
    };
    //make nightmare with our userData
    var nightmare = Nightmare(nightmarePrefs);

    function waitURL(url) {
        var regex = new RegExp(url);
        return regex.test(document.location.href);
    }

    return nightmare
        //go to the log in page
        .goto(loginURL)
        //fill in the user name and password
        .insert(userNameSelector, userData.username)
        .insert(passwordSelector, userData.password)
        //click the log in button
        .click(doneButtonSelector)
        // logins have a lot of redirects so wait till we get to the right page
        .wait(1500)
        .wait(waitURL, afterLoginUrl)
        //now that we have logged in steal the cookies
        .cookies.get()
        .end();
};