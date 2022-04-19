import translateBooleanFlexibly from 'src/shared/utils/translateBooleanFlexibly.util'

describe('translateBooleanFlexibly.util', () => {
  it('will return the exact value of any booleans provided as input', () => {
    expect(translateBooleanFlexibly(true)).toEqual(true)
    expect(translateBooleanFlexibly(false)).toEqual(false)
  })

  it('will translate ONLY the string \'true\' to boolean true; all other strings are false', () => {
    expect(translateBooleanFlexibly('true')).toEqual(true)
    expect(translateBooleanFlexibly('false')).toEqual(false)
    expect(translateBooleanFlexibly('foo')).toEqual(false)
  })

  it('any non-Boolean(true) or non-\'true\' values will return false', () => {
    expect(translateBooleanFlexibly()).toEqual(false)
    expect(translateBooleanFlexibly('')).toEqual(false)
    expect(translateBooleanFlexibly(0)).toEqual(false)
    expect(translateBooleanFlexibly(1)).toEqual(false)
    expect(translateBooleanFlexibly({})).toEqual(false)
  })
})
