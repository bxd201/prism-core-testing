// @flow
export default (url: string) => {
  return url.replace(/([^:])(\/){2,}/g, '$1/')
}
