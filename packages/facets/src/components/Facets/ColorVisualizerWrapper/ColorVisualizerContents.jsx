// @flow
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch,useSelector } from 'react-redux'
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import debounce from 'lodash/debounce'
import * as GA from 'src/analytics/GoogleAnalytics'
import PaintSceneMaskingWrapper from 'src/components/PaintScene/PaintSceneMask'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { FEATURE_EXCLUSIONS } from '../../../constants/configurations'
import { SCENES_ENDPOINT } from '../../../constants/endpoints'
import { SCENE_TYPES } from '../../../constants/globals'
import type { MiniColor, ReferenceDimensions } from '../../../shared/types/Scene'
import { shouldAllowFeature } from '../../../shared/utils/featureSwitch.util'
import { setDefaultRoute } from '../../../store/actions/defaultRoute'
import {
  setFastMaskIsPolluted,
  setFastMaskOpenCache,
  setFastMaskSaveCache,
  setImageForFastMask,
  setRefsDimsForFastMask
} from '../../../store/actions/fastMask'
import { hideGlobalModal, setModalThumbnailColor } from '../../../store/actions/globalModal'
import { toggleCompareColor } from '../../../store/actions/live-palette'
import {
  fetchRemoteScenes,
  handleScenesFetchedForCVW,
  handleScenesFetchErrorForCVW,
  setSelectedSceneUid,
  setSelectedVariantName,
  setVariantsCollection,
  setVariantsLoading
} from '../../../store/actions/loadScenes'
import { setImageDimsForMatchPhoto,setImageForMatchPhoto } from '../../../store/actions/matchPhoto'
import {
  ACTIVE_SCENE_LABELS_ENUM,
  cacheCarousel,
  clearNavigationIntent,
  setActiveSceneLabel,
  setIsColorWallModallyPresented,
  setIsMatchPhotoPresented,
  setIsScenePolluted,
  setNavigationIntent,
  stageNavigationReturnIntent
} from '../../../store/actions/navigation'
import { setLayersForPaintScene, WORKSPACE_TYPES } from '../../../store/actions/paintScene'
import { SCENE_TYPE } from '../../../store/actions/persistScene'
import { setActiveSceneKey } from '../../../store/actions/scenes'
import { hydrateStockSceneFromSavedData } from '../../../store/actions/stockScenes'
import { setMaxSceneHeight } from '../../../store/actions/system'
import { setIngestedImage } from '../../../store/actions/user-uploads'
import { ColorCollections } from '../../ColorCollections/ColorCollections'
import CompareColor from '../../CompareColor/CompareColor'
import { DANGER, MODAL_TYPE_ENUM, PRIMARY } from '../../CVWModalManager/constants'
import {
  createMatchPhotoNavigationWarningModal,
  createNavigationWarningModal,
  createSavedNotificationModal
} from '../../CVWModalManager/createModal'
import { CVWModalManager } from '../../CVWModalManager/CVWModalManager'
import ExpertColorPicks from '../../ExpertColorPicks/ExpertColorPicks'
import type { FastMaskWorkspace } from '../../FastMask/FastMaskView'
import FastMaskView from '../../FastMask/FastMaskView'
import Help from '../../Help/Help'
import ImageIngestView from '../../ImageIngestView/ImageIngestView'
import InspiredScene from '../../InspirationPhotos/InspiredSceneNavigator'
import LandingPage from '../../LandingPage/LandingPage'
import LivePaletteWrapper from '../../LivePalette/LivePaletteWrapper'
import MatchPhotoContainer from '../../MatchPhoto/MatchPhotoContainer'
import MyIdeaPreview from '../../MyIdeaPreview/MyIdeaPreview'
import MyIdeasContainer from '../../MyIdeasContainer/MyIdeasContainer'
import PaintScene from '../../PaintScene/PaintScene'
import SampleScenesWrapper from '../../SampleScenes/SampleScenes'
import SaveOptions from '../../SaveOptions/SaveOptions'
import SceneBlobLoader from '../../SceneBlobLoader/SceneBlobLoader'
import SceneSelectorNavButton from '../../SingleTintableSceneView/SceneSelectorNavButton'
import SingleTintableSceneView from '../../SingleTintableSceneView/SingleTintableSceneView'
import ColorDetails from '../ColorDetails/ColorDetails'
import { ColorWallPage } from '../ColorWallFacet'
import ColorDetailsModal from './ColorDetailsModal/ColorDetailsModal'
import ColorVisualizerNav from './ColorVisualizerNav/ColorVisualizerNav'
import { ROUTES_ENUM, SHOW_ACTIVE_SCENE } from './routeValueCollections'
import './ColorVisualizer.scss'

export type CVWPropsType = {
  alwaysShowColorFamilies?: boolean,
  colorWallBgColor?: string,
  defaultRoute?: string,
  language: string,
  maxSceneHeight: number,
  routeType: string
}

const CVW = (props: CVWPropsType) => {
  const { alwaysShowColorFamilies, colorWallBgColor, defaultRoute, language, maxSceneHeight, routeType } = props
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
  const { brandId, cvw = {}, featureExclusions } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { palette = {}, modal = {} } = cvw
  const { danger = true } = modal
  const { title } = palette
  const activeSceneLabel = useSelector(store => store.activeSceneLabel)
  const wrapperRef = useRef()
  const { ingestedImageMetadata } = useSelector(store => store)
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
  const modalStyleType = danger ? DANGER : PRIMARY

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
    defaultRoute && dispatch(setDefaultRoute(defaultRoute))

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
        dispatch(createNavigationWarningModal(intl, MODAL_TYPE_ENUM.FAST_MASK, false, modalStyleType))
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
        dispatch(createNavigationWarningModal(intl, MODAL_TYPE_ENUM.NULL, true, modalStyleType))
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
      dispatch(createMatchPhotoNavigationWarningModal(intl, false, modalStyleType))
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
    ingestedImageMetadata,
    allowNavigateToIntendedDestination,
    isColorwallModallyPresented,
    isMatchPhotoPresented,
    isActiveScenePolluted])

  if (!window.localStorage.getItem('landingPageShownSession') && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.splashScreen)) {
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
      dispatch(createNavigationWarningModal(intl, MODAL_TYPE_ENUM.STOCK_SCENE, false, modalStyleType))
      return
    }

    history.push(ROUTES_ENUM.USE_OUR_IMAGE)
    GA.event({ category: 'Active Scene', action: 'More Scenes Click', label: 'More Scenes' }, GA_TRACKER_NAME_BRAND[brandId])
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
      history.push(defaultRoute ?? ROUTES_ENUM.ACTIVE)
      return
    }

    dispatch(setLayersForPaintScene(imageUrl, [], [], width, height, WORKSPACE_TYPES.generic, 0, '', []))
    dispatch(setActiveSceneLabel(ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE))
    history.push(ROUTES_ENUM.ACTIVE)
  }

  const goToMatchPhoto = (imageUrl: string, width: number, height: number, refDims: ReferenceDimensions) => {
    if (!imageUrl) {
      history.push(defaultRoute ?? ROUTES_ENUM.ACTIVE)
      return
    }

    dispatch(setImageForMatchPhoto(imageUrl))
    dispatch(setImageDimsForMatchPhoto(refDims))
    dispatch(setIsMatchPhotoPresented(true))
    history.push(ROUTES_ENUM.ACTIVE_MATCH_PHOTO)
  }

  const cleanupStaleIngestedImage = () => {
    try {
      URL.revokeObjectURL(ingestedImageMetadata?.url)
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

  // @todo this is a workaround for a structural bug in the CVW, ideally,
  //  the height of the nav dropdown should be self determining, that is a much BIGGER fix -RS
  function shouldSetDropDownMinHeight () {
    const loc = history.location?.pathname
    if (loc === ROUTES_ENUM.ACTIVE_COLORS || loc === ROUTES_ENUM.INSPIRATION || loc === ROUTES_ENUM.SCENES) {
      return '500px'
    }

    return null
  }

  return (
    <>
      <>
        {scenes
          ? <SceneBlobLoader
          scenes={scenes}
          variants={variants}
          initHandler={handleBlobLoaderInit}
          handleBlobsLoaded={handleSceneSurfacesLoaded}
          handleError={handleSceneBlobLoaderError} />
          : null}
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
        <div style={{ display: toggleCompareColorFlag ? 'none' : 'block', minHeight: shouldSetDropDownMinHeight() }} className={`cvw__root-wrapper${colorDetailsModalShowing ? ' hide-on-small-screens' : ''}`} ref={wrapperRef}>
          <ColorVisualizerNav maxSceneHeight={maxSceneHeight} />
          <Switch>
            {/* this redirects from legacy Angular-style CVW /!/<route> paths */}
            <Route path={'/!/'} render={() => <Redirect to={location.pathname.replace(new RegExp('^/!/'), '/')} />} />
            <Route path={ROUTES_ENUM.COLOR_DETAILS} render={() => <ColorDetails />} />
            <Route path={`${ROUTES_ENUM.COLOR_WALL}(/.*)?`} render={() => <ColorWallPage alwaysShowColorFamilies={alwaysShowColorFamilies} colorWallBgColor={colorWallBgColor} displayAddButton displayInfoButton displayDetailsLink={false} />} />
            <Route path={ROUTES_ENUM.COLOR_COLLECTION} render={() => <ColorCollections isExpertColor={false} {...location.state} />} />
            <Route path={ROUTES_ENUM.UPLOAD_FAST_MASK} render={() => <ImageIngestView cleanupCallback={cleanupStaleIngestedImage} handleDismissCallback={goToFastMask} imageMetadata={ingestedImageMetadata} maxSceneHeight={maxSceneHeight} closeLink={ROUTES_ENUM.ACTIVE} />} />
            <Route path={ROUTES_ENUM.UPLOAD_MATCH_PHOTO} render={() => <ImageIngestView cleanupCallback={cleanupStaleIngestedImage} handleDismissCallback={goToMatchPhoto} imageMetadata={ingestedImageMetadata} maxSceneHeight={maxSceneHeight} closeLink={ROUTES_ENUM.ACTIVE} />} />
            <Route path={ROUTES_ENUM.UPLOAD_PAINT_SCENE} render={() => <ImageIngestView cleanupCallback={cleanupStaleIngestedImage} handleDismissCallback={goToPaintScene} imageMetadata={ingestedImageMetadata} maxSceneHeight={maxSceneHeight} closeLink={ROUTES_ENUM.ACTIVE} />} />
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
        isShowFooter && <div className={'cvw__root-container__footer'}>
          {colorDetailsModalShowing && <div className='cvw__root-container__footer--overlay' />}
          <div className='cvw__root-container__footer--priority'>
            <LivePaletteWrapper routeType={routeType} />
          </div>
          <div className={`cvw__root-container__footer--secondary${colorDetailsModalShowing ? ' hide-on-small-screens' : ''}`}>
            {title && <div className='cvw__root-container__footer--secondary--title'>{title}</div>}
            <SaveOptions />
          </div>
        </div>
      }
    </>
  )
}

export default CVW
