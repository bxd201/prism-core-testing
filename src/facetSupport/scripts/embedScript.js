// @flow
import camelCase from 'lodash/camelCase'
import appendToBodyUtil from 'src/shared/utils/appendToBody.util'

export default (path: string) => {
  const id = camelCase(path)

  if (document.getElementById(id)) return

  const js = document.createElement('script')
  js.id = id
  js.async = true
  js.src = path
  appendToBodyUtil(js)
}
