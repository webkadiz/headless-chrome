const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator')
const {
  validationTenderPost,
  validationTenderDelete,
  validationTenderPut
} = require('../util/validation')
const tenders = require('../data/tenders')
const { TENDER_FIELDS } = require('../data/constants')
const _ = require('lodash')

router
  .route('/')
  .get((req, res) => {
    res.json({
      tenders
    })
  })
  .post(validationTenderPost, (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json(errors)
      return
    }

    const tender = _.pick(req.body, TENDER_FIELDS)

    tenders.push(tender)

    res.json({
      result: true
    })
  })
  .put(validationTenderPut, (req, res, next) => {
    console.log('put')
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json(errors)
      return
    }

    const reqTender = _.pick(req.body, TENDER_FIELDS)

    const indexOldTender = tenders.findIndex(
      tender => tender.tenderName === req.body.tenderOldName
    )
    const oldTender = tenders.find(
      tender => tender.tenderName === req.body.tenderOldName
    )

    const newTender = Object.assign({}, oldTender, reqTender)
    console.log("TCL: newTender", newTender)

    tenders.splice(indexOldTender, 1, newTender)

    res.json({
      result: {newTender}
    })

    next()
  })

  .delete(validationTenderDelete, (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json(errors)
      return
    }

    const { tenderName } = req.body

    const tenderIndex = tenders.findIndex(
      tender => tender.tenderName === tenderName
    )

    tenders.splice(tenderIndex, 1)

    res.json({
      result: true
    })
  })

module.exports = router
