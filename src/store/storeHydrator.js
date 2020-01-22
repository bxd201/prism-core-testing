// @flow
import storageAvailable from '../shared/utils/browserStorageCheck.util'
import { cloudSceneMetadata } from './reducers/savedScenes'
import { CLOUD_SCENE_METADATA } from './storageProperties'

const storeHydrator = () => {
  const store = {}

  // Populate firebase storage info if it exists
  if (storageAvailable('localStorage')) {
    const cloudSceneData = window.localStorage.getItem(CLOUD_SCENE_METADATA)
    if (cloudSceneData) {
      store[CLOUD_SCENE_METADATA] = window.JSON.parse(cloudSceneData)
    } else {
      // If falsey value in local storage get default from reducer since we cannot know if it is valid or not
      store[CLOUD_SCENE_METADATA] = cloudSceneMetadata(void (0), {})
    }
  }

  return store
}

export default storeHydrator
