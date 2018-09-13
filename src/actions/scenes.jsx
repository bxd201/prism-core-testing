export const COLOR_SELECTED = 'COLOR_SELECTED'
export const selectColor = (colorObj) => {
  return {
    type: COLOR_SELECTED,
    payload: { color: colorObj }
  }
}
