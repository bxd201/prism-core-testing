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
