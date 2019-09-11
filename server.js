const express = require('express')
const tenderRoute = require('./routes/tender')
const {
  AMOUNT_BROWSERS,
  DEVELOPMENT,
  MONGOOSE_CONNECTION_URL
} = require('./data/constants')
const mongoose = require('mongoose')
const app = express()

mongoose
  .connect(MONGOOSE_CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch(() => process.exit(1))

app.use(express.json())
app.use(express.static('public'))
app.engine('html', require('pug').renderFile)
app.set('view engine', 'html')

if (DEVELOPMENT) {
  app.use(function(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*')
    next()
  })

  app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'POST, DELETE, PUT')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.send()
  })
}

app.use('/tender', tenderRoute)

app.get('*', (req, res) => {
  console.log('*')
  res.render('index')
})

app.listen(8000, DEVELOPMENT ? '' : 'localhost', () => {
  console.log('server listening')
})

for (let i = 1; i <= AMOUNT_BROWSERS; i++) {
  require('./browser/startup')(i, AMOUNT_BROWSERS)
}
