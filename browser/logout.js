module.exports = async () => {
  Node.prototype.q = function(selector) {
    return this.querySelector(selector)
  }

  Node.prototype.qAll = function(selector) {
    return this.querySelectorAll(selector)
  }

  console.log('begin')
  const logoutBtn = document.q('a[ng-click="exit();"]')
  logoutBtn.click()

  await new Promise((res, rej) => {
    setTimeout(() => res(), 2000)
  })

}