// @flow
import camelCase from 'lodash/camelCase'
import { CLEANSLATE_CLASS, PRISM_CLASS } from '../facetConstants'
import appendToBodyUtil from 'src/shared/utils/appendToBody.util'

export default () => {
  const id = camelCase(`prism-hide-styles-${APP_VERSION}`)

  if (document.getElementById(id)) return

  const css = document.createElement('link')
  css.media = 'all'
  css.rel = 'stylesheet'
  css.type = 'text/css'
  css.id = id
  appendToBodyUtil(css)
  css.innerHTML = `.${CLEANSLATE_CLASS}.${PRISM_CLASS} { display: none }`
}
