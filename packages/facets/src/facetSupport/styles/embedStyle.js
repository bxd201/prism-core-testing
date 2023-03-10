// @flow
import camelCase from 'lodash/camelCase'
import appendToBodyUtil from 'src/shared/utils/appendToBody.util'
import ensureFullyQualifiedAssetUrl from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'

export default (path: string) => {
  const id = camelCase(path)

  if (document.getElementById(id)) return

  const css = document.createElement('link')
  css.id = id
  css.media = 'all'
  css.rel = 'stylesheet'
  css.type = 'text/css'
  css.crossOrigin = 'anonymous'
  css.href = ensureFullyQualifiedAssetUrl(path)
  appendToBodyUtil(css)
}
