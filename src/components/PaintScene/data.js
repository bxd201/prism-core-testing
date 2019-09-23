// @flow

export const toolBarButtons = [
  { id: 1, name: 'paintArea' },
  { id: 2, name: 'paintBrush' },
  { id: 3, name: 'selectArea' },
  { id: 4, name: 'erase' },
  { id: 5, name: 'defineArea' },
  { id: 6, name: 'removeArea' },
  { id: 7, name: 'zoom' },
  { id: 8, name: 'undo' },
  { id: 9, name: 'redo' },
  { id: 10, name: 'hidePaint' },
  { id: 11, name: 'info' }
]

const getToolNames = (toolbarData) => {
  const nameDict = {}
  toolbarData.forEach((item) => {
    nameDict[item.name.toUpperCase()] = item.name
  })

  return nameDict
}

export const toolNames = getToolNames(toolBarButtons)
