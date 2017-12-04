/*eslint-env node, browser, es6*/
/*eslint no-unused-vars:0, no-console:0*/

/* set up the nightmare class */
var Nightmare = require('nightmare');
require('nightmare-download-manager')(Nightmare);
require('nightmare-helpers')(Nightmare);
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');
var fws = require('fixed-width-string');

var selectors = {
    checkAll: 'input[name="checkAll"]', // Finds the button to check all checkboxes when selecting content
    continue: 'button[primary="primary"]', // Finds the "Contine" button after choosing what to export
    includeCourseFiles: 'input[name="exportFiles"]', // Finds the "Include course files" checkbox
    finish: 'button[primary="primary"]', // Finds the "Finish" button after exporting
    doneButtonSelector: 'button[primary="primary"]', // Finds the "Done" button after downloading
    clickToDL: 'div .dco_c a', // Finds the "Click here to download Zip" link when done exporting
    imgSel: `table img` // Finds checkmark image on the export summary page to know when it is done
}

/* this is where the magic happens */
module.exports = (userData, callback) => {
    /* Continues the nightmare session after scraping the course name */
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
            .setWaitTimeout(30, 0, 0)
            .wait(selectors.imgSel)
            .wait('button[primary]:not([disabled="disabled"])')
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
                    name: userData.name,
                    downloadLocation: userData.downloadLocation,
                    ou: userData.ou,
                    err: {}
                });
            })
            .catch(function (error) {
                console.log(chalk.red(error));
                callback(null, {
                    success: false,
                    name: userData.name,
                    downloadLocation: userData.downloadLocation,
                    ou: userData.ou,
                    err: chalk.red(error)
                });
            });
    }


    //could do some varification that we have all that we need in userData
    console.log(chalk.blue("Starting " + chalk.yellowBright(userData.name) + " Download: " + userData.ou))

    var nightmare,
        nightmarePrefs = {
            show: false,
            typeInterval: 20,
            alwaysOnTop: false
            //waitTimeout: 20 * 60 * 1000
        };
    /* make me a nightmare */
    nightmare = Nightmare(nightmarePrefs);

    /* set up what happens when we cause a download */
    nightmare.on('download', function (state, downloadItem) {
        if (state === 'started') {
            userData.downloadLocation = path.resolve('.', userData.downloadLocation, userData.name + '.zip');
            nightmare.emit('download', userData.downloadLocation, downloadItem);
        }
        if (state == "updated") {
            var getPercent = {
                name: userData.name,
                ou: userData.ou,
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

    // console.log('userData', userData);
    nightmare
        .downloadManager()
        //go to the log in page
        .goto(userData.loginURL)
        .cookies.set(userData.cookies)
        .setWaitTimeout(0, 30, 0)
        //go to import/export copy components of a specific course.
        .goto('https://' + userData.domain +
            '.brightspace.com/d2l/lms/importExport/export/export_select_components.d2l?ou=' + userData.ou)
        .setWaitTimeout(0, 30, 0)
        .wait(selectors.checkAll)
        .evaluate((userData) => {
            /* get the course name */
            return document.querySelectorAll('header div.d2l-navigation-s-header-logo-area>a')[1].innerHTML.split(':')[0];
        }, userData)
        .then((name) => {
            userData.name = name;
            continueDownload(nightmare);
        }).catch((e) => {
            console.error(e);
        });
}
