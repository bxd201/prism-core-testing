// @flow
import storageAvailable from '../shared/utils/browserStorageCheck.util'

export const reducerWithLocalStorage = (func: Function, propertyName: string) => {
  return (state: any, action: any) => {
    if (state === void (0)) {
      return func(state, action)
    }

    const val = func(state, action)

    if (storageAvailable('localStorage')) {
      window.localStorage.setItem(propertyName, window.JSON.stringify(val))
    }

    return val
  }
}
