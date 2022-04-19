// @flow
export const ERROR_NOT_STRING = 'Input must be a string'

function getBeforeHash (input: string): string {
  if (typeof input !== 'string') throw new TypeError(ERROR_NOT_STRING)

  if (input.indexOf('#') > -1) {
    return input.split('#')[0]
  }

  return input
}

export default getBeforeHash
