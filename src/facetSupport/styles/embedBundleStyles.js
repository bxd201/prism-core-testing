// @flow
import camelCase from 'lodash/camelCase'

import embedStyle from './embedStyle'
import ensureFullyQualifiedAssetUrlUtil from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'

// attaches styles for provided bundle -- only runs once per bundle name
export default (bundleName: string) => {
  // create the link to our css
  const fileName = `${camelCase(bundleName)}.css`
  const stylePath = ensureFullyQualifiedAssetUrlUtil(`css/${fileName}`)
  embedStyle(stylePath)
}
