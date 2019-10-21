// @flow

export const toolBarButtons = [
  { id: 1, name: 'paintArea', displayName: 'PAINT AREA', tooltipContent: 'Use the Paint Area feature to automatically detect and paint surface areas. Just click or tap on a surface to highlight it, then click or tap again.', fontAwesomeIcon: { variant: 'fa', icon: 'fill-drip', rotate: 0, flip: 'horizontal' } },
  { id: 2, name: 'paintBrush', displayName: 'PAINTBRUSH', tooltipContent: 'Allows for the freehand painting of your selected scene. Just point, click or tap and drag to add color to any area.', fontAwesomeIcon: { variant: 'fa', icon: 'brush', rotate: 45 } },
  { id: 3, name: 'selectArea', displayName: 'SELECT', tooltipContent: 'Select an area, then use the tool bar to paint, edit paint colors or remove paint from your scene.', fontAwesomeIcon: { variant: 'fa', icon: 'mouse-pointer', rotate: -20, flip: 'horizontal' } },
  { id: 4, name: 'erase', displayName: 'ERASE', tooltipContent: 'Remove paint from your scene.', fontAwesomeIcon: { variant: 'fa', icon: 'eraser', rotate: 0 } },
  { id: 5, name: 'defineArea', displayName: 'DEFINE AREA', tooltipContent: 'Outline an area to paint it. Be sure to enclose the area by starting and ending at the same point.', fontAwesomeIcon: { variant: 'fal', icon: 'draw-polygon', rotate: 10 } },
  { id: 6, name: 'removeArea', displayName: 'REMOVE AREA', tooltipContent: 'Use this tool to select and remove paint from a defined area.', fontAwesomeIcon: { variant: 'fal', icon: 'draw-polygon', rotate: 10 } },
  { id: 7, name: 'zoom', displayName: 'ZOOM', tooltipContent: 'Zoom in and pan around within your scene to paint small areas with increased accuracy.', fontAwesomeIcon: { variant: 'fal', icon: 'search-plus', rotate: 0 } },
  { id: 8, name: 'undo', displayName: 'UNDO', tooltipContent: 'Step backwards from your last action.', fontAwesomeIcon: { variant: 'fa', icon: 'undo-alt', rotate: 0 } },
  { id: 9, name: 'redo', displayName: 'REDO', tooltipContent: 'Step forward from your last action.', fontAwesomeIcon: { variant: 'fa', icon: 'redo-alt', rotate: 0 } },
  { id: 10, name: 'hidePaint', displayName: 'HIDE PAINT', tooltipContent: 'Use this tool to see the original room scene.', fontAwesomeIcon: { variant: 'fa', icon: 'eye', rotate: 0, flip: 'horizontal' } },
  { id: 11, name: 'info', displayName: 'HINTS', tooltipContent: 'Click here to revisit the Tool Tips.', fontAwesomeIcon: { variant: 'fal', icon: 'info-circle', rotate: 0 } }
]

export const selectGroupButtons = [
  { id: 1, name: 'deleteGroup', displayName: 'DELETE', fontAwesomeIcon: { variant: 'fal', icon: 'trash-alt', rotate: 0 } },
  { id: 2, name: 'group', displayName: 'GROUP', fontAwesomeIcon: { variant: 'fal', icon: 'object-group', rotate: 0 } },
  { id: 3, name: 'ungroup', displayName: 'UNGROUP', fontAwesomeIcon: { variant: 'fal', icon: 'object-ungroup', rotate: 0 } }
]

export const selectGroupTooltipData = [
  {
    displayName: 'GROUP AND UNGROUP',
    tooltipContent: 'Use this tool to group and edit multiple areas at the same time. Use the Delete tool to remove areas from your scene.'
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
