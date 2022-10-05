import { combineReducers } from 'redux'
import { LIVEPALETTE, SCENE_METADATA } from '../storageProperties'
// eslint-disable-next-line no-unused-vars
import { reducerWithLocalStorage } from '../withStorage'
import { colors } from './colors/index'
import collectionSummaries from './collectionSummaries'
import { configurations } from './configurations'
import defaultRoute from './defaultRoute'
import expertColorPicks from './expertColorPicks'
import { fastMaskImageUrl, fastMaskIsPolluted,fastMaskOpenCache, fastMaskRefDims, fastMaskSaveCache } from './fastMask'
import { modalInfo, modalThumbnailColor } from './globalModal'
import inspirationalPhotos from './inspirationalPhotos'
import { language } from './language'
import { lp } from './live-palette'
import { savingMasks } from './masks'
import { matchPhotoImage, matchPhotoImageDims } from './matchPhoto'
import {
  activeSceneLabel,
  allowNavigateToIntendedDestination,
  carouselCache,
  dirtyNavigationIntent,
  forwardIntent,
  imageRotateBypass,
  isColorwallModallyPresented,
  isMatchPhotoPresented,
  navigationIntent,
  navigationReturnIntent,
  paintSceneCache,
  scenePolluted,
  shouldShowGlobalDestroyWarning} from './navigation'
import { paintSceneWorkspace } from './paintSceneWorkspace'
import {
  cachedSceneData,
  colorsForSurfacesFromSavedScene,
  isLoadingSavedScene,
  isWaitingToFetchSavedScenes,
  legacySavedScenesMetadata,
  paintSceneLayersForSave,
  saveSceneName,
  sceneMetadata,
  scenesAndRegions,
  selectedSavedLivePaletteId,
  selectedSavedSceneId,
  selectedStockSceneId,
  shouldShowPaintSceneSavedModal,
  shouldTriggerPaintScenePublishLayers,
  showDeleteConfirmModal,
  showSavedConfirmModal,
  showSavedCustomSceneSuccess,
  showSaveSceneModal,
  variantStockSceneNameFromSave
} from './savedScenes'
import {
  activeSceneKey,
  globalColorDetailColor,
  scenesCollection,
  selectedSceneUid,
  selectedVariantName,
  variantsCollection,
  variantsLoading} from './scenes'
import { initializingFacetId, maxSceneHeight } from './system'
import { systemMessages } from './systemMessages'
import { ingestedImageMetadata, queuedImageUpload, uploads } from './uploads'
import { user } from './user'

export default combineReducers({
  collectionSummaries,
  colors,
  configurations,
  defaultRoute,
  expertColorPicks,
  inspirationalPhotos,
  language,
  lp: reducerWithLocalStorage(lp, LIVEPALETTE),
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
  queuedImageUpload,
  systemMessages,
  maxSceneHeight,
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
  isColorwallModallyPresented,
  shouldShowGlobalDestroyWarning,
  dirtyNavigationIntent,
  // new style scene data
  scenesCollection,
  variantsLoading,
  variantsCollection,
  selectedSceneUid,
  ingestedImageMetadata,
  forwardIntent,
  modalInfo,
  modalThumbnailColor,
  matchPhotoImage,
  matchPhotoImageDims,
  selectedVariantName,
  // this is so that paint scene knows to publish its layers for save
  shouldTriggerPaintScenePublishLayers,
  paintSceneLayersForSave,
  // used to show match photo warning
  // @todo modal logic could be simplified by 'screen presented concept' refactor to know what screen is shown. -RS
  isMatchPhotoPresented,
  shouldShowPaintSceneSavedModal,
  variantStockSceneNameFromSave,
  colorsForSurfacesFromSavedScene,
  // needed to ensure data reflow to active scene
  activeSceneKey,
  globalColorDetailColor,
  // used to determine which facet should handle loading
  initializingFacetId,
  fastMaskImageUrl,
  fastMaskRefDims,
  fastMaskSaveCache,
  fastMaskOpenCache,
  fastMaskIsPolluted
})
