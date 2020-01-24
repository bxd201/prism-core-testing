// @flow
import { ensureFullyQualifiedAssetUrl } from './shared/helpers/DataUtils'
import { EMBED_ROOT_SELECTOR_DEPRECATED, EMBED_ROOT_SELECTOR } from './facetSupport/facetConstants'
import { dressUpForPrism } from './facetSupport/facetUtils'

function loadBundle () {
  const bundleTag = document.createElement('script')
  // NOTE: adding APP_VERSION in here will allow us to have a very old cache for bundle.js
  // BUT, that only works if we're able to instate rather light caching on embed.js. Since this file will be quite small, we'll
  // be able to load it anew much more often but still keep the bulk of the download protected by cache.
  const bundlePath = ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.mainEntryPointName}.js?v=${APP_VERSION}`)
  bundleTag.src = bundlePath // eslint-disable-line no-undef
  // $FlowIgnore -- flow doesn't think body is defined
  document.body.appendChild(bundleTag)
}

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

injectRoot()
loadBundle()
