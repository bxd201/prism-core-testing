// @flow
import urlPattern from 'src/shared/regex/url'

export const ERROR_UNQUALIFIABLE = 'This URL cannot be qualified'
export const ERROR_NOT_STRING = 'The provided URL is not a string'
export const normalizeSlashes = (input: string = ''): string => input.replace(/^\/+/, '').replace(/\/+/g, '/')

function ensureFullyQualifiedAssetUrl (url: string): string {
  if (typeof url === 'string') {
    const matches = url.match(urlPattern)

    if (matches && matches[0].trim().length > 0) {
      // replace extraneous leading slashes at beginning of URL regardless of fully-qualified URL or otherwise
      const output = `${normalizeSlashes(`${matches[3] || ''}${matches[5] ? `/${matches[5]}` : ''}`)}${matches[6] || ''}${matches[8] || ''}`
      // fully-qualified URL gets its original protocol and // prepended
      if (matches[3]) return `${matches[1] || ''}//${output}`
      // unqualified URL is prepended with our BASE_PATH
      if (matches[5]) return `${BASE_PATH}/${output}`
    }

    throw new Error(ERROR_UNQUALIFIABLE)
  }

  throw new TypeError(ERROR_NOT_STRING)
}

export default ensureFullyQualifiedAssetUrl
