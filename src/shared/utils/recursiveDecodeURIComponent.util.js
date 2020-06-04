// @flow
const encodedCharsRegex = /[%][0-9A-F]{2,4}/g
const pct = '%25'

function encodeStandalonePct (input: string = ''): string {
  const orig = input
  const encoded = input.replace(/%(.?)$/g, `${pct}$1`).replace(/%(([^0-9A-F].)|(.[^0-9A-F]))/g, `${pct}$1`)

  if (orig === encoded) {
    return encoded
  }

  return encodeStandalonePct(encoded)
}

function recursiveDecodeURIComponent (input: string = ''): string {
  const orig = input
  const normalizedInput = encodeStandalonePct(input)
  let decoded = ''

  // if we detect encoded characters in our input...
  if (encodedCharsRegex.test(normalizedInput)) {
    try {
      // ... attempt to decode them
      decoded = decodeURIComponent(normalizedInput)
    } catch (err) {
      throw new Error(`Unable to properly decode this string: ${JSON.stringify(input)}`)
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
