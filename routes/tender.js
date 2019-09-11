const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator')
const {
  validationTenderPost,
  validationTenderDelete,
  validationTenderPut
} = require('../util/validation')
const { TENDER_FIELDS } = require('../data/constants')
const { loggerRoute } = require('../util/logger')
const Tender = require('../models/tender')
const _ = require('lodash')

router
  .route('/')
  .get((req, res) => {
    Tender.find({})
      .then(tenders => {
        res.json({ tenders: tenders.map(tender => _.pick(tender, TENDER_FIELDS)) })
      })
      .catch(err => {
        loggerRoute.error('get error', err)
        res.json({ error: true })
      })
  })
  .post(validationTenderPost, (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      loggerRoute.info('post', errors)
      res.json(errors)
      return
    }

    Tender.create(_.pick(req.body, TENDER_FIELDS))
      .then(tender => {
        res.json({ result: _.pick(tender, TENDER_FIELDS) })
      })
      .catch(err => {
        loggerRoute.error('post', err)
        res.json({ error: true })
      })
  })
  .put(validationTenderPut, (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      loggerRoute.info('put', errors)
      res.json(errors)
      return
    }

    Tender.findOneAndUpdate({ tenderName: req.body.tenderOldName }, _.pick(req.body, TENDER_FIELDS))
      .then(tender => {
        res.json({ result: _.pick(tender, TENDER_FIELDS) })
      })
      .catch(err => {
        loggerRoute.error('put', err)
        res.json({ error: true })
      })
  })

  .delete(validationTenderDelete, (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      loggerRoute.error('delete', errors)
      res.json(errors)
      return
    }

    Tender.deleteOne({ tenderName: req.body.tenderName })
      .then(tender => {
        res.json({ result: _.pick(tender, TENDER_FIELDS) })
      })
      .catch(err => {
        loggerRoute.error('delete', err)
        errors.json({ error: true })
      })
  })

module.exports = router
