import ensureFullyQualifiedAssetUrl, { ERROR_NOT_STRING, ERROR_UNQUALIFIABLE, normalizeSlashes } from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'

describe('ensureFullyQualifiedAssetUrl.util', () => {
  it('will throw an error for non-string input', () => {
    expect(() => ensureFullyQualifiedAssetUrl()).toThrow(ERROR_NOT_STRING)
    expect(() => ensureFullyQualifiedAssetUrl(null)).toThrow(ERROR_NOT_STRING)
    expect(() => ensureFullyQualifiedAssetUrl(false)).toThrow(ERROR_NOT_STRING)
    expect(() => ensureFullyQualifiedAssetUrl({})).toThrow(ERROR_NOT_STRING)
  })

  it('will throw an error for unqualifiable strings', () => {
    expect(() => ensureFullyQualifiedAssetUrl('')).toThrow(ERROR_UNQUALIFIABLE)
    expect(() => ensureFullyQualifiedAssetUrl('      ')).toThrow(ERROR_UNQUALIFIABLE)
  })

  it('will prepend BASE_PATH to valid input that is not fully qualified', () => {
    expect(ensureFullyQualifiedAssetUrl('anything')).toMatch(new RegExp(`^${BASE_PATH}`))
    expect(ensureFullyQualifiedAssetUrl('path/to/file.js')).toEqual(`${BASE_PATH}/path/to/file.js`)
  })

  it('will prepend BASE_PATH to unqualified URLs', () => {
    expect(ensureFullyQualifiedAssetUrl('path/to/file.js')).toEqual(`${BASE_PATH}/path/to/file.js`)
    expect(ensureFullyQualifiedAssetUrl('/path/to/file.js')).toEqual(`${BASE_PATH}/path/to/file.js`)
  })

  it('will treat // or <protocol>:// as fully-qualified and return them as-is', () => {
    expect(ensureFullyQualifiedAssetUrl('//path/to/file.js')).toEqual(`//path/to/file.js`)
    expect(ensureFullyQualifiedAssetUrl('//////path/to/file.js')).toEqual(`//path/to/file.js`)
    expect(ensureFullyQualifiedAssetUrl('https://path/to/file.js')).toEqual(`https://path/to/file.js`)
  })

  it('will leave fully-qualified URLs untouched', () => {
    expect(ensureFullyQualifiedAssetUrl('https://site.com/path/to/file.js')).toEqual('https://site.com/path/to/file.js')
    expect(ensureFullyQualifiedAssetUrl('http://web.co.uk')).toEqual('http://web.co.uk') // without trailing slash
    expect(ensureFullyQualifiedAssetUrl('http://web.co.uk/')).toEqual('http://web.co.uk/') // with trailing slash
    expect(ensureFullyQualifiedAssetUrl('http://localhost:8080/anything')).toEqual('http://localhost:8080/anything')
  })

  it('will leave query params and hashes untouches', () => {
    expect(ensureFullyQualifiedAssetUrl('https://site.com/path/to/file.js?foo=bar&bool&arr[]=1&arr[]=2')).toMatch(/\?foo=bar&bool&arr\[\]=1&arr\[\]=2$/)
    expect(ensureFullyQualifiedAssetUrl('https://site.com/path/to/page.html#anchor')).toMatch(/#anchor$/)
    expect(ensureFullyQualifiedAssetUrl('https://site.com/path/to/page.html?foo=bar#anchor')).toMatch(/\?foo=bar#anchor$/)
  })
})

describe('normalizeSlashes', () => {
  it('will remove leading slashes', () => {
    expect(normalizeSlashes('/foo')).toEqual('foo')
    expect(normalizeSlashes('////////foo')).toEqual('foo')
  })

  it('will replace sequential slashes with a single slash', () => {
    expect(normalizeSlashes('foo////bar')).toEqual('foo/bar')
    expect(normalizeSlashes('foo/bar')).toEqual('foo/bar')
  })
})
