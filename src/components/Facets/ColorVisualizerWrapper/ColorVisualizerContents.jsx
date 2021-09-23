// @flow
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route, Redirect, useLocation, useHistory } from 'react-router-dom'
import { ColorCollections } from '../../ColorCollections/ColorCollections'
import ExpertColorPicks from '../../ExpertColorPicks/ExpertColorPicks'
import Help from '../../Help/Help'
import { ColorWallPage } from '../ColorWallFacet'
import ColorDetails from '../ColorDetails/ColorDetails'
import CompareColor from '../../CompareColor/CompareColor'
import InspiredScene from '../../InspirationPhotos/InspiredSceneNavigator'
import LivePalette from '../../LivePalette/LivePalette'
import ColorVisualizerNav from './ColorVisualizerNav/ColorVisualizerNav'
import SampleScenesWrapper from '../../SampleScenes/SampleScenes'
import { hideGlobalModal, setModalThumbnailColor } from '../../../store/actions/globalModal'
import MyIdeasContainer from '../../MyIdeasContainer/MyIdeasContainer'
import MyIdeaPreview from '../../MyIdeaPreview/MyIdeaPreview'
import SaveOptions from '../../SaveOptions/SaveOptions'
import ColorDetailsModal from './ColorDetailsModal/ColorDetailsModal'
import LandingPage from '../../LandingPage/LandingPage'
import { CVWModalManager } from '../../CVWModalManager/CVWModalManager'
import './ColorVisualizer.scss'
import PaintSceneMaskingWrapper from 'src/components/PaintScene/PaintSceneMask'
import { shouldAllowFeature } from '../../../shared/utils/featureSwitch.util'
import { FEATURE_EXCLUSIONS } from '../../../constants/configurations'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { setMaxSceneHeight } from '../../../store/actions/system'
import { SCENE_TYPES, SHOW_LOADER_ONLY_BRANDS } from '../../../constants/globals'
import {
  ACTIVE_SCENE_LABELS_ENUM,
  setActiveSceneLabel,
  setIsColorWallModallyPresented,
  setIsScenePolluted,
  stageNavigationReturnIntent,
  setNavigationIntent, clearNavigationIntent, setIsMatchPhotoPresented, cacheCarousel
} from '../../../store/actions/navigation'
import { ROUTES_ENUM, SHOW_ACTIVE_SCENE } from './routeValueCollections'
import SceneBlobLoader from '../../SceneBlobLoader/SceneBlobLoader'
import {
  fetchRemoteScenes, handleScenesFetchedForCVW, handleScenesFetchErrorForCVW,
  setSelectedSceneUid,
  setVariantsCollection,
  setSelectedVariantName,
  setVariantsLoading
} from '../../../store/actions/loadScenes'
import SingleTintableSceneView from '../../SingleTintableSceneView/SingleTintableSceneView'
import SceneSelectorNavButton from '../../SingleTintableSceneView/SceneSelectorNavButton'
import { SCENES_ENDPOINT } from '../../../constants/endpoints'
import ImageIngestView from '../../ImageIngestView/ImageIngestView'
import PaintScene from '../../PaintScene/PaintScene'
import { setLayersForPaintScene, WORKSPACE_TYPES } from '../../../store/actions/paintScene'
import type { MiniColor, ReferenceDimensions } from '../../../shared/types/Scene'
import MatchPhotoContainer from '../../MatchPhoto/MatchPhotoContainer'
import { setImageForMatchPhoto, setImageDimsForMatchPhoto } from '../../../store/actions/matchPhoto'
import { setIngestedImage } from '../../../store/actions/user-uploads'
import { SCENE_TYPE } from '../../../store/actions/persistScene'
import {
  createMatchPhotoNavigationWarningModal,
  createNavigationWarningModal,
  createSavedNotificationModal
} from '../../CVWModalManager/createModal'
import { useIntl } from 'react-intl'
import { MODAL_TYPE_ENUM } from '../../CVWModalManager/constants'
import { hydrateStockSceneFromSavedData } from '../../../store/actions/stockScenes'
import { setActiveSceneKey } from '../../../store/actions/scenes'
import { toggleCompareColor } from '../../../store/actions/live-palette'
import {
  setFastMaskIsPolluted,
  setFastMaskOpenCache,
  setFastMaskSaveCache,
  setImageForFastMask,
  setRefsDimsForFastMask
} from '../../../store/actions/fastMask'
import FastMaskView from '../../FastMask/FastMaskView'
import type { FastMaskWorkspace } from '../../FastMask/FastMaskView'
import debounce from 'lodash/debounce'

export type CVWPropsType = {
  alwaysShowColorFamilies?: boolean,
  colorWallBgColor?: string,
  defaultRoute?: string,
  language: string,
  maxSceneHeight: number
}

const CVW = (props: CVWPropsType) => {
  const { alwaysShowColorFamilies, colorWallBgColor, defaultRoute, language, maxSceneHeight } = props
  const dispatch = useDispatch()
  const location = useLocation()
  const { pathname } = location
  const history = useHistory()
  const toggleCompareColorFlag: boolean = useSelector(store => store.lp.toggleCompareColor)
  const colorDetailsModalShowing: boolean = useSelector(store => store.colors.colorDetailsModal.showing)
  const isPaintSceneCached: boolean = useSelector(store => !!store.paintSceneCache)
  const navigationIntent: string = useSelector(store => store.navigationIntent)
  const navigationReturnIntent: string = useSelector(store => store.navigationReturnIntent)
  const scenes = useSelector(store => store.scenesCollection)
  const variants = useSelector(store => store.variantsCollection)
  const isShowFooter = pathname.match(/active\/masking$/) === null
  const { brandId, cvw, featureExclusions } = useContext(ConfigurationContext)
  const { title } = cvw?.palette ?? {}
  const activeSceneLabel = useSelector(store => store.activeSceneLabel)
  const wrapperRef = useRef()
  const ingestedImageUrl = useSelector(store => store.ingestedImageUrl)
  const shouldShowGlobalDestroyWarning = useSelector(store => store.shouldShowGlobalDestroyWarning)
  const paintSceneWorkspace = useSelector(store => store.paintSceneWorkspace)
  const activeColor = useSelector(store => store.lp.activeColor)
  // to do reafactor
  const [variantsCollection, scenesCollection, selectedSceneUid] = useSelector(store => [store.variantsCollection, store.scenesCollection, store.selectedSceneUid])
  const unorderedColors = useSelector(state => state.colors.unorderedColors)
  const matchPhotoImage = useSelector(store => store.matchPhotoImage)
  const [wrapperDims, setWrapperDims] = useState(0)
  const matchPhotoImageDims = useSelector(store => store.matchPhotoImageDims)
  const savedSurfaceColors = useSelector(store => store.colorsForSurfacesFromSavedScene)
  const allowNavigateToIntendedDestination = useSelector(store => store.allowNavigateToIntendedDestination)
  const isColorwallModallyPresented = useSelector(store => store.isColorwallModallyPresented)
  const isActiveScenePolluted = useSelector(store => store.scenePolluted)
  const isMatchPhotoPresented = useSelector(store => store.isMatchPhotoPresented)
  const shouldShowPaintSceneSavedModal = useSelector(store => store.shouldShowPaintSceneSavedModal)
  const [activeStockSceneColorsFromSave, activeVariantStockSceneNameFromSave] = useSelector(store => [store.colorsForSurfacesFromSavedScene, store.variantStockSceneNameFromSave])
  const intl = useIntl()
  const activeSceneKey = useSelector(store => store.activeSceneKey)
  const lpColors = useSelector(store => store.lp.colors)
  const lpCompareColorIds = useSelector(store => store.lp.compareColorsId)
  const selectedVariantName = useSelector(store => store.selectedVariantName)
  const fastMaskRefDims = useSelector(store => store.fastMaskRefDims)
  const fastMaskImageUrl = useSelector(store => store.fastMaskImageUrl)
  const fastMaskSaveCache = useSelector(store => store.fastMaskSaveCache)
  const fastMaskOpenCache = useSelector(store => store.fastMaskOpenCache)
  const dirtyNavigationIntent = useSelector(store => store.dirtyNavigationIntent)
  const isFastMaskPolluted = useSelector(store => store.fastMaskIsPolluted)

  const getAndSetWrapperDims = () => {
    const dims = wrapperRef.current.getBoundingClientRect()
    setWrapperDims(dims)
  }

  const resizeHandler = debounce((e: SyntheticEvent) => {
    getAndSetWrapperDims()
  }, 50)

  // Use this hook to push any facet level embedded data to redux and handle any initialization
  useEffect(() => {
    dispatch(setMaxSceneHeight(maxSceneHeight))
    dispatch(setActiveSceneLabel(ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE))
    fetchRemoteScenes(brandId, { language }, SCENES_ENDPOINT, handleScenesFetchedForCVW, handleScenesFetchErrorForCVW, dispatch)

    // handle resize for components that need to manually scale/resize elements
    window.addEventListener('resize', resizeHandler)

    return () => window.removeEventListener('resize', resizeHandler)
  }, [])

  // used to programmatically show modals
  useEffect(() => {
    if (shouldShowPaintSceneSavedModal) {
      dispatch(hideGlobalModal())
      dispatch(createSavedNotificationModal(intl))
    }
  }, [shouldShowPaintSceneSavedModal])

  // this logic is the app level observer of paintscene cache, used to help direct navigation to the color wall and set it up to return
  // THIS IS ONLY UTILIZED BY FLOWS THAT HAVE RETURN PATHS!!!!!!!

  // Exit here if fast mask is present, should use modal to resolve
  useEffect(() => {
    if (isFastMaskPolluted) {
      if (navigationIntent === ROUTES_ENUM.COLOR_WALL) {
        dispatch(createNavigationWarningModal(intl, MODAL_TYPE_ENUM.FAST_MASK, false))
      }
      return
    }

    // Whenever we navigate update the wrapper dimensions
    if (wrapperRef.current) {
      // this should allow us to pass by prop drilling to any comps that need to do math base don the box dims
      getAndSetWrapperDims()
    }

    // THE ORDER OF THESE RULES MATTERS!!!
    if (isActiveScenePolluted) {
      // This prevents unimpeded navigation when the colorwall is modally presented over a polluted scene.
      if (dirtyNavigationIntent) {
        dispatch(createNavigationWarningModal(intl, MODAL_TYPE_ENUM.NULL, true))
        return
      }
      // We can only programmatically navigate if we are going to the colorwall... when scene is polluted
      if ([ROUTES_ENUM.COLOR_WALL, ROUTES_ENUM.ACTIVE].indexOf(navigationIntent) === -1) {
        return
      }
    }
    // This covers when add a color is clicked from match photo
    if (isMatchPhotoPresented && navigationIntent) {
      dispatch(setNavigationIntent(navigationIntent))
      dispatch(createMatchPhotoNavigationWarningModal(intl, false))
      return
    }

    // Set return intent for color wall rule
    if (navigationIntent === ROUTES_ENUM.COLOR_WALL &&
      ((activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE) ||
        activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE) && navigationReturnIntent) {
      history.push(navigationIntent)
      // tell app that color wall is visible modally, the parent condition assures this will evaluate to true in the action
      dispatch(setIsColorWallModallyPresented(navigationReturnIntent))
      // Return intent should be set already, if not something is violating the data lifecycle
      // this pushed the return intent into the nav intent slot
      dispatch(stageNavigationReturnIntent(navigationReturnIntent))
      return
    }

    // paint a photo drop down rules
    if (navigationIntent === ROUTES_ENUM.SCENES) {
      if (activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE) {
        if (shouldShowGlobalDestroyWarning) {
          return
        }
        history.push(navigationIntent)
      }
      return
    }

    if (navigationIntent === ROUTES_ENUM.ACTIVE_PAINT_SCENE) {
      // navigate from upload screen to image rotate screen
      history.push(navigationIntent)
      dispatch(clearNavigationIntent())
      return
    }

    if (navigationIntent === ROUTES_ENUM.UPLOAD_MATCH_PHOTO) {
      history.push(navigationIntent)
      dispatch(clearNavigationIntent())
    }
    // This handles routing back from the color wall.
    if (allowNavigateToIntendedDestination && navigationIntent && !isColorwallModallyPresented) {
      history.push(navigationIntent)
      dispatch(clearNavigationIntent())
    }
  }, [isPaintSceneCached,
    navigationIntent,
    dirtyNavigationIntent,
    navigationReturnIntent,
    activeSceneLabel,
    shouldShowGlobalDestroyWarning,
    ingestedImageUrl,
    allowNavigateToIntendedDestination,
    isColorwallModallyPresented,
    isMatchPhotoPresented,
    isActiveScenePolluted])

  if (!window.localStorage.getItem('landingPageShownSession') && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.splashScreen) && SHOW_LOADER_ONLY_BRANDS.indexOf(brandId) < 0) {
    return <LandingPage />
  }

  const handleSurfacePaintedState = (selectedSceneUid: string, variantName: string, surfaceColors: MiniColor[]) => {
    const isScenePolluted = !!surfaceColors.reduce((acc, curr) => (curr ? 1 : 0) + acc, 0)
    dispatch(hydrateStockSceneFromSavedData())
    dispatch(setIsScenePolluted(isScenePolluted ? 'POLLUTED_STOCK_SCENE' : ''))
    dispatch(setModalThumbnailColor(surfaceColors))
    dispatch(setSelectedVariantName(variantName))
  }

  const setPaintScenePolluted = () => {
    dispatch(setIsScenePolluted('POLLUTED_PAINT_SCENE'))
  }

  const shouldHideSceneManagerDiv = (path: string) => {
    return SHOW_ACTIVE_SCENE.indexOf(path) === -1
  }

  // This callback initializes all of the scene data
  const handleSceneSurfacesLoaded = (variants) => {
    dispatch(setVariantsCollection(variants))
    // Default to the first room type for the CVW.
    const variant = variants.filter(variant => variant.sceneType === SCENE_TYPES.ROOM)[0]
    // When this value is set it can be used as a flag that the cvw has initialized the scene data
    dispatch(setSelectedSceneUid(variant.sceneUid))
    dispatch(setSelectedVariantName(variant.variantName))
    dispatch(setVariantsLoading(false))
  }

  const handleSceneBlobLoaderError = (err) => {
    dispatch(err)
  }

  const handleBlobLoaderInit = () => {
    dispatch(setVariantsLoading(true))
  }

  const navigateToSceneSelector = (e: SyntheticEvent) => {
    if (isActiveScenePolluted) {
      dispatch(setNavigationIntent(ROUTES_ENUM.USE_OUR_IMAGE))
      dispatch(createNavigationWarningModal(intl, MODAL_TYPE_ENUM.STOCK_SCENE, false))
      return
    }

    history.push(ROUTES_ENUM.USE_OUR_IMAGE)
  }

  const handleSceneSelection = (sceneUid: string, carouselCacheData: number[]) => {
    dispatch(setActiveSceneKey())
    dispatch(cacheCarousel(carouselCacheData))
    dispatch(setSelectedSceneUid(sceneUid))
    dispatch(setActiveSceneLabel(ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE))
    history.push('/active')
  }

  const openSceneFromMyIdeasPreview = (sceneType: string) => {
    let sceneLabel = ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE
    let route = ROUTES_ENUM.ACTIVE

    if (sceneType === SCENE_TYPE.anonCustom) {
      sceneLabel = ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE
    }

    if (sceneType === SCENE_TYPE.anonFastMask) {
      route = ROUTES_ENUM.ACTIVE_FAST_MASK
    }

    dispatch(setActiveSceneLabel(sceneLabel))
    history.push(route)
  }

  const goToPaintScene = (imageUrl: string, width: number, height: number, refDims: ReferenceDimensions) => {
    if (!imageUrl) {
      history.push(ROUTES_ENUM.ACTIVE)
      return
    }

    dispatch(setLayersForPaintScene(imageUrl, [], [], width, height, WORKSPACE_TYPES.generic, 0, '', []))
    dispatch(setActiveSceneLabel(ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE))
    history.push(ROUTES_ENUM.ACTIVE)
  }

  const goToMatchPhoto = (imageUrl: string, width: number, height: number, refDims: ReferenceDimensions) => {
    if (!imageUrl) {
      history.push(ROUTES_ENUM.ACTIVE)
      return
    }

    dispatch(setImageForMatchPhoto(imageUrl))
    dispatch(setImageDimsForMatchPhoto(refDims))
    dispatch(setIsMatchPhotoPresented(true))
    history.push(ROUTES_ENUM.ACTIVE_MATCH_PHOTO)
  }

  const cleanupStaleIngestedImage = () => {
    try {
      URL.revokeObjectURL(ingestedImageUrl)
      setImageForMatchPhoto()
      dispatch(setIngestedImage())
    } catch (e) {
      console.warn(`Url specified could not be revoked: ${e.message}`)
    }
  }

  const handleToggleCompare = () => {
    dispatch(toggleCompareColor())
  }

  const setPaintSceneData = (data: any) => {
    // @todo determine if this is still needed -RS
  }

  const goToFastMask = (imageUrl: string, width: number, height: number, refDims: ReferenceDimensions) => {
    if (!imageUrl) {
      history.push(ROUTES_ENUM.ACTIVE)
      return
    }

    dispatch(setImageForFastMask(imageUrl))
    dispatch(setRefsDimsForFastMask(refDims))
    history.push(ROUTES_ENUM.ACTIVE_FAST_MASK)
  }

  const handleFastMaskData = (data: FastMaskWorkspace) => {
    dispatch(setFastMaskSaveCache(data))
  }

  const cleanupFastMask = () => {
    if (fastMaskSaveCache) {
      URL.revokeObjectURL(fastMaskSaveCache.image)
      fastMaskSaveCache.surfaces.forEach(surface => URL.revokeObjectURL(surface))
      dispatch(setFastMaskSaveCache())
    }

    if (fastMaskOpenCache) {
      dispatch(setFastMaskOpenCache())
    }

    dispatch(setFastMaskIsPolluted())
  }

  const fastMaskInit = () => {
    dispatch(setFastMaskIsPolluted(!!fastMaskImageUrl))
  }

  return (
    <>
      <>
        {scenes ? <SceneBlobLoader
          scenes={scenes}
          variants={variants}
          initHandler={handleBlobLoaderInit}
          handleBlobsLoaded={handleSceneSurfacesLoaded}
          handleError={handleSceneBlobLoaderError} /> : null}
        <CVWModalManager />
        <ColorDetailsModal />
        <div style={{ display: toggleCompareColorFlag ? 'block' : 'none' }}>
          {toggleCompareColorFlag && <CompareColor
            toggleCompareColor={handleToggleCompare}
            colors={lpColors}
            colorIds={lpCompareColorIds}
            scenesCollection={scenesCollection}
            variantsCollection={variantsCollection}
            selectedSceneUid={selectedSceneUid}
            selectedVariantName={selectedVariantName} />}
        </div>
        <div style={{ display: toggleCompareColorFlag ? 'none' : 'block' }} className={`cvw__root-wrapper${colorDetailsModalShowing ? ' hide-on-small-screens' : ''}`} ref={wrapperRef}>
          <ColorVisualizerNav />
          <Switch>
            <Route path={ROUTES_ENUM.COLOR_DETAILS} render={() => <ColorDetails />} />
            <Route path={`${ROUTES_ENUM.COLOR_WALL}(/.*)?`} render={() => <ColorWallPage alwaysShowColorFamilies={alwaysShowColorFamilies} colorWallBgColor={colorWallBgColor} displayAddButton displayInfoButton displayDetailsLink={false} />} />
            <Route path={ROUTES_ENUM.COLOR_COLLECTION} render={() => <ColorCollections isExpertColor={false} {...location.state} />} />
            <Route path={ROUTES_ENUM.UPLOAD_FAST_MASK} render={() => <ImageIngestView cleanupCallback={cleanupStaleIngestedImage} handleDismissCallback={goToFastMask} imageUrl={ingestedImageUrl} maxSceneHeight={maxSceneHeight} closeLink={ROUTES_ENUM.ACTIVE} />} />
            <Route path={ROUTES_ENUM.UPLOAD_MATCH_PHOTO} render={() => <ImageIngestView cleanupCallback={cleanupStaleIngestedImage} handleDismissCallback={goToMatchPhoto} imageUrl={ingestedImageUrl} maxSceneHeight={maxSceneHeight} closeLink={ROUTES_ENUM.ACTIVE} />} />
            <Route path={ROUTES_ENUM.UPLOAD_PAINT_SCENE} render={() => <ImageIngestView cleanupCallback={cleanupStaleIngestedImage} handleDismissCallback={goToPaintScene} imageUrl={ingestedImageUrl} maxSceneHeight={maxSceneHeight} closeLink={ROUTES_ENUM.ACTIVE} />} />
            <Route path={ROUTES_ENUM.ACTIVE_MATCH_PHOTO} render={() => <MatchPhotoContainer colors={unorderedColors} imageUrl={matchPhotoImage} imageDims={matchPhotoImageDims} maxSceneHeight={maxSceneHeight} scalingWidth={wrapperDims.width} />} />
            <Route path={ROUTES_ENUM.USE_OUR_IMAGE} render={() => <SampleScenesWrapper activateScene={handleSceneSelection} />} />
            <Route path={ROUTES_ENUM.EXPERT_COLORS} render={() => <ExpertColorPicks isExpertColor />} />
            <Route path={ROUTES_ENUM.COLOR_FROM_IMAGE} render={() => <InspiredScene />} />
            <Route path={ROUTES_ENUM.PAINT_PHOTO} render={() => <SampleScenesWrapper isColorTinted activateScene={handleSceneSelection} />} />
            <Route path={ROUTES_ENUM.MY_IDEAS_PREVIEW} render={() => <MyIdeaPreview maxSceneHeight={maxSceneHeight} openScene={openSceneFromMyIdeasPreview} />} />
            <Route path={ROUTES_ENUM.MASKING} render={() => <PaintSceneMaskingWrapper />} />
            <Route path={ROUTES_ENUM.ACTIVE_MYIDEAS} render={() => <MyIdeasContainer />} />
            <Route path={ROUTES_ENUM.HELP} render={() => <Help />} />
            <Route path={ROUTES_ENUM.ACTIVE_FAST_MASK} render={() => <FastMaskView
              handleBlobLoaderError={handleSceneBlobLoaderError}
              initHandler={fastMaskInit}
              refDims={fastMaskRefDims}
              imageUrl={fastMaskImageUrl}
              activeColor={activeColor}
              savedData={fastMaskOpenCache}
              cleanupCallback={cleanupFastMask}
              handleUpdates={handleFastMaskData} />} />
            {defaultRoute && (!pathname || pathname === '/') ? <Redirect to={defaultRoute} /> : null}
          </Switch>
          <div
            /* This div has multiple responsibilities in the DOM tree. It cannot be removed, moved, or changed without causing regressions. */
            style={{ display: shouldHideSceneManagerDiv(location.pathname) ? 'none' : 'block' }}
          >
            {activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE ? <SingleTintableSceneView
              key={activeSceneKey}
              allowVariantSwitch
              showClearButton
              interactive
              surfaceColorsFromParents={savedSurfaceColors}
              selectedSceneUid={selectedSceneUid}
              variantsCollection={variantsCollection}
              scenesCollection={scenesCollection}
              selectedVariantName={activeVariantStockSceneNameFromSave}
              surfaceColorsFromParent={activeStockSceneColorsFromSave}
              handleSurfacePaintedState={handleSurfacePaintedState}
              customButton={<SceneSelectorNavButton clickHandler={navigateToSceneSelector} />} /> : paintSceneWorkspace // workspace should be cleared on unmount!
              ? <PaintScene
                // This ensures that the comp remounts and doesn't try to rerender with dirty data!
                key={paintSceneWorkspace.uid}
                maxSceneHeight={maxSceneHeight}
                workspace={paintSceneWorkspace}
                lpActiveColor={activeColor}
                setPaintSceneSaveData={setPaintSceneData}
                width={wrapperDims.width}
                setActiveScenePolluted={setPaintScenePolluted} /> : null}
          </div>
        </div>
      </>
      {
        isShowFooter && <div className={`cvw__root-container__footer${colorDetailsModalShowing ? ' hide-on-small-screens' : ''}`}>
          <div className='cvw__root-container__footer--priority'>
            <LivePalette />
          </div>
          <div className='cvw__root-container__footer--secondary'>
            {title && <div className='cvw__root-container__footer--secondary--title'>{title}</div>}
            <SaveOptions />
          </div>
        </div>
      }
    </>
  )
}

export default CVW
