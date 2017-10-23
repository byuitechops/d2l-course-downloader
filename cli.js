/*eslint-env node, es6*/
/*eslint no-console: 0*/

const downloader = require('./prompt.js');

downloader((results) => {
    console.log("Downloader complete");
});