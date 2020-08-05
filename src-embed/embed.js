// @flow
// import ensureFullyQualifiedAssetUrl from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'
import { EMBED_ROOT_SELECTOR_DEPRECATED, EMBED_ROOT_SELECTOR } from 'src/facetSupport/facetConstants'
import dressUpForPrism from 'src/facetSupport/utils/dressUpForPrism'
import embedScript from 'src/facetSupport/scripts/embedScript'
import embedStyle from 'src/facetSupport/styles/embedStyle'
import addHideStyles from 'src/facetSupport/styles/addHideStyles'

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

addHideStyles()

// loop over CSS and JS and embed it
prismManifest.forEach(entry => {
  if (entry && entry.dependencies) {
    entry.dependencies.forEach(dep => {
      if (dep.match(/\.css$/)) {
        embedStyle(dep)
      } else if (dep.match(/\.js$/)) {
        embedScript(dep)
      }
    })
  }
})

injectRoot()
