// @flow
import { copyImageList } from './utils'
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

const handleUndo = (itemId, redos, imagePathList) => {
  let history = copyImageList(imagePathList)
  let redoList = copyImageList(redos)
  const helper = (itemId) => {
    const item = history.filter(historyItem => historyItem.id === itemId)[0]
    if (!item) {
      return
    }
    redoList.push(item)
    history = history.filter(historyItem => historyItem.id !== itemId)
    const linkedItems = item.linkedOperation
    if (linkedItems) {
      toggleLinkedItems(linkedItems, history)
    }

    if (item.siblingOperations) {
      for (let i = 0; i < item.siblingOperations.length; i++) {
        helper(item.siblingOperations[i])
      }
    }
    return { undoOperations: history, redos: redoList }
  }
  return helper(itemId)
}

const toggleLinkedItems = (linkedItems, history) => {
  if (linkedItems) {
    history.forEach((item) => {
      if (linkedItems === item.id) {
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

const handleRedo = (itemId, redoPathList, imagePathList) => {
  let history = copyImageList(imagePathList)
  let redoList = copyImageList(redoPathList)
  const helper = (itemId) => {
    const item = redoList.filter(historyItem => historyItem.id === itemId)[0]
    if (!item) {
      return
    }
    history.push(item)
    redoList = redoList.filter(historyItem => historyItem.id !== itemId)

    const linkedItems = item.linkedOperation
    if (linkedItems) {
      toggleLinkedItems(linkedItems, history)
    }

    if (item.siblingOperations) {
      for (let i = 0; i < item.siblingOperations.length; i++) {
        helper(item.siblingOperations[i])
      }
    }
    return { updateRedoPathList: redoList, history: history }
  }
  return helper(itemId)
}
