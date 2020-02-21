import { colors } from './colors/index'
import { combineReducers } from 'redux'
import { configurations } from './configurations'
import { lp } from './live-palette'
import { language } from './language'
import {
  scenes,
  currentActiveSceneId,
  currentSurfaceId,
  currentVariant,
  isEditMode,
  sceneWorkspaces,
  currentWorkspace
} from './scenes'
import { uploads } from './uploads'
import collectionSummaries from './collectionSummaries'
import expertColorPicks from './expertColorPicks'
import inspirationalPhotos from './inspirationalPhotos'
import { savingMasks } from './masks'
import {
  legacySavedScenesMetadata,
  scenesAndRegions,
  selectedSavedSceneId,
  cloudSceneMetadata,
  isWaitingToFetchSavedScenes,
  cachedSceneData, isLoadingSavedScene
} from './savedScenes'
import { user } from './user'
import { paintSceneWorkspace } from './paintSceneWorkspace'
// eslint-disable-next-line no-unused-vars
import { reducerWithLocalStorage } from '../withStorage'
import { CLOUD_SCENE_METADATA } from '../storageProperties'
import brandColors from './brandColors'

export default combineReducers({
  brandColors,
  collectionSummaries,
  colors,
  configurations,
  currentActiveSceneId,
  currentSurfaceId,
  currentVariant,
  currentWorkspace,
  expertColorPicks,
  inspirationalPhotos,
  isEditMode,
  language,
  lp,
  scenes,
  sceneWorkspaces,
  uploads,
  savingMasks,
  legacySavedScenesMetadata,
  scenesAndRegions,
  user,
  selectedSavedSceneId,
  paintSceneWorkspace,
  cloudSceneMetadata: reducerWithLocalStorage(cloudSceneMetadata, CLOUD_SCENE_METADATA),
  isWaitingToFetchSavedScenes,
  cachedSceneData,
  isLoadingSavedScene
})
