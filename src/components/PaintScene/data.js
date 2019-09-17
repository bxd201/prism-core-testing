// @flow

export const toolBarButtons = [
  { id: 1, name: 'paintArea', displayName: 'PAINT AREA', tooltipContent: 'Use the Paint Area feature to automatically detect and paint surface areas. Just click or tap on a surface to highlight it, then click or tap again.' },
  { id: 2, name: 'paintBrush', displayName: 'PAINTBRUSH', tooltipContent: 'Allows for the freehand painting of your selected scene. Just point, click or tap and drag to add color to any area.' },
  { id: 3, name: 'selectArea', displayName: 'SELECT', tooltipContent: 'Select an area, then use the tool bar to paint, edit paint colors or remove paint from your scene.' },
  { id: 4, name: 'erase', displayName: 'ERASE', tooltipContent: 'Remove paint from your scene.' },
  { id: 5, name: 'defineArea', displayName: 'DEFINE AREA', tooltipContent: 'Outline an area to paint it. Be sure to enclose the area by starting and ending at the same point.' },
  { id: 6, name: 'removeArea', displayName: 'REMOVE AREA', tooltipContent: 'Use this tool to select and remove paint from a defined area.' },
  { id: 7, name: 'zoom', displayName: 'ZOOM', tooltipContent: 'Zoom in and pan around within your scene to paint small areas with increased accuracy.' },
  { id: 8, name: 'undo', displayName: 'UNDO', tooltipContent: 'Step backwards from your last action.' },
  { id: 9, name: 'redo', displayName: 'REDO', tooltipContent: 'Step forward from your last action.' },
  { id: 10, name: 'hidePaint', displayName: 'HIDE PAINT', tooltipContent: 'Use this tool to see the original room scene.' },
  { id: 11, name: 'info', displayName: 'HINTS', tooltipContent: 'Click here to revisit the Tool Tips.' }
]

export const selectGroupButtons = [
  { id: 1, name: 'delete', displayName: 'DELETE' },
  { id: 2, name: 'group', displayName: 'GROUP' },
  { id: 3, name: 'ungroup', displayName: 'UNGROUP' }
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

export const toolNames = getToolNamesOrNumbers(toolBarButtons, 'name')
export const toolNumbers = getToolNamesOrNumbers(toolBarButtons, 'number')
