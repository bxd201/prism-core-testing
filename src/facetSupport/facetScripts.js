import once from 'lodash/once'
import { ensureFullyQualifiedAssetUrl } from '../shared/helpers/DataUtils'

const loadBundle = once(() => {
  const bundleTag = document.createElement('script')
  const bundlePath = ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.mainEntryPointName}.js`)
  bundleTag.src = bundlePath // eslint-disable-line no-undef
  // $FlowIgnore -- flow doesn't think body is defined
  document.body.appendChild(bundleTag)
})

export {
  loadBundle
}
