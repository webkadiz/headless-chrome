module.exports = {
  validation: {
    BE_BOOL: 'Поле должно быть true или false',
    BE_STRING: 'Поле должно быть строкой',
    BE_NOT_EMPTY: 'Поле не должно быть пустым',
    BE_POSITIVE_INT: 'Поле должно быть положительным числом',
    INVALID_DATE: 'Дата не соответствует формату YYYY-MM-DDTHH:MM',
    INVALID_LINK: 'Ссылка должна начинаться с ***',
    BE_POSITIVE_DATE: 'Дата должна иметь будущее значение',
    TENDER_EXISTS: 'Такой тендер уже существует',
    TENDER_LINK_EXISTS: 'Тендер с такой ссылкой уже существует',
    MESSAGES_BE_EMPTY: 'Массив сообщений должен быть пустым',
    MESSAGE_BE_ARRAY: 'Сообщения должны быть массивом'
  },
  errors: {
    UNKNOWN_ERROR: 'Тендер отработал с неизвестной ошибкой',
    GOTO: 'Не удалось перейти по ссылке',
    WAIT_SUBMIT_OFFER: 'Не удалось найти кнопку "Подать оферту"',
    CLICK_SUBMIT_OFFER: 'Не удалось кликнуть по кнопке "Подать оферту"',
    WAIT_POSITIONS: 'Не удалось дождаться загрузки позиций',
    SCRIPT_SERVE_POSITIONS: 'Ошибка в скрипте обработки позиций',
    GET_SUM: "Не удалось получить суммы всех позиций",
    SCRIPT_SAVE_OFFER: 'Ошибка в скрипте сохранения тендера',
    WAIT_SAVE_OFFER_ALERT: 'Не удалось дождаться сообщения сохранения заявки'
  },
  success: {
    TENDER_SUCCESS_ALL: 'Тендер успешно отработал',
    TENDER_SUCCESS_PRICE: 'Цена тендера оказалась меньше минимальной'
  },
  AUTH_ADVANCE: 60, // 1 minute
  PAGE_RELOAD_DELAY: 1000 * 60 * 20, // 20 minute
  PAGE_AUTH_DELAY: 1000 * 60 * 5, // 20 minute
  MAIN_LOOP_DELAY: 1000, // 1 second
  TENDER_FIELDS: [
    'tenderName',
    'tenderLink',
    'tenderTimeEnd',
    'tenderSecondsBeforeEnd',
    'tenderMinPrice',
    'tenderStep',
    'inWork',
    'messages'
  ],
  AMOUNT_BROWSERS: process.env.NODE_ENV === 'dev' ? 1 : 3,
  DEVELOPMENT: process.env.NODE_ENV === 'dev',
  MONGOOSE_CONNECTION_URL: 'mongodb://localhost/tender'
}
