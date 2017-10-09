
var getPrompt = require('./prompt.js');
var fs = require('fs');
var path = require('path');
var d3 = require('d3-dsv');
var getCookes = require('./getCookies.js');
var dlCourse = require('./dlCourse.js');

getPrompt((err, promptData) => {
  var csvData;
  fs.readFile(path.resolve(promptData.csvName), 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      csvData = d3.csvParse(data);
    }
  });
});
