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
embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.chunkAIName}.js`))
embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.chunkFirebaseName}.js`))
embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.chunkImageManipulationName}.js`))
embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.chunkNonReactName}.js`))
embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.chunkReactName}.js`))
injectRoot()
embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.mainEntryPointName}.js`))
embedBundleStyles(WEBPACK_CONSTANTS.mainEntryPointName)
