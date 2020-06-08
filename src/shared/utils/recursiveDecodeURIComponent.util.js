// @flow
const encodedCharsRegex = /[%][0-9A-F]{2,4}/g
const pct = '%25'

export const ERROR_NOT_STRING = 'Input must be a string'
export const ERROR_CANNOT_DECODE = 'Unable to properly decode input'

function encodeStandalonePct (input: string = ''): string {
  const orig = input
  const encoded = input.replace(/%(.?)$/g, `${pct}$1`).replace(/%(([^0-9A-F].)|(.[^0-9A-F]))/g, `${pct}$1`)

  if (orig === encoded) {
    return encoded
  }

  return encodeStandalonePct(encoded)
}

function recursiveDecodeURIComponent (input: string = ''): string {
  if (typeof input !== 'string') throw new TypeError(ERROR_NOT_STRING)

  const orig = input
  const normalizedInput = encodeStandalonePct(input)
  let decoded = ''

  // if we detect encoded characters in our input...
  if (encodedCharsRegex.test(normalizedInput)) {
    try {
      // ... attempt to decode them
      decoded = decodeURIComponent(normalizedInput)
    } catch (err) {
      throw new Error(ERROR_CANNOT_DECODE)
    }
  } else {
    return input
  }

  if (decoded === orig) {
    return decoded
  }

  return recursiveDecodeURIComponent(decoded)
}

export default recursiveDecodeURIComponent
