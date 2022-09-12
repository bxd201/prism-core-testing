export const ROUTE_PARAMS = Object.freeze({
  ACTIVE: 'active',
  COLOR_DETAIL: 'color-detail',
  COLOR_WALL: 'color-wall',
  SECTION: 'section',
  FAMILY: 'family',
  COLOR: 'color',
  SEARCH: 'search'
})

export function omitPrefix(str: string = ''): string {
  if (typeof str === 'string') {
    return str.replace(/@\|@.*@\|@/g, '')
  }
  return ''
}
