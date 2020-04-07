// @flow
import { ensureFullyQualifiedAssetUrl } from './shared/helpers/DataUtils'
import { EMBED_ROOT_SELECTOR_DEPRECATED, EMBED_ROOT_SELECTOR } from './facetSupport/facetConstants'
import { dressUpForPrism } from './facetSupport/facetUtils'
import { embedGlobalStyles, embedBundleStyles } from './facetSupport/facetStyles'
import { embedScript } from './facetSupport/facetScripts'

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
embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.vendorAssetsName}.js`))
injectRoot()
embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.mainEntryPointName}.js`))
embedBundleStyles(WEBPACK_CONSTANTS.mainEntryPointName)
