// This module host functions designed to help devs be more productive.
// Nothing created in this modules should expose any risk if deployed to prod, that said, please remove all refs to devUtils before deploying to prod
// With great power comes great responsibility! -RS
const DEV = 'development'
const DEV_OPTIONS = 'devOptions';

(() => {
  const devOptions = window.localStorage.getItem(DEV_OPTIONS)
  if (!devOptions) {
    window.localStorage.setItem(DEV_OPTIONS, '{}')
  }
})()

const LOADING_ANIMATION = 'showLoadingAnimation'

export const shouldShowLoadingAnimation = () => {
  if (ENV !== DEV) {
    return true
  }
  const devOptions = JSON.parse(window.localStorage.getItem(DEV_OPTIONS))

  return !!devOptions[LOADING_ANIMATION]
}

export const setDevOption = (itemName, itemValue) => {
  const devOptions = JSON.parse(window.localStorage.getItem(DEV_OPTIONS))
  devOptions[itemName] = itemValue
  window.localStorage.setItem('devOptions', JSON.stringify(devOptions))
}

export const hideLoadingAnimation = () => setDevOption(LOADING_ANIMATION, false)

export const showLoadingAnimation = () => setDevOption(LOADING_ANIMATION, true)

if (ENV === DEV) {
  window.devutils = {
    setDevOption,
    hideLoadingAnimation,
    showLoadingAnimation
  }
}
