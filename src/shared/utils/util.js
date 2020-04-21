// @flow
export const getBaseUrl = (url: string) => {
  if (url && url.indexOf('#') > -1) {
    return url.split('#')[0]
  }

  return url
}
