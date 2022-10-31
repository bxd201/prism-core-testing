const GLOBAL_NAME = 'PRISM'

export function getGlobalPrismObject() {
  if (window && window[GLOBAL_NAME]) {
    return window[GLOBAL_NAME]
  }

  return null
}

export function getFromGlobalPrismObject(prop) {
  return getGlobalPrismObject()?.[prop]
}

export function updateGlobalPrismObject(propName, value) {
  let prismObj = getGlobalPrismObject()
  if (prismObj) {
    prismObj[propName] = value
  } else {
    window[GLOBAL_NAME] = {
      [propName]: value
    }
  }

  return getGlobalPrismObject()
}
