// @flow
import camelCase from 'lodash/camelCase'
import uniq from 'lodash/uniq'
import appendToBodyUtil from 'src/shared/utils/appendToBody.util'
import ensureFullyQualifiedAssetUrl from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'
import { getFromGlobalPrismObject, updateGlobalPrismObject } from '../utils/globalPrismObject'

const promises = {}
const SCRIPT_PROMISES_KEY_NAME = '__assetPromises'
updateGlobalPrismObject(SCRIPT_PROMISES_KEY_NAME, getFromGlobalPrismObject(SCRIPT_PROMISES_KEY_NAME) ?? { current: [] })

export default (path: string, consumer: string = '') => {
  const id = camelCase(path)
  const promiseResults = getFromGlobalPrismObject(SCRIPT_PROMISES_KEY_NAME)
  const existingPromise = promiseResults.current.reduce((accum, v) => accum ?? v.id === id ? v : accum, null)

  if (existingPromise) {
    promiseResults.current = promiseResults.current.map(v => {
      if (v.id === id) {
        return {
          ...v,
          consumers: uniq([ ...v.consumers, consumer ])
        }
      }
      return v
    })
    return existingPromise.promise
  }

  const promise = new Promise((resolve, reject) => {
    let script = document.createElement('script')

    script.async = true
    script.defer = false

    function onloadHandler (_, isAbort) {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
        script.onload = null
        script.onreadystatechange = null
        script = undefined

        if (isAbort) {
          promiseResults.current = promiseResults.current.map(v => {
            if (v.id === id) {
              return {
                ...v,
                status: 'failed'
              }
            }
            return v
          })
          reject(new Error(`Unable to load ${path} or aborting`))
        } else {
          promiseResults.current = promiseResults.current.map(v => {
            if (v.id === id) {
              return {
                ...v,
                status: 'resolved'
              }
            }
            return v
          })
          resolve(path)
        }
      }
    }

    script.onload = onloadHandler
    script.onreadystatechange = onloadHandler

    appendToBodyUtil(script)
    script.src = ensureFullyQualifiedAssetUrl(path)
  })

  promiseResults.current.push({
    consumers: [consumer],
    id,
    promise,
    status: 'pending'
  })

  return promise
}

