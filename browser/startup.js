/* eslint-disable require-atomic-updates */
const puppeteer = require('puppeteer-core')
const loginScript = require('./login')
const logoutScript = require('./logout')
const servePositionsScript = require('./serve-positions')
const saveOffer = require('./save-offer')
const {
  AUTH_ADVANCE,
  PAGE_RELOAD_DELAY,
  PAGE_AUTH_DELAY,
  MAIN_LOOP_DELAY,
  DEVELOPMENT,
  errors: {
    UNKNOWN_ERROR,
    GOTO,
    WAIT_SUBMIT_OFFER,
    CLICK_SUBMIT_OFFER,
    WAIT_POSITIONS,
    SCRIPT_SERVE_POSITIONS,
    GET_SUM,
    SCRIPT_SAVE_OFFER,
    WAIT_SAVE_OFFER_ALERT
  },
  success: { TENDER_SUCCESS_ALL, TENDER_SUCCESS_PRICE }
} = require('../data/constants')
const credentials = require('../data/credential')
const {
  differenceTime,
  millisecondsToSeconds,
  createError,
  createSuccess
} = require('../util/functions')
const { loggerMain, loggerTender } = require('../util/logger')
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

    // if (differenceBetweenReload > PAGE_RELOAD_DELAY && !isPageBusy) {
    //   isPageBusy = true
    //   lastTimeOfReload = +new Date()

    //   try {
    //     loggerMain.info('page reload start', pos)
    //     await page.reload()
    //     await wait(500)
    //   } catch (e) {
    //     loggerMain.error('page reload failed', pos)
    //   }

    //   isPageBusy = false
    // }

    if (differenceBetweenAuth > PAGE_AUTH_DELAY && !isPageBusy) {

      let closlyTime = Infinity
      let closlyTender
      isPageBusy = true

      // find closelyTender
      tenders.forEach(tender => {
        if (new Date(tender.tenderTimeEnd) < closlyTime && tender.inWork) {
          closlyTime = +new Date(tender.tenderTimeEnd)
          closlyTender = tender
        }
      })

      if (closlyTender) {
        const millisecondsBeforeTenderEnd = differenceTime(
          closlyTender.tenderTimeEnd,
          new Date()
        )
        const secondsBeforeTenderEnd = millisecondsToSeconds(
          millisecondsBeforeTenderEnd
        )

        if (
          secondsBeforeTenderEnd <
          closlyTender.tenderSecondsBeforeEnd + AUTH_ADVANCE
        ) {
          loggerMain.info('auth start', pos)
          lastTimeOfAuth = +new Date()

          try {
            console.log('logout')
            loggerMain.info('auth logout start', pos)
            await page.evaluate(logoutScript)
          } catch (e) {
            loggerMain.error('auth logout failed', pos)
          }

          try {
            loggerMain.info('auth login start', pos)
            await page.goto('***', {
              waitUntil: 'networkidle2'
            })


            await page.evaluate(loginScript, credentials)
            await page.waitFor('.table')

            await page.goto('***', {
              waitUntil: 'networkidle2'
            })
          } catch (e) {
            loggerMain.error('auth login failed', pos)
          }


          loggerMain.info('auth end', pos)

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
        let error = UNKNOWN_ERROR
        let success = TENDER_SUCCESS_ALL
        loggerMain.info('begin serving', tenderName)
        isPageBusy = true

        try {

          error = GOTO
          await page.goto(tender.tenderLink, { waitUntil: 'networkidle2' })

          error = WAIT_SUBMIT_OFFER
          await page.waitFor('.*** .btn')

          error = CLICK_SUBMIT_OFFER
          await page.click('.*** .btn')

          error = WAIT_POSITIONS
          await Promise.all([
            page.waitFor(
              `***`
            ),
            page.waitFor(
              () =>
                document.querySelector('#***') &&
                document.querySelector('#***').value
            ),
            page.waitFor(
              () =>
                document.querySelector('#***') &&
                document.querySelector('#***').value
            ),
            page.waitFor(
              () =>
                document.querySelector('#***') &&
                document.querySelector('#***').value
            )
          ])

          error = SCRIPT_SERVE_POSITIONS
          await page.evaluate(servePositionsScript, tender.tenderStep)

          error = GET_SUM
          const sum = await page.$eval('#Summa', el => el.value)

          if (sum >= tender.tenderMinPrice) {
            error = SCRIPT_SAVE_OFFER
            await page.evaluate(saveOffer)

            error = WAIT_SAVE_OFFER_ALERT
            await page.waitFor(`[ng-if="alertId == 'offerSave'"]`)
          } else {
            success = TENDER_SUCCESS_PRICE
          }

          loggerMain.info(success, 'tender success', tenderName, pos)
          tender.messages.push(createSuccess(success))
        } catch (e) {
          loggerMain.error(error, e, tenderName, pos)
          tender.messages.push(createError(error))
        }

        try {
          await Tender.updateOne(
            { tenderName },
            { inWork: false, messages: tender.messages }
          )
        } catch (e) {
          loggerMain.error('tender update in mongo fail')
        }

        loggerMain.info('end serving', tenderName)
        isPageBusy = false
      }
    })
  }, MAIN_LOOP_DELAY)
}
