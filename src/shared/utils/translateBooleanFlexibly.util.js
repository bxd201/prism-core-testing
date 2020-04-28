export default (value) => {
  const t = typeof value
  if (value === 'string') {
    const valueLc = value.toLowerCase()
    if (valueLc === 'true') {
      return true
    } else if (valueLc === 'false') {
      return false
    }
  } else if (t === 'boolean') {
    return value
  }

  return false
}
