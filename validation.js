const { body } = require('express-validator')
const tenders = require('./tenders')
const { differenceTime } = require('./functions')
const {
  validation: {
    BE_STRING,
    BE_NOT_EMPTY,
    BE_POSITIVE_INT,
    INVALID_DATE,
    INVALID_LINK,
    BE_POSITIVE_DATE,
    TENDER_EXISTS,
    TENDER_LINK_EXISTS
  }
} = require('./constants')
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
    .custom(value => !tenders.find(tender => tender.tenderName === value))
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
    .custom(value => !tenders.find(tender => tender.tenderLink === value))
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
    .withMessage(BE_POSITIVE_INT)
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
    .custom(value => tenders.find(tender => tender.tenderName === value))
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
    .custom(
      (value, { req }) =>
        !tenders.find(tender => tender.tenderName === value) ||
        tenders.find(tender => tender.tenderName === value).tenderName ===
          req.body.tenderOldName
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
    .custom(
      (value, { req }) =>
        !tenders.find(tender => tender.tenderLink === value) ||
        tenders.find(tender => tender.tenderLink === value).tenderName ===
          req.body.tenderOldName
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
    .withMessage(BE_POSITIVE_INT)
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
    .custom(value => tenders.find(tender => tender.tenderName === value))
    .withMessage()
]

module.exports = {
  validationTenderPost,
  validationTenderPut,
  validationTenderDelete
}
