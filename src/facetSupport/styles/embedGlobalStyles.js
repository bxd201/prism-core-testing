// @flow
import addHideStyles from './addHideStyles'
import embedStyle from './embedStyle'
import ensureFullyQualifiedAssetUrl from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'

export default () => {
  addHideStyles()
  embedStyle(ensureFullyQualifiedAssetUrl(`css/${WEBPACK_CONSTANTS.chunkNonReactName}.css`))
  embedStyle(ensureFullyQualifiedAssetUrl(`css/${WEBPACK_CONSTANTS.cleanslateEntryPointName}.css`))
}
