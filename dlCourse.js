/*eslint-env node, browser, es6*/
/*eslint no-unused-vars:0, no-console:0*/
/* global $ */

/* set up the nightmare class */
const Nightmare = require('nightmare');
require('nightmare-download-manager')(Nightmare);
require('nightmare-helpers')(Nightmare);
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const fws = require('fixed-width-string');

var selectors = {
    checkExport: 'input[name="checkAll"]', // Finds the button to check all checkboxes when selecting content
    contentSelector: 'input[name="includeContent"]',
    contentOptSelector: 'input[name="contentOpt"]',
    discussionSelector: 'input[name="includeDiscuss"]',
    discussionOptSelector: 'input[name="discussOpt"]',
    chkSelectAll: 'input[name="chkSelectAll"]',
    lessonSelector: '',
    continue: 'button[primary="primary"]', // Finds the "Contine" button after choosing what to export
    includeCourseFiles: 'input[name="exportFiles"]', // Finds the "Include course files" checkbox
    finish: 'button[primary="primary"]', // Finds the "Finish" button after exporting
    doneButtonSelector: 'button[primary="primary"]', // Finds the "Done" button after downloading
    clickToDL: 'div .dco_c a', // Finds the "Click here to download Zip" link when done exporting
    imgSel: 'table img' // Finds checkmark image on the export summary page to know when it is done
};

/* this is where the magic happens */
module.exports = (userData) => {

    var nightmare;
    var nightmarePrefs = {
        show: false,
        typeInterval: 20,
        alwaysOnTop: false
    };

    /* Build the nightmare instance */
    nightmare = Nightmare(nightmarePrefs);

    /* Continues the nightmare session after scraping the course name and navigating to the right page */
    function continueDownload(nightmare2) {
        return nightmare2
            //select all components to export
            .click(selectors.checkExport)
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
                console.log('\n');
                delete userData.password;
                return userData;
            })
            .catch(function (error) {
                console.log(chalk.red(error));
                return userData;
            });
    }

    /* Set up what happens when we trigger a download */
    nightmare.on('download', function (state, downloadItem) {

        if (state === 'started') {
            console.log(userData);
            let halfName = '.zip';
            if (userData.instructorEmail) {
                halfName = ` - ${userData.instructorEmail}.zip`;
            }
            userData.downloadLocation = path.resolve('.', userData.downloadLocation, userData.name + halfName);
            if (fs.existsSync(userData.downloadLocation)) {
                console.log('FILE EXISTS AT LOCATION WITH SAME NAME - IT WILL NOT BE OVERWRITTEN');
            }
            nightmare.emit('download', userData.downloadLocation, downloadItem);
        }
        if (state == 'updated') {
            var getPercent = {
                name: userData.name,
                D2LOU: userData.D2LOU,
                divide: downloadItem.receivedBytes / downloadItem.totalBytes,
                percent: Math.floor(downloadItem.receivedBytes / downloadItem.totalBytes * 100)
            };

            /* If download is larger than 2gb, don't download it*/
            var maxBytes = 2000000000;
            if (downloadItem.totalBytes > maxBytes) {
                // stop now...
                console.log(`Course obesity is a real concern to us. Come back when your course is below ${maxBytes / 1000000000} GB`);
                process.exit(1);
            }

            var name = fws(chalk.yellow(getPercent.name), 36);
            var percent = fws(chalk.blueBright(getPercent.percent + '%'), 4);
            var OU = fws(getPercent.D2LOU, 6, {
                align: 'right'
            });
            var bytes = fws(chalk.grey('Bytes: ' + downloadItem.receivedBytes + '' / '' + downloadItem.totalBytes), 40, {
                align: 'left'
            });

            /* Print the current status of the download */
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Downloaded: ${OU} ${name} ${percent} ${bytes}`);
        }
    });

    /* This first step gets the course name, alongside setting up the download */
    return nightmare
        .downloadManager()
        //go to the log in page
        .goto(userData.loginURL)
        .cookies.set(userData.cookies)
        .setWaitTimeout(0, 30, 0)
        //go to import/export copy components of a specific course.
        .goto('https://' + userData.domain +
            '.brightspace.com/d2l/lms/importExport/export/export_select_components.d2l?ou=' + userData.D2LOU)
        .setWaitTimeout(0, 30, 0)
        .wait(selectors.checkAll)
        .evaluate((userData) => {
            /* get the course name */
            return document.querySelectorAll('header div.d2l-navigation-s-header-logo-area>a')[1].innerHTML.split(':')[0];
        }, userData)
        .then((name) => {
            userData.name = name;
            //could do some varification that we have all that we need in userData
            console.log(chalk.blue('Starting ' + chalk.yellowBright(userData.name) + ' Export & Download: ' + userData.D2LOU));
            return continueDownload(nightmare);
        }).catch((e) => {
            console.error(e);
        });
};
