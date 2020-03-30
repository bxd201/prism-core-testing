// @flow
import type { Scene } from '../types/Scene'
import cloneDeep from 'lodash/cloneDeep'

export const replaceSceneStatus = (scene: Scene, savedStatus: Object): Scene => {
  if (scene && savedStatus) {
    const sceneCopy = cloneDeep(scene)
    const sceneType = savedStatus.expectStockData.sceneFetchType
    const foundSceneType = sceneCopy.sceneStatus[sceneType]

    if (foundSceneType) {
      foundSceneType.some((foundSceneStatus, i) => {
        if (foundSceneStatus.id === savedStatus.expectStockData.scene.id) {
          foundSceneType[i] = {
            id: savedStatus.expectStockData.scene.id,
            variant: savedStatus.expectStockData.scene.variant,
            surfaces: savedStatus.expectStockData.scene.surfaces
          }
          return true
        }
      })

      return cloneDeep(sceneCopy)
    }
  }

  return scene
}

export const getFirebaseListItemPaths = (data: Object) => {
  let paths = []

  if (data && data.items) {
    paths = data.items.map(item => {
      if (item.location && item.location.path_) {
        return item.location.path_
      } else {
        console.warn('The storage API may be out of date.')
      }
    })
  }

  return paths
}
