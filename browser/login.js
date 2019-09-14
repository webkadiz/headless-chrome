module.exports = ({LOGIN, PASS}) => {
  Node.prototype.q = function(selector) {
    return this.querySelector(selector)
  }

  Node.prototype.qAll = function(selector) {
    return this.querySelectorAll(selector)
  }

  const loginForm = document.qAll('#***')[1]
  const loginEl = loginForm.q('#login')
  const passEl = loginForm.q('#pass')
  const submitBtn = loginForm.q('.***')

  loginEl.value = LOGIN
  passEl.value = PASS

  loginEl.dispatchEvent(new InputEvent('input'))
  passEl.dispatchEvent(new InputEvent('input'))

  submitBtn.click()
}
