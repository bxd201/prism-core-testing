// @flow
import ensureFullyQualifiedAssetUrl from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'
import { EMBED_ROOT_SELECTOR_DEPRECATED, EMBED_ROOT_SELECTOR } from './facetSupport/facetConstants'
import dressUpForPrism from './facetSupport/utils/dressUpForPrism'
import embedGlobalStyles from './facetSupport/styles/embedGlobalStyles'
import embedBundleStyles from './facetSupport/styles/embedBundleStyles'
import embedScript from './facetSupport/scripts/embedScript'

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

embedGlobalStyles()
injectRoot()

const dependencies = Promise.all([
  embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.chunkReactName}.js`)),
  embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.chunkNonReactName}.js`)),
  embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.mainEntryPointName}.js`))
])
  .then(() => new Promise((resolve, reject) => {
    const timeout = Date.now() + 10000 // 10s timeout to locate embed method
    const checkForEmbedMethod = () => {
      const method = window.PRISM && window.PRISM.embed
      if (typeof method === 'function') resolve()
      if (Date.now() > timeout) return reject(new Error('Prism embed method not found'))
      setTimeout(checkForEmbedMethod, 100)
    }

    checkForEmbedMethod()
  }))
  .then(() => (window.PRISM = {
    ...(window.PRISM || {}),
    status: 200 // OK
  }))
  .catch(err => {
    console.warn(err)

    window.PRISM = {
      ...(window.PRISM || {}),
      status: 500 // Error
    }

    return Promise.reject(window.PRISM)
  })

window.PRISM = {
  ...(window.PRISM || {}),
  status: 202, // Processing
  ready: dependencies
}

embedBundleStyles(WEBPACK_CONSTANTS.mainEntryPointName)
