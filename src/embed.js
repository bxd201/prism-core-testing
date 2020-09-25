// @flow
import ensureFullyQualifiedAssetUrl from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'
import { EMBED_ROOT_SELECTOR_DEPRECATED, EMBED_ROOT_SELECTOR } from './facetSupport/facetConstants'
import dressUpForPrism from './facetSupport/utils/dressUpForPrism'
import embedGlobalStyles from './facetSupport/styles/embedGlobalStyles'
import embedBundleStyles from './facetSupport/styles/embedBundleStyles'
import embedScript from './facetSupport/scripts/embedScript'
import updateGlobalPrismObject from './facetSupport/utils/updateGlobalPrismObject'

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

  embedGlobalStyles()
  injectRoot()

  Promise.all([
    embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.chunkReactName}.js`)),
    embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.chunkNonReactName}.js`)),
    embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.mainEntryPointName}.js`))
  ])
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

  embedBundleStyles(WEBPACK_CONSTANTS.mainEntryPointName)
})
