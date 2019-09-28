module.exports = async tenderStep => {

  function positionsLoop() {
    let i = 0
    const positions = document.querySelectorAll('.panel')

    return function innerRecursion(res, rej) {
      try {
        const position = positions[i]
        const heading = position.querySelector('.panel-heading')

        heading.click()

        const priceForUnit = position.querySelector('#Price')
        const savePositionsBtn = position.querySelector(
          `button[ng-click="positionSave('offerDoc')"]`
        )
        
        priceForUnit.value -= tenderStep
        priceForUnit.dispatchEvent(new InputEvent('input'))

        savePositionsBtn.click()

        i++
        if (i < positions.length) {
          setTimeout(innerRecursion.bind(null, res, rej), 1000)
        } else {
          res()
        }
      } catch (e) {
        rej(e)
      }
    }
  }

  await new Promise(positionsLoop())
}
