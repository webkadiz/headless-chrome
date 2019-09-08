const log4js = require('log4js')

log4js.configure({
  appenders: {
    app: { type: 'file', filename: 'log/app.log', maxLogSize: 1024 * 100, backups: 5, keepFileExt: true }
  },
  categories: {
    default: { appenders: [ 'app' ], level: 'debug',  }
  }
});

const logger = log4js.getLogger()

module.exports = logger