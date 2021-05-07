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
  currentWorkspace,
  useSmartMask,
  showEditCustomScene, scenesCollection, variantsCollection, variantsLoading, selectedSceneUid,
  selectedVariantName
} from './scenes'
import { ingestedImageUrl, queuedImageUpload, uploads } from './uploads'
import collectionSummaries from './collectionSummaries'
import expertColorPicks from './expertColorPicks'
import inspirationalPhotos from './inspirationalPhotos'
import { savingMasks } from './masks'
import {
  legacySavedScenesMetadata,
  scenesAndRegions,
  selectedSavedSceneId,
  sceneMetadata,
  isWaitingToFetchSavedScenes,
  cachedSceneData,
  isLoadingSavedScene,
  showSaveSceneModal,
  saveSceneName,
  selectedStockSceneId,
  showSavedConfirmModal,
  showSavedCustomSceneSuccess,
  showDeleteConfirmModal,
  selectedSavedLivePaletteId, colorsForSurfacesFromSavedScene
} from './savedScenes'
import { user } from './user'
import { paintSceneWorkspace } from './paintSceneWorkspace'
// eslint-disable-next-line no-unused-vars
import { reducerWithLocalStorage } from '../withStorage'
import { SCENE_METADATA } from '../storageProperties'
import { systemMessages } from './systemMessages'
import { maxSceneHeight, toolTipsPosition } from './system'
import {
  activeSceneLabel,
  allowNavigateToIntendedDestination, dirtyNavigationIntent, imageRotateBypass, isColorwallModallyPresented,
  navigationIntent, navigationReturnIntent,
  paintSceneCache, carouselCache,
  scenePolluted, shouldShowGlobalDestroyWarning, stockSceneCache, forwardIntent
} from './navigation'
import { modalInfo, modalThumbnailColor } from './globalModal'
import { matchPhotoImage, matchPhotoImageDims } from './matchPhoto'

export default combineReducers({
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
  selectedSavedLivePaletteId,
  paintSceneWorkspace,
  sceneMetadata: reducerWithLocalStorage(sceneMetadata, SCENE_METADATA),
  isWaitingToFetchSavedScenes,
  cachedSceneData,
  isLoadingSavedScene,
  showSaveSceneModal,
  saveSceneName,
  selectedStockSceneId,
  // For scene manager
  showSavedConfirmModal,
  // For paint scene
  showSavedCustomSceneSuccess,
  showDeleteConfirmModal,
  useSmartMask,
  queuedImageUpload,
  systemMessages,
  showEditCustomScene,
  maxSceneHeight,
  toolTipsPosition,
  navigationIntent,
  scenePolluted,
  allowNavigateToIntendedDestination,
  paintSceneCache,
  carouselCache,
  // This is a typed flag that tells the app if the active scene is paint scene, use ours or unset (though I am not sure
  // it can be unset only while the app is bootstrapping.
  activeSceneLabel,
  navigationReturnIntent,
  imageRotateBypass,
  stockSceneCache,
  isColorwallModallyPresented,
  shouldShowGlobalDestroyWarning,
  dirtyNavigationIntent,
  // new style scene data
  scenesCollection,
  variantsLoading,
  variantsCollection,
  selectedSceneUid,
  ingestedImageUrl,
  forwardIntent,
  modalInfo,
  modalThumbnailColor,
  matchPhotoImage,
  matchPhotoImageDims,
  colorsForSurfacesFromSavedScene,
  selectedVariantName
})
