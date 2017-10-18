/*eslint-env node, browser, es6*/
/*eslint no-unused-vars:0, no-console:0*/

//set up the nightmare class
var Nightmare = require('nightmare');
require('nightmare-download-manager')(Nightmare);
require('nightmare-helpers')(Nightmare);
var path = require('path');
var chalk = require('chalk');
var fws = require('fixed-width-string');

//this is where the magic happens
module.exports = function dlCourse(settings, callback) {
    /* Continues the nightmare session after scraping the course name*/
    function continueDownload(nightmare2) {
        nightmare2
            //select all components to export
            .click(selectors.checkAll)
            //click continue
            .wait(selectors.continue)
            .click(selectors.continue)
            //include Course Files in export
            .wait(selectors.includeCourseFiles)
            .check(selectors.includeCourseFiles)
            //go to confirm page
            .click(selectors.continue)
            //go to zipping proccess page
            .setWaitTimeout(10, 0, 0)
            .wait('img[src="https://s.brightspace.com/lib/bsi/10.7.5-daylight.6/images/tier1/check.svg"]')
            .click('button[primary]:not([disabled="disabled"])')
            //be done and click finish
            //.setWaitTimeout(0, 40, 0)
            //go to export_summary
            .wait(selectors.clickToDL)
            .click(selectors.clickToDL)
            .waitDownloadsComplete()

            .end()
            .then(function () {
                callback(null, {
                    success: true,
                    name: settings.name,
                    ou: settings.ou,
                    err: {}
                });
            })
            .catch(function (error) {
                console.log(chalk.red(error));
                callback(null, {
                    success: false,
                    name: settings.name,
                    ou: settings.ou,
                    err: chalk.red(error)
                });
            });
    }


    //could do some varification that we have all that we need in settings
    console.log(chalk.blue("Starting " + chalk.yellowBright(settings.name) + " Download: " + settings.ou))

    var nightmare,
        nightmarePrefs = {
            show: settings.show || true,
            typeInterval: 20,
            alwaysOnTop: false
            //waitTimeout: 20 * 60 * 1000
        };

    if (settings.devTools) {
        nightmarePrefs.openDevTools = {
            mode: 'detach'
        };
    }

    //make me a nightmare
    nightmare = Nightmare(nightmarePrefs);

    //set up what happens when we cause a download
    nightmare.on('download', function (state, downloadItem) {
        if (state === 'started') {
            //console.log('NAME', settings.name)
            //set the name and location of the course zip files
            nightmare.emit('download', `./D2LOriginal/${settings.name}.zip`, downloadItem);
        }
        if (state == "updated") {
            var getPercent = {
                name: settings.name,
                ou: settings.ou,
                divide: downloadItem.receivedBytes / downloadItem.totalBytes,
                percent: Math.floor(downloadItem.receivedBytes / downloadItem.totalBytes * 100)
            }
            //print to the console where we are with the download
            //show % and name and ou
            //show what it has but add the others in one line
            console.log("Downloaded: ", fws(getPercent.ou, 6, {
                    align: 'right'
                }),
                fws(chalk.yellow(getPercent.name), 36),
                fws(chalk.blueBright(getPercent.percent + '%'), 4),
                fws(chalk.grey("Bytes: " + downloadItem.receivedBytes + " / " + downloadItem.totalBytes), 40, {
                    align: 'left'
                })
            );
        }
    });

    var selectors = {
        checkAll: 'input[name="checkAll"]',
        continue: 'button[primary="primary"]',
        includeCourseFiles: 'input[name="exportFiles"]',
        finish: 'button[primary="primary"]',
        doneButtonSelector: 'button[primary="primary"]',
        clickToDL: 'div .dco_c a'
    }
    //console.log('Settings', settings);
    nightmare
        .downloadManager()
        //go to the log in page
        .goto(settings.loginURL)
        .cookies.set(settings.nightmareCookies)
        //fill in the user name and password
        // .insert(settings.userNameSelector, settings.userName)
        // .insert(settings.passwordSelector, settings.password)
        //click the log in button
        // .click(selectors.doneButtonSelector)
        //logins have a lot of redirects so wait till we get to the right page
        /*.wait(function (url) {
            url = new RegExp(url);
            return url.test(document.location.href);
        }, 'https://byui.brightspace.com/d2l/home')*/
        //.waitURL('https://byui.brightspace.com/d2l/home')
        .setWaitTimeout(0, 10, 0)
        //go to import/export copy components of a specific course.
        .goto('https://' + settings.domain +
            '.brightspace.com/d2l/lms/importExport/export/export_select_components.d2l?ou=' + settings.ou)
        .setWaitTimeout(0, 10, 0)
        .wait(selectors.checkAll)
        .evaluate((settings) => {
            /* get the course name */
            return document.querySelectorAll('header div.d2l-navigation-s-header-logo-area>a')[1].innerHTML.split(':')[0];
        }, settings)
        .then((name) => {
            settings.name = name;
            continueDownload(nightmare);
        });
}
//do we need these anymore? This was included multiple times but i don't think its necessary. THe program has run just fine without it.
/*.wait(function () {
    return document.location.origin + document.location.pathname === "https://byui.brightspace.com/d2l/lms/importExport/export/export_summary.d2l";
})*/
/*.wait(function () {
    return document.getElementsByTagName("h1")[0].innerHTML.match(/(Select Course Material)/g);
})*/
