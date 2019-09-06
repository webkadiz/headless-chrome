function differenceTime(time1, time2) {
  let dateOfTime1 = time1, dateOfTime2 = time2

  if(typeof time1 === 'string' || typeof time1 === 'number') {
    dateOfTime1 = new Date(time1)
  }

  if(typeof time1 === 'string' || typeof time2 === 'number') {
    dateOfTime2 = new Date(time2)
  }

  if(!(dateOfTime1 instanceof Date && dateOfTime2 instanceof Date)) return false

  return dateOfTime1 - dateOfTime2
}

function millisecondsToSeconds(milliseconds) {
  return milliseconds / 1000
}

module.exports = {differenceTime, millisecondsToSeconds}