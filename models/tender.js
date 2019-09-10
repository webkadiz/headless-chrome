const mongoose = require('mongoose')

const schema = mongoose.Schema({
  tenderName: String,
  tenderLink: String,
  tenderTimeEnd: String,
  tenderSecondsBeforeEnd: Number,
  tenderMinPrice: Number,
  tenderStep: Number,
  inWork: Boolean,
  messages: [
    {
      type: String,
      message: String,
      time: Date
    }
  ]
})

module.exports = mongoose.model('Tender', schema)