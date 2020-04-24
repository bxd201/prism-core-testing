// @flow
import camelCase from 'lodash/camelCase'
import kebabCase from 'lodash/kebabCase'
import { ensureFullyQualifiedAssetUrl } from '../shared/helpers/DataUtils'
import { CLEANSLATE_CLASS, PRISM_CLASS } from './facetConstants'

const embedStyle = (path: string) => {
  const id = kebabCase(path)

  if (document.getElementById(id)) return

  const fjs = document.getElementsByTagName('script')[0]
  const css = document.createElement('link')
  css.id = id
  css.media = 'all'
  css.rel = 'stylesheet'
  css.type = 'text/css'
  css.crossOrigin = 'anonymous'
  css.href = `${path}?v=${APP_VERSION}`
  fjs && fjs.parentNode.insertBefore(css, fjs)
}

const addHideStyles = () => {
  const id = kebabCase(`prism-hide-styles-${APP_VERSION}`)

  if (document.getElementById(id)) return

  const fjs = document.getElementsByTagName('script')[0]
  const css = document.createElement('link')
  css.media = 'all'
  css.rel = 'stylesheet'
  css.type = 'text/css'
  css.id = id
  fjs && fjs.parentNode.insertBefore(css, fjs)
  css.innerHTML = `.${CLEANSLATE_CLASS}.${PRISM_CLASS} { display: none }`
}

export const embedGlobalStyles = () => {
  addHideStyles()
  embedStyle(ensureFullyQualifiedAssetUrl(`css/${WEBPACK_CONSTANTS.chunkNonReactName}.css`))
  embedStyle(ensureFullyQualifiedAssetUrl(`css/${WEBPACK_CONSTANTS.cleanslateEntryPointName}.css`))
}

// attaches styles for provided bundle -- only runs once per bundle name
export const embedBundleStyles = (bundleName: string) => {
  // create the link to our css
  const fileName = `${camelCase(bundleName)}.css`
  const stylePath = ensureFullyQualifiedAssetUrl(`css/${fileName}`)
  embedStyle(stylePath)
}
