const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function contractString (str) {
  if (!str || typeof str !== 'string') return ''

  return str.split('').reduce((accum, next, i, orig) => {
    if (i === 0 || i === orig.length - 1) return `${accum}${next.toLowerCase()}`
    if (i === orig.length - 2) return `${accum}${i < alpha.length ? alpha[i] : i.toString()}`
    return accum
  }, '')
}

module.exports = {
  contractString: contractString
}