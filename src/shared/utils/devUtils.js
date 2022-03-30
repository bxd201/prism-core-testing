// This module host functions designed to help devs be more productive.
// Nothing created in this modules should expose any risk if deployed to prod, that said, please remove all refs to devUtils before deploying to prod
// With great power comes great responsibility! -RS
const DEV = 'development'
const DEV_OPTIONS = 'devOptions'
export const DEV_OPTIONS_ENUM = {
  MOCK_APIS: 'mockApis',
  LOADING_ANIMATION: 'showLoadingAnimation',
  SHOW_PAINTSCENE: 'showPaintScene'
}
const getDevOptions = () => JSON.parse(window.localStorage.getItem(DEV_OPTIONS));

(() => {
  const devOptions = getDevOptions()
  if (!devOptions) {
    window.localStorage.setItem(DEV_OPTIONS, '{}')
  }
})()

export const shouldShowLoadingAnimation = () => {
  if (ENV !== DEV) {
    return true
  }
  const devOptions = getDevOptions()

  return !!devOptions[DEV_OPTIONS_ENUM.LOADING_ANIMATION]
}

export const setDevOption = (itemName, itemValue) => {
  const devOptions = getDevOptions()
  devOptions[itemName] = itemValue
  window.localStorage.setItem('devOptions', JSON.stringify(devOptions))
}

export const showLoadingAnimation = () => setDevOption(DEV_OPTIONS_ENUM.LOADING_ANIMATION, true)
export const hideLoadingAnimation = () => setDevOption(DEV_OPTIONS_ENUM.LOADING_ANIMATION, false)

export const shouldShowPaintScene = () => {
  if (ENV !== DEV) {
    return true
  }

  const devOptions = getDevOptions()

  return !!devOptions[DEV_OPTIONS_ENUM.SHOW_PAINTSCENE]
}

export const showPaintScene = () => setDevOption(DEV_OPTIONS_ENUM.SHOW_PAINTSCENE, true)
export const hidePaintScene = () => setDevOption(DEV_OPTIONS_ENUM.SHOW_PAINTSCENE, false)
export const getDevOption = (optName) => {
  if (!optName) {
    console.error('No dev options name specified.')
    return
  }

  const devOpts = getDevOptions() || {}

  return devOpts[optName]
}

export const shouldUseMocks = () => {
  if (ENV !== DEV) {
    return false
  }

  return !!getDevOptions()[DEV_OPTIONS_ENUM.MOCK_APIS]
}

if (ENV === DEV) {
  window.devutils = {
    setDevOption,
    getDevOption,
    showLoadingAnimation,
    hideLoadingAnimation,
    showPaintScene,
    hidePaintScene,
    DEV_OPTIONS_ENUM
  }
}
