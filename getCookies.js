/*eslint-env node, es6*/
/*eslint no-unused-vars:0, no-console:0*/

//set up the nightmare class
var Nightmare = require('nightmare');
require('nightmare-helpers')(Nightmare);

//this is where the magic happens
module.exports = function getCookies(settings, cb) {
    console.log("Lets log in...");
    var nightmarePrefs = {
        show: settings.show || true,
        typeInterval: 20,
        alwaysOnTop: false
    };
    //make nightmare with our settings
    var nightmare = Nightmare(nightmarePrefs);


    nightmare
        //go to the log in page
        .goto(settings.loginURL)
        //fill in the user name and password
        .insert(settings.userNameSelector, settings.userName)
        .insert(settings.passwordSelector, settings.password)
        //click the log in button
        .click(settings.doneButtonSelector)
        //logins have a lot of redirects so wait till we get to the right page
        .wait(function (url) {
            url = new RegExp(url);
            return url.test(document.location.href);
        }, 'https://byui.brightspace.com/d2l/home')
        //now that we have logged in steal the cookies
        .cookies.get()
        .end()
        .then(function (cookies) {
            //send the cookies back
            console.log("Cookies Retrieved!");
            console.log(cookies);
            cb(null, cookies);
        })
        //if anything errors it goes here. pass it back to the user
        .catch(function (error) {
            cb(error, null);
        });
}
