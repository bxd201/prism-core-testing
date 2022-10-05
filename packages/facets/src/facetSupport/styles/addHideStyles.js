// @flow
import camelCase from 'lodash/camelCase'
import appendToBodyUtil from 'src/shared/utils/appendToBody.util'
import { CLEANSLATE_CLASS, PRISM_CLASS } from '../facetConstants'

export default () => {
  const id = camelCase(`prism-hide-styles-${APP_VERSION}`)

  if (document.getElementById(id)) return

  const css = document.createElement('style')
  css.media = 'all'
  css.type = 'text/css'
  css.id = id
  appendToBodyUtil(css)
  css.innerHTML = `.${CLEANSLATE_CLASS}.${PRISM_CLASS} { display: none }`
}
