import normalizeCssPropName, { ERROR_EMPTY, ERROR_STRING } from 'src/shared/utils/normalizeCssPropName.util'

describe('normalizeCssPropName.util', () => {
  it('will throw an error for non-string input', () => {
    expect(() => normalizeCssPropName()).toThrowError(ERROR_STRING)
    expect(() => normalizeCssPropName({})).toThrowError(ERROR_STRING)
    expect(() => normalizeCssPropName(null)).toThrowError(ERROR_STRING)
  })

  it('will throw an error for empty string input', () => {
    expect(() => normalizeCssPropName('')).toThrowError(ERROR_EMPTY)
    expect(() => normalizeCssPropName('    ')).toThrowError(ERROR_EMPTY)
  })

  it('will lowercase all chars, insert - between words, and prepend -- to the output', () => {
    expect(normalizeCssPropName('foo')).toEqual('--foo')
    expect(normalizeCssPropName('fooBar')).toEqual('--foo-bar')
    expect(normalizeCssPropName('foo-bar')).toEqual('--foo-bar')
    expect(normalizeCssPropName('foo bar')).toEqual('--foo-bar')
    expect(normalizeCssPropName('--foo-bar')).toEqual('--foo-bar')
    expect(normalizeCssPropName('foo2')).toEqual('--foo-2')
  })
})
