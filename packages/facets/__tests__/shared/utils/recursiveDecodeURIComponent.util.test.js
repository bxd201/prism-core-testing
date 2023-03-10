import recursiveDecodeURIComponent, { ERROR_NOT_STRING } from 'src/shared/utils/recursiveDecodeURIComponent.util'

// convenience proxy methods to make things more readable
const decode = (input) => recursiveDecodeURIComponent(input)
const encode = (input) => encodeURIComponent(input)

describe('recursiveDecodeURIComponent.util', () => {
  const alphaValue = 'simple'
  const numValue = '1234567890'
  const alphaNumValue = `${alphaValue}${numValue}`
  const specialCharsValue = '!@#$%^&*(){}:?+=/'
  const allValues = `${alphaValue}${numValue}${specialCharsValue}`

  it('will throw an error when given non-string input', () => {
    expect(() => decode(false)).toThrowError(ERROR_NOT_STRING)
    expect(() => decode(5)).toThrowError(ERROR_NOT_STRING)
  })

  it('will return an empty string when given empty or null input', () => {
    expect(decode()).toEqual('')
    expect(decode('')).toEqual('')
  })

  it('will return input when special characters ARE NOT present, even if input is encoded', () => {
    expect(decode(alphaNumValue)).toEqual(alphaNumValue)
    expect(decode(encode(alphaNumValue))).toEqual(alphaNumValue)
  })

  it('will return input when special characters ARE present, even if input is encoded', () => {
    expect(decode(specialCharsValue)).toEqual(specialCharsValue)
    expect(decode(encode(specialCharsValue))).toEqual(specialCharsValue)
  })

  it('will return complex input when special characters ARE present, even if input is encoded multiple times', () => {
    expect(decode(allValues)).toEqual(allValues)
    expect(decode(encode(encode(encode(allValues))))).toEqual(allValues)
    expect(decode(encode(allValues))).toEqual(allValues)
  })

  it('will return the same results for the following inputs ', () => {
    // Previously had encoded char regex externalized, but that (mysteriously) allowed for the following
    // two strings to be decoded differently as a result of inconsistent regex test results during recursion.
    // My best guess is "something to do with Webpack," but I couldn't isolate it. Moved regex definitions
    // into functions (still DRY) and as a result no longer have the problem. This test is here to ensure it
    // doesn't resurface accidentally.
    expect(decode('!@%23$%25%5E%26()')).toEqual('!@#$%^&()')
    expect(decode('!@%2523$%25%5E%26()')).toEqual('!@#$%^&()')
  })
})
