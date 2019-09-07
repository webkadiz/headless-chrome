const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator')
const {
  validationTenderPost,
  validationTenderDelete,
  validationTenderPut
} = require('../validation')
const tenders = require('../tenders')
const { TENDER_FIELDS } = require('../constants')
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

    const tender = _.pick(req.body, TENDER_FIELDS)

    const indexOldTender = tenders.findIndex(
      tender => tender.tenderName === req.body.tenderOldName
    )

    tenders.splice(indexOldTender, 1, tender)

    res.json({
      result: true
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
