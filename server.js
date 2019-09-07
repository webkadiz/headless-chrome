const express = require('express')
const app = express()
const tenderRoute = require('./routes/tender')
const { AMOUNT_BROWSERS } = require('./constants')


app.use(express.json())
app.use(express.static('public'))
app.engine('html', require('pug').renderFile)
app.set('view engine', 'html')

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

app.use('/tender', tenderRoute)

app.get('*', (req, res) => {
  console.log('*')
  res.render('index')
})


app.listen(8000, () => {
  console.log('server listening')
});


for(let i = 1; i <= AMOUNT_BROWSERS; i++) {
  require('./browser/startup')(i, AMOUNT_BROWSERS)
}








