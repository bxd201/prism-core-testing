// @flow
export const SET_LANGUAGE = 'SET_LANGUAGE'
export const setLanguage = (language: string) => {
  return {
    type: SET_LANGUAGE,
    payload: language
  }
}
