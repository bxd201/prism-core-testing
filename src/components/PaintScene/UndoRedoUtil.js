// @flow
export const undo = (state: Object) => {
  const { imagePathList, redoPathList } = state

  if (!imagePathList.length) {
    return
  }

  const lastItem = imagePathList[imagePathList.length - 1]
  let relatedRedoOps = []
  const { undoOperations, redos } = handleUndo(lastItem.id, relatedRedoOps, imagePathList)
  redos.forEach(redoItem => redoPathList.push(redoItem))

  const redoOperations = [...redoPathList]
  return {
    imagePathList: undoOperations,
    redoPathList: redoOperations,
    undoIsEnabled: undoOperations.length > 0,
    redoIsEnabled: redoOperations.length > 0
  }
}

const handleUndo = (itemId, redos, history) => {
  const item = history.filter(historyItem => historyItem.id === itemId)[0]
  if (!item) {
    return { undoOperations: history, redos: redos }
  }
  redos.push(item)
  history = history.filter(historyItem => historyItem.id !== itemId)
  const linkedItems = item.linkedOperation
  if (linkedItems) {
    toggleLinkedItems(linkedItems, history)
  }

  if (item.siblingOperations) {
    for (let i = 0; i < item.siblingOperations.length; i++) {
      return handleUndo(item.siblingOperations[i], redos, history)
    }
  }
  return { undoOperations: history, redos: redos }
}

const toggleLinkedItems = (linkedItems, history) => {
  if (linkedItems) {
    history.forEach((item) => {
      if (linkedItems.indexOf(item.id) > -1) {
        item.isEnabled = !item.isEnabled
      }
    })
  }
}

export const redo = (state: Object) => {
  const { imagePathList, redoPathList } = state

  if (!redoPathList.length) {
    return
  }

  const lastItem = redoPathList[redoPathList.length - 1]
  const { history, updateRedoPathList } = handleRedo(lastItem.id, redoPathList, imagePathList)
  return {
    imagePathList: history,
    redoPathList: updateRedoPathList,
    undoIsEnabled: history.length > 0,
    redoIsEnabled: updateRedoPathList.length > 0
  }
}

const handleRedo = (itemId, redoPathList, history) => {
  const item = redoPathList.filter(historyItem => historyItem.id === itemId)[0]
  if (!item) {
    return { updateRedoPathList: redoPathList, history: history }
  }
  history.push(item)
  redoPathList = redoPathList.filter(historyItem => historyItem.id !== itemId)

  const linkedItems = item.linkedOperation
  if (linkedItems) {
    toggleLinkedItems(linkedItems, history)
  }

  if (item.siblingOperations) {
    for (let i = 0; i < item.siblingOperations.length; i++) {
      return handleRedo(item.siblingOperations[i], redoPathList, history)
    }
  }
  return { updateRedoPathList: redoPathList, history: history }
}
