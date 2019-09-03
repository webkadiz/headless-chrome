const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator')
const {
  validationTenderPost,
  validationTenderDelete,
  validationTenderPut
} = require('../validation')
const tenders = require('../tenders')

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

    const {
      tenderName,
      tenderLink,
      tenderTimeEnd,
      tenderSecondsBeforeEnd,
      tenderMinPrice,
      tenderStep
    } = req.body

    tenders.push({
      tenderName,
      tenderLink,
      tenderTimeEnd,
      tenderSecondsBeforeEnd,
      tenderMinPrice,
      tenderStep
    })

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

    const {
      tenderOldName,
      tenderName,
      tenderLink,
      tenderTimeEnd,
      tenderSecondsBeforeEnd,
      tenderMinPrice,
      tenderStep
    } = req.body

    const indexOldTender = tenders.findIndex(
      tender => tender.tenderName === tenderOldName
    )

    tenders.splice(indexOldTender, 1, {
      tenderName,
      tenderLink,
      tenderTimeEnd,
      tenderSecondsBeforeEnd,
      tenderMinPrice,
      tenderStep
    })

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
