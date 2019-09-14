const log4js = require('log4js')
const type = 'file'
const maxLogSize = 1024 * 10000
const backups = 25
const keepFileExt = true
const level = 'debug'

const appendersConfig = { type, maxLogSize, backups, keepFileExt }

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
    }
  },
  categories: {
    default: { appenders: ['default'], level },
    main: { appenders: ['main'], level },
    tender: { appenders: ['tender'], level },
    route: { appenders: ['route'], level }
  }
})

const loggerMain = log4js.getLogger('main')
const loggerTender = log4js.getLogger('tender')
const loggerRoute = log4js.getLogger('route')

module.exports = { loggerMain, loggerTender, loggerRoute }
