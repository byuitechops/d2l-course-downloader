
var fs = require('fs');
var path = require('path');
var d3 = require('d3-dsv');
var asyncLib = require('async');
var getPrompt = require('./prompt.js');
var getCookies = require('./getCookies.js');
var dlCourse = require('./dlCourse.js');

getPrompt((err, promptData) => {
  var domain = promptData === 'yes' ? 'pathway' : 'byui';

  /* Read in the CSV */
  fs.readFile(path.join('.', promptData.csvName), 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {

      /* Parse the CSV */
      var csvData = d3.csvParse(data);
      // console.log(csvData);

      /* Determine settings */
      var settings = {
        userName: promptData.userName,
        userNameSelector: '#userName',
        password: promptData.password,
        passwordSelector: '#password',
        doneButtonSelector: '[primary="primary"]',
        loginURL: `https://${domain}.brightspace.com/d2l/login?noredirect=1`,
        afterLoginURL: `https://${domain}.brightspace.com/d2l/home`
      };

      /* Get them cookies */
      getCookies(settings, (errorCookies, cookies) => {
        if (errorCookies) {
          console.log(errorCookies);
        } else {

          /* Set parameters for download */
          var courses = csvData.map(course => {
            return {
              domain: domain,
              ou: course.ou,
              name: course.name,
              fileOutPath: path.join('.', course.name),
              nightmareCookies: cookies,
              loginURL: settings.loginURL
            };
          });

          /* Download ALL the courses */
          asyncLib.map(courses, dlCourse, (errorDl, results) => {
            fs.writeFile('./results.txt', results, err => {
              console.log('SUCCESS!');
            });
          });
        }
      });
    }
  });
});
