// @flow
import camelCase from 'lodash/camelCase'
import appendToBodyUtil from 'src/shared/utils/appendToBody.util'

const promises = {}

export default (path: string) => {
  const id = camelCase(path)

  if (promises[id]) return promises[id]

  const promise = new Promise((resolve, reject) => {
    let script = document.createElement('script')

    script.async = true
    script.defer = true

    function onloadHander (_, isAbort) {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
        script.onload = null
        script.onreadystatechange = null
        script = undefined

        if (isAbort) { reject(new Error(`Unable to load ${path} or aborting`)) } else { resolve(path) }
      }
    }

    script.onload = onloadHander
    script.onreadystatechange = onloadHander

    script.src = `${path}?v=${APP_VERSION}`
    appendToBodyUtil(script)
  })

  promises[id] = promise

  return promise
}
