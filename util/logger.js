const log4js = require('log4js')

log4js.configure({
  appenders: {
    app: {
      type: 'file',
      filename: 'log/app.log',
      maxLogSize: 1024 * 1000,
      backups: 25,
      keepFileExt: true
    }
  },
  categories: {
    default: { appenders: ['app'], level: 'debug' }
  }
})

const logger = log4js.getLogger()

module.exports = logger
