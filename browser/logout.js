module.exports = async () => {
  Node.prototype.q = function(selector) {
    return this.querySelector(selector)
  }

  Node.prototype.qAll = function(selector) {
    return this.querySelectorAll(selector)
  }

  const logoutBtn = document.q('a[ng-click="exit();"]')
  logoutBtn.click()
}