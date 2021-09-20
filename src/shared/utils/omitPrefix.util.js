// @flow
export default function omitPrefix (str: string = ''): string {
  if (typeof str === 'string') {
    return str.replace(/@\|@.*@\|@/g, '')
  }
  return ''
}
