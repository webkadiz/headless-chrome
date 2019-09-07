
let time = '2019-09-06T20:55'

module.exports = [
  {
    tenderName: "1",
    tenderLink: '***',
    tenderTimeEnd: time,
    tenderSecondsBeforeEnd: 10,
    tenderMinPrice: 5000,
    tenderStep: 5,
    inWork: true,
    messages: [
      {
        type: 'success',
        message: 'All ok',
        time: '32'
      },
      {
        type: 'error',
        message: 'All bad',
        time: new Date()
      }
    ]
  },
  {
    tenderName: "2",
    tenderLink:
      '***',
    tenderTimeEnd: time,
    tenderSecondsBeforeEnd: 10,
    tenderMinPrice: 50000,
    tenderStep: 5,
    inWork: false,
    messages: []
  },
  {
    tenderName: "3",
    tenderLink: '***',
    tenderTimeEnd: time,
    tenderSecondsBeforeEnd: 10,
    tenderMinPrice: 50000,
    tenderStep: 5,
    inWork: false,
    messages: []
  }
]
