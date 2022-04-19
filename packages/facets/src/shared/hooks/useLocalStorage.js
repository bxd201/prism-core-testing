// @flow
import { useState } from 'react'

export const useLocalStorage = (key: string, dispatch: Function, initialValue: any = [], processingCallback: Function = null) => {
  const [storedData, setStoredData] = useState(() => {
    try {
      const itemsFromlocalStorage = JSON.parse(window.localStorage.getItem(key))
      return itemsFromlocalStorage.length > 0 ? itemsFromlocalStorage : initialValue
    } catch (error) {
      console.log(error, 'error when fetch data from local storage')
      return initialValue
    }
  })

  const setValue = value => {
    try {
      const valueToStore =
          value instanceof Function ? value(storedData) : (processingCallback instanceof Function ? processingCallback(value) : value)
      const item = JSON.parse(window.localStorage.getItem(key))
      const saveData = Array.isArray(item) ? item : []
      saveData.push(JSON.parse(JSON.stringify(valueToStore)))
      window.localStorage.setItem(key, JSON.stringify(saveData))
      const updateLocalStore = JSON.parse(window.localStorage.getItem(key))
      setStoredData(updateLocalStore)
    } catch (error) {
      console.log(error, 'error when save data to local storage')
    }
  }

  if (dispatch instanceof Function) {
    return [storedData, (params) => {
      dispatch(params)
      return setValue
    }]
  }
  return [storedData, setValue]
}
