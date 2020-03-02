// @flow
import storageAvailable from '../shared/utils/browserStorageCheck.util'
import { sceneMetadata } from './reducers/savedScenes'
import { SCENE_METADATA } from './storageProperties'

const storeHydrator = () => {
  const store = {}

  // Populate firebase storage info if it exists
  if (storageAvailable('localStorage')) {
    const localSceneMetadata = window.localStorage.getItem(SCENE_METADATA)
    if (localSceneMetadata) {
      store[SCENE_METADATA] = window.JSON.parse(localSceneMetadata)
    } else {
      // If falsey value in local storage get default from reducer since we cannot know if it is valid or not
      store[SCENE_METADATA] = sceneMetadata(void (0), {})
    }
  }

  return store
}

export default storeHydrator
