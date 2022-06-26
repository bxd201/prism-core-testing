// @flow
// This is a generic method that can map a color or color id (or anything else) to match the surfaces for a tintablescene
export const mapItemsToList = (item: any[], surfaces: any[]) => {
  return surfaces.map((surface, i) => {
    return i < item.length ? item[i] : null
  })
}
