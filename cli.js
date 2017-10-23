/*eslint-env node, es6*/

const downloader = require('./prompt.js');

downloader((err, response) => {
    console.log(err);
    console.log(response);
});
