// This module host functions designed to help devs be more productive.
// Nothing created in this modules should expose any risk if deployed to prod, that said, please remove all refs to devUtils before deploying to prod
// With great power comes great responsibility! -RS
const DEV = 'development'
const DEV_OPTIONS = 'devOptions'
const getDevOptions = () => JSON.parse(window.localStorage.getItem(DEV_OPTIONS));

(() => {
  const devOptions = getDevOptions()
  if (!devOptions) {
    window.localStorage.setItem(DEV_OPTIONS, '{}')
  }
})()

const LOADING_ANIMATION = 'showLoadingAnimation'
const SHOW_PAINTSCENE = 'showPaintScene'

export const shouldShowLoadingAnimation = () => {
  if (ENV !== DEV) {
    return true
  }
  const devOptions = getDevOptions()

  return !!devOptions[LOADING_ANIMATION]
}

export const setDevOption = (itemName, itemValue) => {
  const devOptions = JSON.parse(window.localStorage.getItem(DEV_OPTIONS))
  devOptions[itemName] = itemValue
  window.localStorage.setItem('devOptions', JSON.stringify(devOptions))
}

export const showLoadingAnimation = () => setDevOption(LOADING_ANIMATION, true)
export const hideLoadingAnimation = () => setDevOption(LOADING_ANIMATION, false)

export const shouldShowPaintScene = () => {
  if (ENV !== DEV) {
    return true
  }

  const devOptions = getDevOptions()

  return !!devOptions[SHOW_PAINTSCENE]
}

export const showPaintScene = () => setDevOption(SHOW_PAINTSCENE, true)
export const hidePaintScene = () => setDevOption(SHOW_PAINTSCENE, false)

if (ENV === DEV) {
  window.devutils = {
    setDevOption,
    showLoadingAnimation,
    hideLoadingAnimation,
    showPaintScene,
    hidePaintScene
  }
}
