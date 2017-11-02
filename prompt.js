/*eslint-env node, es6*/
/*eslint no-console:1*/

var prompt = require('prompt');
var main = require('./main.js');
var chalk = require('chalk');

const downloader = require('./')
const gauntletPrompt = require('./gauntletPrompt.js');
const singlePrompt = require('./singlePrompt.js');
const multiPrompt = require('./multiPrompt.js');

const finalCallback = function (results) {
    // console.log(results);
}

module.exports = {
    singleDownload: function () {
        singlePrompt((err, promptData) => {
            main(promptData, finalCallback);
        })
    },
    multiDownload: function () {
        multiPrompt((err, promptData) => {
            console.log(promptData);
            main(promptData, finalCallback);
        })
    },
    gauntletDownload: function () {
        gauntletPrompt((err, promptData) => {
            main(promptData, finalCallback);
        })
    },
}
