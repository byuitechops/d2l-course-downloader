const puppeteer = require('puppeteer')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const ProgressBar = require('progress')
const request = require('request')

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
  finish: 'button[primary="primary"]:not([disabled="disabled"])', // Finds the "Finish" button after exporting
  doneButtonSelector: 'button[primary="primary"]', // Finds the "Done" button after downloading
  clickToDL: 'div .dco_c a', // Finds the "Click here to download Zip" link when done exporting
  imgSel: 'table img' // Finds checkmark image on the export summary page to know when it is done
};

module.exports = async userData => {
  const browser = await puppeteer.launch({headless:true})
  const page = await browser.newPage()
  await page.setCookie(...userData.cookies)
  await page.goto(`https://${userData.domain}.brightspace.com/d2l/lms/importExport/export/export_select_components.d2l?ou=${userData.D2LOU}`)
  userData.name = await page.evaluate(() => document.querySelector('div.d2l-navigation-s-header-logo-area a.d2l-navigation-s-link:last-child').innerHTML.split(':')[0])
  userData.name = userData.name.replace(/\/|\?|<|>|\\|:|\*|\|"/g,'')
  
  console.log(chalk.blue('Starting ' + chalk.yellowBright(userData.name) + ' Export & Download: ' + userData.D2LOU));
  
  // Check the export all
  await page.click(selectors.checkExport)

  // Click Continue
  await Promise.all([
    page.waitForNavigation(),
    page.click(selectors.continue),
  ])
  
  // Check the check box if not checked
  await page.evaluate(selector => {
    if(!document.querySelector(selector).checked){
      document.querySelector(selector).click()
    }
  }, selectors.includeCourseFiles)

  // Click Continue
  await Promise.all([
    page.waitForNavigation(),
    page.click(selectors.continue),
  ])

  // Wait the course to export (with some fun)
  var spinner = new require('cli-spinner').Spinner('Exporting')
  spinner.setSpinnerString(25)
  spinner.start()

  await page.waitFor(selectors.finish,{
    timeout: 1000 * 60 * 10 // 10 minutes
  })

  spinner.stop(true)
  
  // then click it
  await Promise.all([
    page.waitForNavigation(),
    page.click(selectors.finish)
  ])

  const downloadURL = await page.evaluate(() => document.querySelector('.d2l-link-inline').href)

  await browser.close()

  let bar;

  await new Promise((resolve,reject) => {
    request({
      url:downloadURL,
      headers:{
        cookie: userData.cookies.map(c => c.name+'='+c.value).join('; ')
      }
    }).on('response', res => {
      var len = +res.headers['content-length']
      /* If download is larger than 2gb, don't download it*/
      var maxBytes = 2000000000;
      if(len > maxBytes){
        console.log(`Course obesity is a real concern to us. Come back when your course is below ${maxBytes / 1000000000} GB`);
        process.exit(1);
      }

      bar = new ProgressBar('Downloading [:bar] :rate/bps :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 30,
        total: len
      });

      res.on('data', chunk => bar.tick(chunk.length)).on('error', reject)

    }).pipe(fs.createWriteStream(path.resolve('.', userData.downloadLocation, userData.name + '.zip'))).on('finish',resolve).on('error',reject)
  })

  delete userData.password

  return userData
}