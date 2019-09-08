const log4js = require('log4js')

log4js.configure({
  appenders: {
    app: { type: 'file', filename: 'log/app.log' }
  },
  categories: {
    default: { appenders: [ 'app' ], level: 'debug' }
  }
});

const logger = log4js.getLogger()

module.exports = logger