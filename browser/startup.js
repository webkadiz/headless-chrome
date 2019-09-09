const puppeteer = require('puppeteer-core')
const loginScript = require('./login')
const logoutScript = require('./logout')
const serveTenderScript = require('./serve-tender')
const {
  PAGE_RELOAD_DELAY,
  PAGE_AUTH_DELAY,
  MAIN_LOOP_DELAY,
  DEVELOPMENT,
  errors: { GOTO, WAIT_SUBMIT_OFFER, CLICK_SUBMIT_OFFER, WAIT_POSITIONS, EVALUATE_SCRIPT }
} = require('../data/constants')
const credentials = require('../data/credential')
const tenders = require('../data/tenders')
const {
  differenceTime,
  millisecondsToSeconds,
  createError,
  createSuccess
} = require('../util/functions')
const logger = require('../util/logger')

module.exports = async (pos, amount) => {
  let tenderInServing = false
  let lastTimeOfReload = 0
  let lastTimeOfAuth = 0
  let tendersSlice = []
  //const pathToExtension = '~/.config/google-chrome/Default/Extensions/aohghmighlieiainnegkcijnfilokake/0.10_0/main.html'

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: DEVELOPMENT
      ? '/usr/bin/google-chrome'
      : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome',
    //executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome',
    // args: [
    //   `--disable-extensions-except=${pathToExtension}`,
    //   `--load-extension=${pathToExtension}`
    // ],
    ignoreDefaultArgs: true,
    defaultViewport: null
  })

  const page = await browser.newPage()

  page.setDefaultTimeout(20000)

  await page.goto('***')

  await page.evaluate(loginScript, credentials)

  setInterval(async () => {
    const differenceBetweenReload = differenceTime(new Date(), lastTimeOfReload)
    const differenceBetweenAuth = differenceTime(new Date(), lastTimeOfAuth)

    if (differenceBetweenReload > PAGE_RELOAD_DELAY && !tenderInServing) {
      tenderInServing = true

      console.log('page reload')
      lastTimeOfReload = +new Date()
      try {
        await page.reload()
      } catch (e) {
        logger.error('page reload failed')
      }

      tenderInServing = false
      
    }

    if(differenceBetweenAuth > PAGE_AUTH_DELAY && !tenderInServing) {
      let minTime = Infinity
      let curTender = {}
      tenderInServing = true
      

      tenders.forEach(tender => {
        if(new Date(tender.tenderTimeEnd) < minTime) {
          minTime = +new Date(tender.tenderTimeEnd)
          curTender = tender
        }
      })


      console.log('min time', minTime)
      console.log('auth start')
      const timeDif = differenceTime(curTender.tenderTimeEnd, new Date)
      const secondsLeftEnd = millisecondsToSeconds(timeDif)

      if (secondsLeftEnd < curTender.tenderSecondsBeforeEnd + 60) {
        lastTimeOfAuth= +new Date()

        try {
        await page.evaluate(logoutScript)
        
        } catch(e) {
          console.log('failed logout')
        }

        console.log('begin login')
        await page.goto('***')
        await page.waitFor(1000)
        await page.evaluate(loginScript, credentials)

      }

      

      console.log('auth end')
      tenderInServing = false

    }

    const amountPart = Math.floor(tenders.length / amount)

    if (pos === amount) tendersSlice = tenders.slice((pos - 1) * amountPart)
    else tendersSlice = tenders.slice((pos - 1) * amountPart, pos * amountPart)

    tendersSlice.forEach(async tender => {
      const {
        tenderName,
        tenderLink,
        tenderSecondsBeforeEnd,
        tenderTimeEnd,
        inWork
      } = tender

      const millisecondsLeftEnd = differenceTime(tenderTimeEnd, new Date) // difference between time end and time now
      const secondsLeftEnd = millisecondsToSeconds(millisecondsLeftEnd)

      console.log(secondsLeftEnd, tenderSecondsBeforeEnd, tenderName)
      logger.debug({
        secondsLeftEnd,
        tenderSecondsBeforeEnd,
        tenderName,
        inWork,
        tenderInServing
      })

      // if(secondsLeftEnd < tenderSecondsBeforeEnd + 60 && !tenderInServing && !authInServing) {
        
      //   authInServing = true
      //   tenderInServing = true

      //   console.log('begin auth', tenderName)

        

      //   authInServing = false
      //   tenderInServing = false

      //   console.log('end auth', tenderName)
      // }

      if (
        secondsLeftEnd < tenderSecondsBeforeEnd &&
        inWork &&
        !tenderInServing
      ) {
        let error
        console.log('begin serving', tenderName)
        logger.debug('begin serving', tenderName)
        tenderInServing = true

        try {
          try {
            await page.goto(tenderLink)
          } catch (e) {
            logger.error('goto failed', tenderName)
            error = GOTO
            throw e
          }

          try {
            await page.waitFor('.*** .btn')
          } catch (e) {
            logger.error('.*** .btn failed', tenderName)
            error = WAIT_SUBMIT_OFFER
            throw e
          }

          try {
            await page.click('.***')
          } catch (e) {
            logger.error('.***', tenderName)
            error = CLICK_SUBMIT_OFFER
            throw e
          }

          try {
            await page.waitFor(
              `.***`
            )
          } catch (e) {
            logger.error('positions wait failed', tenderName)
            error = WAIT_POSITIONS
            throw e
          }

          try {
            await page.evaluate(serveTenderScript, tender)
          } catch (e) {
            logger.error('positions wait failed', tenderName)
            error = EVALUATE_SCRIPT
            throw e
          }

          console.log('tender success', tenderName)
          logger.debug('tender success', tenderName)

          tender.messages.push(createSuccess('Тендер успешно отработан'))
        } catch (e) {
          if (!error) error = 'Тендер отработал с ошибкой'
          console.log('tender error', tenderName)
          logger.error('tender error', tenderName)
          tender.messages.push(createError(error))
        }

        /* eslint-disable require-atomic-updates */
        tender.inWork = false
        tenderInServing = false
        console.log('end serving', tenderName)
        logger.debug('end serving', tenderName)
      }
    })
  }, MAIN_LOOP_DELAY)
}
