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
    GOTO: 'Не удалось перейти по ссылке',
    WAIT_SUBMIT_OFFER: 'Не удалось найти кнопку "Подать оферту"',
    CLICK_SUBMIT_OFFER: 'Не удалось кликнуть по кнопке "Подать оферту"',
    WAIT_POSITIONS: 'Не удалось дождаться загрузки позиций',
    EVALUATE_SCRIPT: 'Ошибка выполнения скрипта на странице'
  },
  PAGE_RELOAD_DELAY: 1000 * 60 * 15,
  MAIN_LOOP_DELAY: 1000,
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
  DEVELOPMENT: process.env.NODE_ENV === 'dev'
}
