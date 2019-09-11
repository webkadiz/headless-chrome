/* eslint-disable require-atomic-updates */
const puppeteer = require('puppeteer-core')
const loginScript = require('./login')
const logoutScript = require('./logout')
const serveTenderScript = require('./serve-tender')
const {
  AUTH_ADVANCE,
  PAGE_RELOAD_DELAY,
  PAGE_AUTH_DELAY,
  MAIN_LOOP_DELAY,
  DEVELOPMENT,
  errors: {
    GOTO,
    WAIT_SUBMIT_OFFER,
    CLICK_SUBMIT_OFFER,
    WAIT_POSITIONS,
    EVALUATE_SCRIPT
  }
} = require('../data/constants')
const credentials = require('../data/credential')
const {
  differenceTime,
  millisecondsToSeconds,
  createError,
  createSuccess,
  wait
} = require('../util/functions')
const { loggerMain, loggerTender} = require('../util/logger')
const Tender = require('../models/tender')

module.exports = async (pos, amount) => {
  let isPageBusy = false
  let lastTimeOfReload = 0
  let lastTimeOfAuth = 0
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

  page.setDefaultTimeout(30000)

  setInterval(async () => {
    let tendersSlice = []
    const tenders = await Tender.find()
    const amountPart = Math.floor(tenders.length / amount)

    if (pos === amount) tendersSlice = tenders.slice((pos - 1) * amountPart)
    else tendersSlice = tenders.slice((pos - 1) * amountPart, pos * amountPart)

    const differenceBetweenReload = differenceTime(new Date(), lastTimeOfReload)
    const differenceBetweenAuth = differenceTime(new Date(), lastTimeOfAuth)

    if (differenceBetweenReload > PAGE_RELOAD_DELAY && !isPageBusy) {
      console.log('page reload')
      loggerMain.info('page reload')

      isPageBusy = true

      lastTimeOfReload = +new Date()

      try {
        await page.reload()
        await wait(1000)
      } catch (e) {
        loggerMain.error('page reload failed')
      }

      isPageBusy = false
    }

    if (differenceBetweenAuth > PAGE_AUTH_DELAY && !isPageBusy) {
      let closlyTime = Infinity
      let closlyTender
      isPageBusy = true

      // find closelyTender
      tendersSlice.forEach(tender => {
        if (new Date(tender.tenderTimeEnd) < closlyTime && tender.inWork) {
          closlyTime = +new Date(tender.tenderTimeEnd)
          closlyTender = tender
        }
      })

      if (closlyTender) {
        loggerMain.info('auth start')

        const millisecondsBeforeTenderEnd = differenceTime(
          closlyTender.tenderTimeEnd,
          new Date()
        )
        const secondsBeforeTenderEnd = millisecondsToSeconds(
          millisecondsBeforeTenderEnd
        )

        loggerMain.info(
          secondsBeforeTenderEnd,
          closlyTender.tenderSecondsBeforeEnd + AUTH_ADVANCE,
          'auth'
        )

        if (
          secondsBeforeTenderEnd <
          closlyTender.tenderSecondsBeforeEnd + AUTH_ADVANCE
        ) {
          lastTimeOfAuth = +new Date()

          try {
            await page.evaluate(logoutScript)
            await wait(1000)
          } catch (e) {
            loggerMain.error('auth failed logout')
          }

          loggerMain.info('auth begin login')

          try {
            await page.goto('***')
            await wait(1000)
            await page.evaluate(loginScript, credentials)
            await wait(1000)
          } catch (e) {
            loggerMain.info('auth login failed')
          }

          loggerMain.info('auth end')
        }
      }
    
      isPageBusy = false
    }

    
    tendersSlice.forEach(async tender => {
      const { tenderName } = tender

      const millisecondsBeforeTenderEnd = differenceTime(
        tender.tenderTimeEnd,
        new Date()
      ) // difference between time end and time now
      const secondsBeforeTenderEnd = millisecondsToSeconds(
        millisecondsBeforeTenderEnd
      )

      console.log(
        secondsBeforeTenderEnd,
        tender.tenderSecondsBeforeEnd,
        tenderName
      )
      loggerTender.info({ tender, isPageBusy, secondsBeforeTenderEnd })

      if (
        secondsBeforeTenderEnd < tender.tenderSecondsBeforeEnd &&
        tender.inWork &&
        !isPageBusy
      ) {
        let error
        console.log('begin serving', tenderName)
        loggerMain.info('begin serving', tenderName)
        isPageBusy = true

        try {
          try {
            await page.goto(tender.tenderLink)
          } catch (e) {
            loggerMain.error('goto failed', tenderName)
            error = GOTO
            throw e
          }

          try {

            await page.waitFor('.***')
          } catch (e) {
            loggerMain.error('.***', tenderName)
            error = WAIT_SUBMIT_OFFER
            throw e
          }

          try {
            await page.click('.***')
          } catch (e) {
            loggerMain.error('.***', tenderName)
            error = CLICK_SUBMIT_OFFER
            throw e
          }

          try {
            await page.waitFor(
              `.***`
            )
          } catch (e) {
            loggerMain.error('positions wait failed', tenderName)
            error = WAIT_POSITIONS
            throw e
          }

          try {
            await page.evaluate(serveTenderScript, tender)
          } catch (e) {
            loggerMain.error('positions wait failed', tenderName)
            error = EVALUATE_SCRIPT
            throw e
          }

          console.log('tender success', tenderName)
          loggerMain.info('tender success', tenderName)
          tender.messages.push(createSuccess('Тендер успешно отработан'))
        } catch (e) {
          if (!error) error = 'Тендер отработал с ошибкой'
          console.log('tender error', tenderName)
          loggerMain.error('tender error', tenderName)
          tender.messages.push(createError(error))
        }

        try {
          await Tender.updateOne({ tenderName: tenderName }, { inWork: false, messages: tender.messages })
        } catch(e) {
          loggerMain.error('update tender fail in serving')
        }

        loggerMain.info('end serving', tenderName)
        isPageBusy = false
      }
    })
  }, MAIN_LOOP_DELAY)
}
