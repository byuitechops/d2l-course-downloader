const puppeteer = require('puppeteer');

module.exports = async userData => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.goto(`https://${userData.domain}.brightspace.com/d2l/login?noredirect=true`);
    await page.type('#userName', userData.username);
    await page.type('#password', userData.password);
    await Promise.all([
        page.waitForNavigation({
            waitUntil: 'networkidle0'
        }),
        page.click('[primary]'),
    ]);
    const cookies = await page.cookies();
    await browser.close();
    return cookies;
};