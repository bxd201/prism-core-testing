// @flow

export const toolBarButtons = [
  { id: 1, name: 'paintArea', displayName: 'PAINT AREA', fontAwesomeIcon: { variant: 'fa', icon: 'fill-drip', rotate: 0, flip: 'horizontal' } },
  { id: 2, name: 'paintBrush', displayName: 'PAINTBRUSH', fontAwesomeIcon: { variant: 'fa', icon: 'brush', rotate: 45 } },
  { id: 3, name: 'selectArea', displayName: 'SELECT', fontAwesomeIcon: { variant: 'fa', icon: 'mouse-pointer', rotate: -20, flip: 'horizontal' } },
  { id: 4, name: 'erase', displayName: 'ERASE', fontAwesomeIcon: { variant: 'fa', icon: 'eraser', rotate: 0 } },
  { id: 5, name: 'defineArea', displayName: 'DEFINE AREA', fontAwesomeIcon: { variant: 'fal', icon: 'draw-polygon', rotate: 10 } },
  { id: 6, name: 'removeArea', displayName: 'REMOVE AREA', fontAwesomeIcon: { variant: 'fal', icon: 'draw-polygon', rotate: 10 } },
  { id: 7, name: 'zoom', displayName: 'ZOOM', fontAwesomeIcon: { variant: 'fal', icon: 'search-plus', rotate: 0 } },
  { id: 8, name: 'undo', displayName: 'UNDO', fontAwesomeIcon: { variant: 'fa', icon: 'undo-alt', rotate: 0 } },
  { id: 9, name: 'redo', displayName: 'REDO', fontAwesomeIcon: { variant: 'fa', icon: 'redo-alt', rotate: 0 } },
  { id: 10, name: 'hidePaint', displayName: 'HIDE PAINT', fontAwesomeIcon: { variant: 'fa', icon: 'eye', rotate: 0, flip: 'horizontal' } },
  { id: 11, name: 'info', displayName: 'HINTS', fontAwesomeIcon: { variant: 'fal', icon: 'info-circle', rotate: 0 } }
]

export const selectGroupButtons = [
  { id: 1, name: 'deleteGroup', displayName: 'DELETE', fontAwesomeIcon: { variant: 'fal', icon: 'trash-alt', rotate: 0 } },
  { id: 2, name: 'group', displayName: 'GROUP', fontAwesomeIcon: { variant: 'fal', icon: 'object-group', rotate: 0 } },
  { id: 3, name: 'ungroup', displayName: 'UNGROUP', fontAwesomeIcon: { variant: 'fal', icon: 'object-ungroup', rotate: 0 } }
]

export const selectGroupTooltipData = [
  {
    displayName: 'GROUP AND UNGROUP'
  }
]

const getToolNamesOrNumbers = (toolbarData, valueBy = 'name') => {
  const nameDict = {}
  toolbarData.forEach((item) => {
    if (valueBy === 'number') {
      nameDict[item.name.toUpperCase()] = item.id
    } else {
      nameDict[item.name.toUpperCase()] = item.name
    }
  })

  return nameDict
}

export const groupToolNames = getToolNamesOrNumbers(selectGroupButtons, 'name')
export const toolNames = getToolNamesOrNumbers(toolBarButtons, 'name')
export const toolNumbers = getToolNamesOrNumbers(toolBarButtons, 'number')

export const brushLargeSize = 38
export const brushMediumSize = 30
export const brushSmallSize = 22
export const brushTinySize = 14
export const brushRoundShape = 'round'
export const brushSquareShape = 'square'
export const brushTypes = [
  brushLargeSize, brushMediumSize, brushSmallSize, brushTinySize
]
