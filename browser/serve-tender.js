module.exports = async ({ tenderMinPrice, tenderStep }) => {
  Node.prototype.q = function(selector) {
    return this.querySelector(selector)
  }

  Node.prototype.qAll = function(selector) {
    return this.querySelectorAll(selector)
  }

  async function wait(f, ms) {
    if (typeof f === 'number') {
      ms = f
      f = () => {}
    }

    return new Promise(res => {
      setTimeout(() => {
        f()
        res()
      }, ms)
    })
  }

  function positionsLoop() {
    let i = 0
    const positions = document.qAll('.panel')

    return function innerRecursion(res, rej) {
      try {
        const position = positions[i]
        const heading = position.q('.***')

        heading.click()

        const priceForUnit = position.q('#***')
        const savePositionsBtn = position.q(
          `***`
        )

        priceForUnit.value -= tenderStep
        priceForUnit.dispatchEvent(new InputEvent('input'))

        savePositionsBtn.click()

        i++
        if (i < positions.length) {
          setTimeout(innerRecursion.bind(null, res, rej), 500)
        } else {
          res()
        }
      } catch (e) {
        rej(e)
      }
    }
  }

  try {
    await new Promise(positionsLoop())
  } catch (e) {
    return {
      error: 'Была ошибка в обработке позиций'
    }
  }

  const sum = +document.q('#***').value
  const areement = document.q('#***')
  const saveBtn = document.q(`***`)

  if (sum < tenderMinPrice)
    return {
      success: 'Цена тендера оказалась меньше минимальной'
    }

  areement.checked = true
  areement.dispatchEvent(new InputEvent('click'))

  try {
    await wait(() => saveBtn.click(), 100)
  } catch (e) {
    return {
      error: 'Не удалось нажать на "сохранить позиции"'
    }
  }

  try {
    await wait(100)
  } catch (e) {
    return {
      error: 'Ошибка приложения'
    }
  }

  return { success: 'Тендер успешно отработал' }
}
