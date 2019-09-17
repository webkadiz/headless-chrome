module.exports = () => {
  const areement = document.querySelector('#personalDataAgreement')
  const saveBtn = document.querySelector(`button[ng-click="saveOffer('offerSave')"]`)

  areement.checked = true
  areement.dispatchEvent(new InputEvent('click'))

  saveBtn.click()
}