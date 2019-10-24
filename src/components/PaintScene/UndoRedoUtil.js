// @flow
export const undo = (state: Object) => {
  const { imagePathList, redoPathList } = state
  let undoOperations = []
  let undoneOperation = null

  if (imagePathList.length) {
    undoOperations = imagePathList.slice(0, -1)
    undoneOperation = imagePathList[imagePathList.length - 1]
  }

  const redoOperations = undoneOperation ? [...redoPathList, undoneOperation] : [...redoPathList]

  return {
    imagePathList: undoOperations,
    redoPathList: redoOperations,
    undoIsEnabled: undoOperations.length > 0,
    redoIsEnabled: redoOperations.length > 0
  }
}

export const redo = (state: Object) => {
  const { imagePathList, redoPathList } = state
  let redoOperations = []
  let redoneOperation = null

  if (redoPathList.length) {
    redoOperations = redoPathList.slice(0, -1)
    redoneOperation = redoPathList[redoPathList.length - 1]
  }

  const undoOperations = redoneOperation ? [...imagePathList, redoneOperation] : [...redoneOperation]

  return {
    imagePathList: undoOperations,
    redoPathList: redoOperations,
    undoIsEnabled: undoOperations.length > 0,
    redoIsEnabled: redoOperations.length > 0
  }
}
