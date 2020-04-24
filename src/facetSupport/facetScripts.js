// @flow
import kebabCase from 'lodash/kebabCase'
import { ensureFullyQualifiedAssetUrl } from '../shared/helpers/DataUtils'

const embedScript = (path: string) => {
  const s = 'script'
  const id = kebabCase(path)

  if (document.getElementById(id)) return

  const fjs = document.getElementsByTagName(s)[0]
  const js = document.createElement(s); js.id = id
  js.src = `${path}?v=${APP_VERSION}`
  // $FlowIgnore -- flow doesn't think body is defined
  fjs.parentNode.insertBefore(js, fjs)
}

const loadBundle = () => embedScript(ensureFullyQualifiedAssetUrl(`${WEBPACK_CONSTANTS.mainEntryPointName}.js`))

export {
  embedScript,
  loadBundle
}
