
var getPrompt = require('./prompt.js');
var fs = require('fs');
var path = require('path');
var d3dsv = require('./d3-dsv');

var csvFile = '';

getPrompt((err, promptData) => {
  fs.readFile(promptData.csvName, (err, data) => {

    console.log(data);
  });
});
