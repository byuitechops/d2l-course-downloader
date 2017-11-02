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
    singleDownload: function (callback) {
        singlePrompt((err, promptData) => {
            main(promptData, results => {
                callback(results);
            });
        })
    },
    multiDownload: function (callback) {
        multiPrompt((err, promptData) => {
            console.log(promptData);
            main(promptData, results => {
                callback(results);
            });
        })
    },
    gauntletDownload: function (callback) {
        gauntletPrompt((err, promptData) => {
            main(promptData, results => {
                callback(results);
            });
        })
    },
}
