
export default [
  {
    name: 'tenderName',
    label: 'Придумайте название тендеру',
    value: '',
    error: ''
  },
  {
    name: 'tenderLink',
    label: 'Адрес страницы торгов',
    value: '',
    error: ''
  },
  {
    name: 'tenderTimeEnd',
    label: 'Время окончания торгов',
    value: '',
    error: '',
    type: 'datetime-local'
  },
  {
    name: 'tenderSecondsBeforeEnd',
    label: 'Количество секунд до окончания торгов, когда системе нужно включиться и начать действовать',
    value: '',
    error: ''
  },
  {
    name: 'tenderMinPrice',
    label: 'Минимальная сумма, меньше которой не предлагать',
    value: '',
    error: ''
  },
  {
    name: 'tenderStep',
    label: 'Шаг в рублях от минимальной цены, которую предложили конкуренты',
    value: '',
    error: ''
  },
  {
    name: 'inWork',
    label: 'Включить тендер',
    value: false,
    error: '',
    type: 'checkbox'
  },
  {
    name: 'messages',
    label: 'Сообщения',
    value: [],
    error: '',
    type: 'hidden'
  }
]