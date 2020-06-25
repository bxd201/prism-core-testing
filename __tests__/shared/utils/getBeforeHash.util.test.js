import getBeforeHash, { ERROR_NOT_STRING } from 'src/shared/utils/getBeforeHash.util'

describe('getBeforeHash.util', () => {
  it('throws an error with non-string input', () => {
    expect(() => getBeforeHash()).toThrowError(ERROR_NOT_STRING)
    expect(() => getBeforeHash(42)).toThrowError(ERROR_NOT_STRING)
    expect(() => getBeforeHash(true)).toThrowError(ERROR_NOT_STRING)
  })

  it('returns whole input when input is string without pound', () => {
    expect(getBeforeHash('foo')).toEqual('foo')

    const url = 'https://site.co.uk/path/to/page.html'
    expect(getBeforeHash(`${url}#anchor`)).toEqual(url)
  })

  it('returns portion of string preceding first pound when input contains pound', () => {
    expect(getBeforeHash('foo#bar')).toEqual('foo')
  })

  it('is not affected by multiple pound signs', () => {
    expect(getBeforeHash('foo###bar#baz')).toEqual('foo')
  })
})
