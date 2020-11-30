// @flow
import storageAvailable from '../shared/utils/browserStorageCheck.util'
import { sceneMetadata } from './reducers/savedScenes'
import { SCENE_METADATA } from './storageProperties'
import { SCENE_TYPE } from './actions/persistScene'
import { ANON_STOCK_SCENE_LIFETIME } from '../constants/globals'

const storeHydrator = () => {
  const store = {}

  // Populate firebase storage info if it exists
  if (storageAvailable('localStorage')) {
    // remove expired anon local stock scenes
    const localSceneMetadata = window.JSON.parse(window.localStorage.getItem(SCENE_METADATA))

    if (localSceneMetadata) {
      const cleanedLocalSceneData = localSceneMetadata.filter((item, i) => {
        if (item.sceneType === SCENE_TYPE.anonStock) {
          return Date.now() - item.updated < ANON_STOCK_SCENE_LIFETIME
        }
        return true
      })

      if (cleanedLocalSceneData.length < localSceneMetadata.length) {
        window.localStorage.setItem(SCENE_METADATA, JSON.stringify(cleanedLocalSceneData))
      }

      store[SCENE_METADATA] = cleanedLocalSceneData
    } else {
      // If falsey value in local storage get default from reducer since we cannot know if it is valid or not
      store[SCENE_METADATA] = sceneMetadata(void (0), {})
    }
  }

  return store
}

export default storeHydrator
