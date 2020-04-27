import urlPattern from 'src/shared/regex/url'
import removeExtraURLSlashesAfterProtocol from './removeExtraURLSlashesAfterProtocol.util'

// @flow
export default (url: string): string => {
  if (typeof url === 'string' && url.length > 1) {
    const matches = url.match(urlPattern)
    return matches && matches[1] ? url : removeExtraURLSlashesAfterProtocol(`${BASE_PATH}/${url}`)
  }

  return ''
}
