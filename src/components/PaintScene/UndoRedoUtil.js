// @flow
import { copyImageList } from './utils'
export const undo = (state: Object) => {
  const { imagePathList, redoPathList, selectedArea, groupSelectList, groupAreaList, groupIds, deleteAreaList } = state
  if (!imagePathList.length) {
    return
  }

  const lastItem = imagePathList[imagePathList.length - 1]
  let relatedRedoOps = []
  const { undoOperations, redos, newGroupSelectList, updateGroupAreaList, updateGroupIds, updateSelectArea } = handleUndo(lastItem.id, relatedRedoOps, imagePathList, selectedArea, groupSelectList, groupAreaList, groupIds, deleteAreaList)
  redos.forEach(redoItem => redoPathList.push(redoItem))
  const redoOperations = [...redoPathList]
  return {
    selectedArea: updateSelectArea,
    groupSelectList: newGroupSelectList,
    groupAreaList: updateGroupAreaList,
    groupIds: updateGroupIds,
    imagePathList: undoOperations,
    redoPathList: redoOperations,
    undoIsEnabled: checkUndoIsEnabled(undoOperations),
    redoIsEnabled: redoOperations.length > 0
  }
}

const handleUndo = (itemId, redos, imagePathList, selectedArea, groupSelectList, groupAreaList, groupIds, deleteAreaList) => {
  let history = copyImageList(imagePathList)
  let redoList = copyImageList(redos)
  let updateSelectArea = copyImageList(selectedArea)
  let updateGroupAreaList = copyImageList(groupAreaList)
  let newGroupSelectList = copyImageList(groupSelectList)
  let updateGroupIds = [...groupIds]

  const helper = (itemId) => {
    const item = history.filter(historyItem => historyItem.id === itemId)[0]
    if (!item) {
      return
    }
    redoList.push(item)
    history = history.filter(historyItem => historyItem.id !== itemId)
    const linkedItems = item.linkedOperation
    const toggleSelect = item.toggleSelectId
    if (linkedItems) {
      toggleLinkedItems(linkedItems, history)
    }

    if (item.type === 'delete') {
      const toggleItem = history.filter(historyItem => historyItem.id === toggleSelect)[0]
      updateSelectArea.push({
        id: toggleItem.id,
        edgeList: toggleItem.data,
        selectPath: item.data
      })
      deleteAreaList.pop()
    }

    if (item.type === 'select') {
      updateSelectArea.pop()
    }

    if (toggleSelect && item.type === 'unselect') {
      toggleLinkedItems(toggleSelect, history)
      const toggleItem = history.filter(historyItem => historyItem.id === toggleSelect)[0]
      updateSelectArea.push({
        id: toggleItem.id,
        edgeList: toggleItem.data,
        selectPath: item.data
      })
    }

    if (item.type === 'select-group' && item.subType !== 'create-group') {
      const groupItem = newGroupSelectList.pop()
      if (groupItem !== undefined && groupItem.length !== 0) {
        groupItem.linkGroupId.forEach(historyItem => {
          toggleLinkedItems(historyItem, history)
        })
      }
    }

    // if undo item type is create group, should update groupIds, update groupAreaList, and update groupSelectList
    if (item.subType && item.subType === 'create-group') {
      const copyGroupIds = [...groupIds]
      const copyGroupAreaList = copyImageList(groupAreaList)
      const groupItem = newGroupSelectList.pop()
      const toRemove = groupItem.linkGroupId
      const toRemoveAreaId = groupItem.ancestorId
      const multiGroupList = item.groupSelectList
      updateGroupAreaList = copyGroupAreaList.filter((item) => item.id !== toRemoveAreaId)
      updateSelectArea = item.selectedArea
      updateGroupIds = copyGroupIds.filter((item) => toRemove.indexOf(item) < 0)
      if (multiGroupList.length > 0) {
        // if group only for group select list without select area
        if (updateSelectArea.length === 0) {
          const toggleItems = history.filter(historyItem => historyItem.type === 'select')
          toggleItems.forEach(toggleItem => {
            toggleLinkedItems(toggleItem.id, history)
          })
          multiGroupList.forEach(toggleItem => {
            toggleLinkedItems(toggleItem.id, history)
          })
        }
        // if group for group selectlist and select area
        if (updateSelectArea.length > 0) {
          multiGroupList.forEach(toggleItem => {
            toggleItem.linkGroupId.forEach(linkId => {
              toggleLinkedItems(linkId, history)
            })
            toggleLinkedItems(toggleItem.id, history)
          })
        }
        newGroupSelectList = copyImageList(multiGroupList)
        updateGroupAreaList = copyImageList(multiGroupList)
      }
    }

    if (toggleSelect && item.type === 'unselect-group') {
      toggleLinkedItems(toggleSelect, history)
      const toggleItem = history.filter(historyItem => historyItem.id === toggleSelect)[0]
      toggleItem.linkGroupId.forEach(historyItem => {
        toggleLinkedItems(historyItem, history)
      })
      newGroupSelectList.push({
        id: toggleItem.id,
        linkGroupId: toggleItem.linkGroupId,
        edgeList: toggleItem.data,
        selectPath: item.data,
        ancestorId: toggleItem.ancestorId
      })
    }

    if (item.type === 'delete-group') {
      if (item.groupSelectList.length > 0) {
        newGroupSelectList = [...item.groupSelectList]
        updateGroupAreaList = [...item.groupAreaList]
        updateGroupIds = [...item.groupIds]
      }
    }

    if (item.type === 'ungroup') {
      newGroupSelectList.push(item.groupSelectList)
      updateGroupAreaList.push(item.groupAreaList)
      updateGroupIds = updateGroupIds.concat(item.groupIds)
      toggleLinkedItems(item.ancestorId, history)
    }

    if (item.siblingOperations) {
      for (let i = 0; i < item.siblingOperations.length; i++) {
        helper(item.siblingOperations[i])
      }
    }
    return {
      undoOperations: history,
      redos: redoList,
      newGroupSelectList: newGroupSelectList,
      updateGroupIds: updateGroupIds,
      updateGroupAreaList: updateGroupAreaList,
      updateSelectArea: updateSelectArea,
      deleteAreaList: deleteAreaList
    }
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
  const { imagePathList, redoPathList, selectedArea, groupSelectList, groupAreaList, groupIds, deleteAreaList } = state
  if (!redoPathList.length) {
    return
  }

  const lastItem = redoPathList[redoPathList.length - 1]
  const { history, updateRedoPathList, newGroupSelectList, updateGroupIds, updateGroupAreaList } = handleRedo(lastItem.id, redoPathList, imagePathList, selectedArea, groupSelectList, groupAreaList, groupIds, deleteAreaList)
  return {
    groupIds: updateGroupIds,
    groupAreaList: updateGroupAreaList,
    groupSelectList: newGroupSelectList,
    imagePathList: history,
    redoPathList: updateRedoPathList,
    undoIsEnabled: checkUndoIsEnabled(history),
    redoIsEnabled: updateRedoPathList.length > 0
  }
}

const handleRedo = (itemId, redoPathList, imagePathList, selectedArea, groupSelectList, groupAreaList, groupIds, deleteAreaList) => {
  let history = copyImageList(imagePathList)
  let redoList = copyImageList(redoPathList)
  let newGroupSelectList = copyImageList(groupSelectList)
  let updateGroupAreaList = copyImageList(groupAreaList)
  let updateGroupIds = [...groupIds]

  const helper = (itemId) => {
    const item = redoList.filter(historyItem => historyItem.id === itemId)[0]
    if (!item) {
      return
    }
    history.push(item)
    redoList = redoList.filter(historyItem => historyItem.id !== itemId)
    const linkedItems = item.linkedOperation
    const toggleSelect = item.toggleSelectId
    if (linkedItems) {
      toggleLinkedItems(linkedItems, history)
    }

    if (item.type === 'select') {
      toggleLinkedItems(toggleSelect, history)
      selectedArea.push({
        id: item.id,
        edgeList: item.data,
        selectPath: item.redoPath
      })
    }

    if (item.type === 'unselect') {
      toggleLinkedItems(toggleSelect, history)
      selectedArea.pop()
    }

    if (item.type === 'select-group' && item.subType !== 'create-group') {
      toggleLinkedItems(toggleSelect, history)
      item.linkGroupId.forEach(historyItem => {
        toggleLinkedItems(historyItem, history)
      })
      newGroupSelectList.push({
        id: item.id,
        linkGroupId: item.linkGroupId,
        edgeList: item.data,
        selectPath: item.redoPath
      })
    }

    if (item.subType && item.subType === 'create-group') {
      updateGroupIds = [...updateGroupIds.concat(item.linkGroupId)]
      updateGroupAreaList = copyImageList(item.groupAreaList)
      newGroupSelectList.push({
        id: item.id,
        linkGroupId: item.linkGroupId,
        edgeList: item.data,
        selectPath: item.redoPath
      })
    }

    if (toggleSelect && item.type === 'unselect-group') {
      toggleLinkedItems(toggleSelect, history)
      const groupItem = newGroupSelectList.pop()
      if (groupItem !== undefined && groupItem.length !== 0) {
        groupItem.linkGroupId.forEach(historyItem => {
          toggleLinkedItems(historyItem, history)
        })
      }
    }

    if (item.type === 'delete') {
      deleteAreaList.push({
        id: item.id,
        data: item.data
      })
    }

    if (item.type === 'ungroup') {
      const selectArea = newGroupSelectList.pop()
      updateGroupAreaList.pop()
      updateGroupIds = updateGroupIds.filter(id => {
        return !selectArea.linkGroupId.includes(id)
      })
      toggleLinkedItems(item.ancestorId, history)
    }

    if (item.siblingOperations) {
      for (let i = 0; i < item.siblingOperations.length; i++) {
        helper(item.siblingOperations[i])
      }
    }
    return {
      updateRedoPathList: redoList,
      history: history,
      newGroupSelectList: newGroupSelectList,
      updateGroupIds: updateGroupIds,
      updateGroupAreaList: updateGroupAreaList
    }
  }
  return helper(itemId)
}

export const checkUndoIsEnabled = (imagePathList: Object[]) => {
  const eligbleImagePaths = imagePathList.filter(imagePath => !imagePath.excludeFromHistory)

  return eligbleImagePaths.length > 0
}
