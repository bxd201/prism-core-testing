// @flow
import { EMBED_ROOT_SELECTOR_DEPRECATED, EMBED_ROOT_SELECTOR } from 'src/facetSupport/facetConstants'
import addHideStyles from 'src/facetSupport/styles/addHideStyles'
import dressUpForPrism from 'src/facetSupport/utils/dressUpForPrism'
import embedScript from 'src/facetSupport/scripts/embedScript'
import embedStyle from 'src/facetSupport/styles/embedStyle'
import updateGlobalPrismObject from 'src/facetSupport/utils/updateGlobalPrismObject'

const prismManifest = require('embedWorking/prismManifest.json') // eslint-disable-line

function injectRoot () {
  // TODO: deprecate #prism-root in favor of class- or attr-based identifier
  const prismRootLegacy = Array.from(document.querySelectorAll(EMBED_ROOT_SELECTOR_DEPRECATED))
  const prismRootModern = Array.from(document.querySelectorAll(EMBED_ROOT_SELECTOR))
  const allRoots = [
    ...prismRootLegacy,
    ...prismRootModern
  ]

  if (allRoots.length === 0) {
    console.info('Missing PRISM root mounting element. Please add a container with id="prism-root" or [prism-auto-embed] and try again.')
    return
  }

  allRoots.forEach(dressUpForPrism)
}

// eslint-disable-next-line promise/param-names
const prismPromise = new Promise((resolvePrism, rejectPrism) => {
  const embedQueue = new function () {
    let embedRequests = [] // will gather all calls to embed and their props
    let hasExecuted = false
    let embedMethod

    this.add = (...args) => {
      if (hasExecuted) return embedMethod.apply(undefined, args)
      embedRequests.push(args)
      return prismPromise
    }

    this.execute = (method) => {
      if (typeof method !== 'function') {
        throw new Error('Attempting to execute Prism embed queue without valid embed function.')
      }

      embedMethod = method
      hasExecuted = true
      embedRequests.forEach(props => embedMethod.apply(undefined, props))
    }

    return this
  }()

  updateGlobalPrismObject('status', 202)
  updateGlobalPrismObject('embed', embedQueue.add)

  injectRoot()
  addHideStyles()

  let scriptPromises = []
  // loop over CSS and JS and embed it
  prismManifest.forEach(entry => {
    if (entry && entry.dependencies) {
      entry.dependencies.forEach(dep => {
        if (dep.match(/\.css$/)) {
          embedStyle(dep)
        } else if (dep.match(/\.js$/)) {
          scriptPromises.push(embedScript(dep))
        }
      })
    }
  })

  Promise.all(scriptPromises)
    .then(() => new Promise((resolve, reject) => {
      const timeout = Date.now() + 10000 // 10s timeout to locate embed method
      const checkForEmbedMethod = () => {
        const method = window.PRISM && window.PRISM.__embed // look for internal embed method created by bundle.js
        if (typeof method === 'function') resolve()
        if (Date.now() > timeout) return reject(new Error('Prism embed method not found'))
        setTimeout(checkForEmbedMethod, 100)
      }

      checkForEmbedMethod()
    }))
    .then(() => updateGlobalPrismObject('status', 200))
    .then(p => {
      embedQueue.execute(p.__embed)
      resolvePrism(p)
    })
    .catch(err => {
      console.warn(err)
      updateGlobalPrismObject('status', 500)
      rejectPrism(err)
    })
})
