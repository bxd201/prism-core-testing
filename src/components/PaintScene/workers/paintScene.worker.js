// @flow
import { eraseIntersection } from '../utils'
import remove from 'lodash/remove'
declare var self: DedicatedWorkerGlobalScope
self.addEventListener('message', (e: Object) => {
  const { imagePathList, selectedAreaPath, groupAreaPath, groupSelectList, groupAreaList } = e.data
  const newImageList = eraseIntersection(imagePathList, groupAreaPath)
  const updatePathList = eraseIntersection(newImageList, selectedAreaPath)

  const idsToUngroup = groupSelectList.map((item) => {
    return item.id
  })

  const newGroupAreaList = groupAreaList.filter(item => {
    return (idsToUngroup.indexOf(item.id) === -1)
  })

  const newImagePathList = remove(updatePathList, (currImagePath) => {
    return currImagePath.length !== 0
  })
  self.postMessage({ newImagePathList: newImagePathList, newGroupAreaList: newGroupAreaList })
})
