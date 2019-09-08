const puppeteer = require('puppeteer-core')

const loginScript = require('./login')
const serveTenderScript = require('./serve-tender')
const {PAGE_RELOAD_DELAY, MAIN_LOOP_DELAY} = require('../data/constants')
const credentials = require('../data/credential')
const tenders = require('../data/tenders')
const { differenceTime, millisecondsToSeconds, createError, createSuccess } = require('../util/functions')
const logger = require('../util/logger')


module.exports = async (pos, amount) => {
  let tenderInServing = false
  let lastTimeOfReload = 0
  let tendersSlice = []
  const pathToExtension = '~/.config/google-chrome/Default/Extensions/aohghmighlieiainnegkcijnfilokake/0.10_0/main.html'

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    //executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome',
    // args: [
    //   `--disable-extensions-except=${pathToExtension}`,
    //   `--load-extension=${pathToExtension}`
    // ],
    ignoreDefaultArgs: true,
    defaultViewport: null
  });

  const page = await browser.newPage()

  page.setDefaultTimeout(20000)

  await page.goto('***')

  await page.evaluate(loginScript, credentials)

  setInterval(async () => {

    const differenceBetweenReload = differenceTime(new Date, lastTimeOfReload)
    
    if(differenceBetweenReload > PAGE_RELOAD_DELAY && !tenderInServing) {
      lastTimeOfReload = +new Date()
      await page.reload()
    }

    const amountPart = Math.floor(tenders.length / amount)

    if(pos === amount)
      tendersSlice = tenders.slice((pos - 1) * amountPart)
    else
      tendersSlice = tenders.slice((pos - 1) * amountPart, pos * amountPart)


    tendersSlice.forEach(async tender => {
      const { tenderName, tenderLink, tenderSecondsBeforeEnd, tenderTimeEnd, inWork } = tender

      const millisecondsLeftEnd = differenceTime(tenderTimeEnd, new Date) // difference between time end and time now
      const secondsLeftEnd = millisecondsToSeconds(millisecondsLeftEnd)

      console.log(secondsLeftEnd, tenderSecondsBeforeEnd, tenderName)
      logger.debug({secondsLeftEnd, tenderSecondsBeforeEnd, tenderName, inWork, tenderInServing})

      if (secondsLeftEnd < tenderSecondsBeforeEnd && inWork && !tenderInServing) {

        console.log('begin serving', tenderName)
        logger.debug('begin serving', tenderName)
        tenderInServing = true
        
        try {

          await page.goto(tenderLink)
          await page.waitFor('.*** .btn');
          await page.click('.*** .btn')

          await page.waitFor(`.***`)
          console.log('after wait for', tenderName)
          logger.debug('after wait for', tenderName)
          await page.evaluate(serveTenderScript, tender)
          console.log('after evaluate', tenderName)
          logger.debug('after evaluate', tenderName)

          tender.messages.push(createSuccess('Тендер успешно отработан'))
        } catch(e) {
          tender.messages.push(createError('Тендер отработал с ошибкой'))
          console.log('error', e)
        }
        
        tender.inWork = false
        tenderInServing = false
        console.log('end serving', tenderName)
        logger.debug('end serving', tenderName)

      }

    })

  }, MAIN_LOOP_DELAY)

}