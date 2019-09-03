const puppeteer = require('puppeteer-core')

const loginScript = require('./login')
const serveTenderScript = require('./serve-tender')
const {PAGE_RELOAD_DELAY, MAIN_LOOP_DELAY} = require('../constants')
const credentials = require('../credential')
const tenders = require('../tenders')
const { differenceTime, millisecondsToSeconds } = require('../functions')


module.exports = async () => {
  let tenderInServing = null
  let lastTimeOfReload = 0
  const pathToExtension = '~/.config/google-chrome/Default/Extensions/aohghmighlieiainnegkcijnfilokake/0.10_0/main.html'

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/usr/bin/google-chrome',
    // args: [
    //   `--disable-extensions-except=${pathToExtension}`,
    //   `--load-extension=${pathToExtension}`
    // ],
    ignoreDefaultArgs: true,
    defaultViewport: null,
    devtools: true
  });

  const page = await browser.newPage()

  page.setDefaultTimeout(6000)

  await page.goto('***')

  await page.evaluate(loginScript, credentials)


  setInterval(async () => {

    const differenceBetweenReload = differenceTime(new Date, lastTimeOfReload)

    if(differenceBetweenReload > PAGE_RELOAD_DELAY && !tenderInServing) {
      lastTimeOfReload = +new Date()
      await page.reload()
    }

    tenders.forEach(async (tender, index) => {
      const { tenderLink, tenderSecondsBeforeEnd, tenderTimeEnd } = tender

      const millisecondsLeftEnd = differenceTime(tenderTimeEnd, new Date) // difference between time end and time now
      const secondsLeftEnd = millisecondsToSeconds(millisecondsLeftEnd)

      console.log(secondsLeftEnd, tenderSecondsBeforeEnd)

      if (secondsLeftEnd < tenderSecondsBeforeEnd && !tenderInServing) {

        console.log('begin serving', tenderLink)
        tenderInServing = true

        try {

          await page.goto(tenderLink)
          await page.waitFor('.*** .btn');
          await page.click('.*** .btn')

          await page.waitFor(`.***`)

          await page.evaluate(serveTenderScript, tender)

          tenders.splice(index, 1)

        } catch(e) {
          console.log('error', e)
          tenders.splice(index, 1)
        }
        
        tenderInServing = false
        console.log('end serving', tenderLink)

      }

    })

  }, MAIN_LOOP_DELAY)

}