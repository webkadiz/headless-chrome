const log4js = require('log4js')
const type = 'file'
const maxLogSize = 1024 * 10000
const backups = 25
const keepFileExt = true
const level = 'debug'

const appendersConfig = {type, maxLogSize, backups, keepFileExt}

log4js.configure({
  appenders: {
    default: {
      filename: 'log/default.log',
      ...appendersConfig
    },
    main: {
      filename: 'log/main.log',
      ...appendersConfig
    },
    tender: {
      filename: 'log/tender.log',
      ...appendersConfig
    },
    route: {
      filename: 'log/route.log',
      ...appendersConfig
    },
    error: {
      filename: 'log/error.log',
      ...appendersConfig
    }
  },
  categories: {
    default: { appenders: ['default'], level },
    main: { appenders: ['main'], level },
    tender: { appenders: ['tender'], level },
    route: { appenders: ['route'], level },
    error: { appenders: ['error'], level }
  }
})

const loggerMain = log4js.getLogger('main')
const loggerTender = log4js.getLogger('tender')
const loggerRoute = log4js.getLogger('route')
const loggerError = log4js.getLogger('error')

module.exports = { loggerMain, loggerTender, loggerRoute, loggerError }
