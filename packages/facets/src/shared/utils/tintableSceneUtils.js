// @flow
// This is a generic method that can map a color or color id (or anything else) to match the surfaces for a tintablescene
export const mapItemsToList = (item: any[], surfaces: any[]) => {
  return surfaces.map((surface, i) => {
    return i < item.length ? item[i] : null
  })
}

// @todo This is tech debt, we need a separate data source to handle this properly -RS
export const removeLastS = (text: string): string => {
  if (!text) {
    return ''
  }

  if (text.length > 2 && text.slice(-1).toLowerCase() === 's') {
    return text.slice(0, text.length - 1)
  }

  return text
}
