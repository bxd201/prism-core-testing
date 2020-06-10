import dedupePatternedString, { ERROR_NOT_STRING } from 'src/shared/utils/dedupePatternedString.util'

describe('dedupePatternedString.util', () => {
  const noDupes = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()?'

  it('will throw an error when given non-string input', () => {
    expect(() => dedupePatternedString()).toThrowError(ERROR_NOT_STRING)
    expect(() => dedupePatternedString(null)).toThrowError(ERROR_NOT_STRING)
    expect(() => dedupePatternedString(false)).toThrowError(ERROR_NOT_STRING)
    expect(() => dedupePatternedString({})).toThrowError(ERROR_NOT_STRING)
  })

  it('will return an empty string if given empty string input', () => {
    expect(dedupePatternedString('')).toEqual('')
  })

  it('will result in identical input and output when input contains no duplicates', () => {
    expect(dedupePatternedString(noDupes)).toEqual(noDupes)
  })

  it('will remove duplicates from a string with duplicate characters', () => {
    expect(dedupePatternedString(`${noDupes}${noDupes}`)).toEqual(noDupes)
  })
})
