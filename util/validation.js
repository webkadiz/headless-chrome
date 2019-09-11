const { body } = require('express-validator')
const { differenceTime } = require('./functions')
const {
  validation: {
    BE_BOOL,
    BE_STRING,
    BE_NOT_EMPTY,
    BE_POSITIVE_INT,
    INVALID_DATE,
    INVALID_LINK,
    BE_POSITIVE_DATE,
    TENDER_EXISTS,
    TENDER_LINK_EXISTS,
    MESSAGES_BE_EMPTY,
    MESSAGE_BE_ARRAY
  }
} = require('../data/constants')
const Tender = require('../models/tender')
const timeRegExp = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d$/

const validationTenderPost = [
  body('tenderName')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY)
    .bail()
    .custom(async value =>
      !(await Tender.exists({ tenderName: value }))
    )
    .withMessage(TENDER_EXISTS),
  body('tenderLink')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY)
    .bail()
    .custom(value => value.startsWith('***'))
    .withMessage(INVALID_LINK)
    .bail()
    .custom(value =>
      Tender.findOne({ tenderLink: value }).then(
        tender => tender && Promise.reject()
      )
    )
    .withMessage(TENDER_LINK_EXISTS),
  body('tenderTimeEnd')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY)
    .bail()
    .custom(value => timeRegExp.test(value))
    .withMessage(INVALID_DATE)
    .bail()
    .custom(value => differenceTime(value, new Date()) > 0)
    .withMessage(BE_POSITIVE_DATE),
  body('tenderSecondsBeforeEnd')
    .isInt({ gt: 0 })
    .withMessage(BE_POSITIVE_INT),
  body('tenderMinPrice')
    .isInt({ gt: 0 })
    .withMessage(BE_POSITIVE_INT),
  body('tenderStep')
    .isInt({ gt: 0 })
    .withMessage(BE_POSITIVE_INT),
  body('inWork')
    .isBoolean()
    .withMessage(BE_BOOL),
  body('messages')
    .isArray()
    .isEmpty()
    .withMessage(MESSAGES_BE_EMPTY)
]

const validationTenderPut = [
  body('tenderOldName')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY)
    .bail()
    .custom(value =>
      Tender.findOne({ tenderName: value }).then(
        tender => !tender && Promise.reject()
      )
    )
    .withMessage('Не найден тендер'),
  body('tenderName')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY)
    .bail()
    .custom((value, { req }) =>
      Tender.findOne({ tenderName: value }).then(
        tender =>
          tender &&
          tender.tenderName !== req.body.tenderOldName &&
          Promise.reject()
      )
    )
    .withMessage(TENDER_EXISTS)
    .optional(),
  body('tenderLink')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY)
    .bail()
    .custom(value => value.startsWith('***'))
    .withMessage(INVALID_LINK)
    .bail()
    .custom((value, { req }) =>
      Tender.findOne({ tenderLink: value }).then(
        tender =>
          tender &&
          tender.tenderName !== req.body.tenderOldName &&
          Promise.reject()
      )
    )
    .withMessage(TENDER_LINK_EXISTS)
    .optional(),
  body('tenderTimeEnd')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY)
    .bail()
    .custom(value => timeRegExp.test(value))
    .withMessage(INVALID_DATE)
    .bail()
    .custom(value => differenceTime(value, new Date()) > 0)
    .withMessage(BE_POSITIVE_DATE)
    .optional(),
  body('tenderSecondsBeforeEnd')
    .isInt({ gt: 0 })
    .withMessage(BE_POSITIVE_INT)
    .optional(),
  body('tenderMinPrice')
    .isInt({ gt: 0 })
    .withMessage(BE_POSITIVE_INT)
    .optional(),
  body('tenderStep')
    .isInt({ gt: 0 })
    .withMessage(BE_POSITIVE_INT)
    .optional(),
  body('inWork')
    .isBoolean()
    .withMessage(BE_BOOL)
    .optional(),
  body('messages')
    .isArray()
    .withMessage(MESSAGE_BE_ARRAY)
    .bail()
    .custom((value, { req }) =>
      Tender.findOne({ tenderName: req.body.tenderOldName }).then(
        tender => value.length > (tender && tender.messages.length) && Promise.reject()
      )
    )
    .optional(),
  body('messages.*.category')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY),
  body('messages.*.message')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY),
  body('messages.*.time')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY)
]

const validationTenderDelete = [
  body('tenderName')
    .isString()
    .withMessage(BE_STRING)
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage(BE_NOT_EMPTY)
    .bail()
    .custom(value =>
      Tender.findOne({ tenderName: value }).then(
        tender => !tender && Promise.reject()
      )
    )
    .withMessage()
]

module.exports = {
  validationTenderPost,
  validationTenderPut,
  validationTenderDelete
}
