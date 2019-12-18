// @flow
import once from 'lodash/once'
import camelCase from 'lodash/camelCase'
import memoizee from 'memoizee'
import { ensureFullyQualifiedAssetUrl } from '../shared/helpers/DataUtils'
import { cleanslateEntryPointName } from '../../webpack/constants'
import { CLEANSLATE_CLASS, PRISM_CLASS } from './facetConstants'

export const embedGlobalStylesOnce = once(() => {
  const immediateStyleTag = document.createElement('style')
  immediateStyleTag.type = 'text/css'
  // $FlowIgnore -- flow doesn't think body is defined
  document.body.appendChild(immediateStyleTag)
  immediateStyleTag.innerHTML = `.${CLEANSLATE_CLASS}.${PRISM_CLASS} { display: none }`
  const cleanslatePath = ensureFullyQualifiedAssetUrl(`css/${cleanslateEntryPointName}.css`)
  const cleanslateTag = document.createElement('link')
  cleanslateTag.rel = 'stylesheet'
  cleanslateTag.type = 'text/css'
  cleanslateTag.crossOrigin = 'anonymous'
  cleanslateTag.href = cleanslatePath // eslint-disable-line no-undef
  cleanslateTag.media = 'all'
  // $FlowIgnore -- flow doesn't think body is defined
  document.body.appendChild(cleanslateTag)
})

// attaches styles for provided bundle -- only runs once per bundle name
export const memoEmbedBundleStyles = memoizee((bundleName) => {
  // create the link to our css
  const fileName = `${camelCase(bundleName)}.css`
  const stylePath = ensureFullyQualifiedAssetUrl(`css/${fileName}`)
  const styleTag = document.createElement('link')
  styleTag.rel = 'stylesheet'
  styleTag.type = 'text/css'
  styleTag.crossOrigin = 'anonymous'
  /* eslint-disable no-undef */ styleTag.href = stylePath
  styleTag.media = 'all'

  // add our css to the <head>
  // $FlowIgnore -- flow doesn't think body is defined
  document.body.appendChild(styleTag)
}, { primitive: true, length: 1 })
