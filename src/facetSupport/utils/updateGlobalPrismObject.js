export default (propName, value) => {
  if (window.PRISM) {
    window.PRISM[propName] = value
  } else {
    window.PRISM = {
      [propName]: value
    }
  }

  return window.PRISM
}
