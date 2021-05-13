// @flow
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route, useLocation, useHistory } from 'react-router-dom'
import { ColorCollections } from '../../ColorCollections/ColorCollections'
import ExpertColorPicks from '../../ExpertColorPicks/ExpertColorPicks'
import Help from '../../Help/Help'
import { ColorWallPage } from '../ColorWallFacet'
import ColorDetails from '../ColorDetails/ColorDetails'
import CompareColor from '../../CompareColor/CompareColor'
import InspiredScene from '../../InspirationPhotos/InspiredSceneNavigator'
import LivePalette from '../../LivePalette/LivePalette'
import ColorVisualizerNav from './ColorVisualizerNav'
import SampleScenesWrapper from '../../SampleScenes/SampleScenes'
import { setModalThumbnailColor } from '../../../store/actions/globalModal'
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
  setNavigationIntent, clearNavigationIntent
} from '../../../store/actions/navigation'
import { ROUTES_ENUM } from './routeValueCollections'
import SceneBlobLoader from '../../SceneManager/SceneBlobLoader'
import {
  fetchRemoteScenes, handleScenesFetchedForCVW, handleScenesFetchErrorForCVW,
  setSelectedSceneUid,
  setVariantsCollection,
  setVariantsLoading
} from '../../../store/actions/loadScenes'
import SingleTintableSceneView from '../../SingleTintableSceneView/SingleTintableSceneView'
import SceneSelectorNavButton from '../../SingleTintableSceneView/SceneSelectorNavButton'
import { SCENES_ENDPOINT } from '../../../constants/endpoints'
import ImageIngestView from '../../MatchPhoto/ImageIngestView'
import { PaintScene } from '../../PaintScene/PaintScene'
import { setLayersForPaintScene, WORKSPACE_TYPES } from '../../../store/actions/paintScene'
import type { MiniColor, ReferenceDimensions } from '../../../shared/types/Scene'
import { useIntl } from 'react-intl'
import MatchPhotoContainer from '../../MatchPhoto/MatchPhotoContainer'
import { setImageForMatchPhoto, setImageDimsForMatchPhoto } from '../../../store/actions/matchPhoto'
import { setIngestedImage } from '../../../store/actions/user-uploads'
import { SCENE_TYPE } from '../../../store/actions/persistScene'

type CVWPropsType = {
  maxSceneHeight: number,
  language: string
}

export const CVW = (props: CVWPropsType) => {
  const { maxSceneHeight, language } = props
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()
  const toggleCompareColor: boolean = useSelector(store => store.lp.toggleCompareColor)
  const colorDetailsModalShowing: boolean = useSelector(store => store.colors.colorDetailsModal.showing)
  // const isActiveScenePolluted: string = useSelector(store => store.scenePolluted)
  const isPaintSceneCached: boolean = useSelector(store => !!store.paintSceneCache)
  const navigationIntent: string = useSelector(store => store.navigationIntent)
  const navigationReturnIntent: string = useSelector(store => store.navigationReturnIntent)
  const scenes = useSelector(store => store.scenesCollection)
  const variants = useSelector(store => store.variantsCollection)
  const isShowFooter = location.pathname.match(/active\/masking$/) === null
  const { featureExclusions, brandId } = useContext(ConfigurationContext)
  const activeSceneLabel = useSelector(store => store.activeSceneLabel)
  const wrapperRef = useRef()
  const ingestedImageUrl = useSelector(store => store.ingestedImageUrl)
  const shouldShowGlobalDestroyWarning = useSelector(store => store.shouldShowGlobalDestroyWarning)
  const paintSceneWorkspace = useSelector(store => store.paintSceneWorkspace)
  const activeColor = useSelector(store => store.lp.activeColor)
  const intl = useIntl()
  const [variantsCollection, scenesCollection, selectedSceneUid] = useSelector(store => [store.variantsCollection, store.scenesCollection, store.selectedSceneUid])
  const [selectedVarName, setSelectedVarName] = useState('')
  const unorderedColors = useSelector(state => state.colors.unorderedColors)
  const matchPhotoImage = useSelector(store => store.matchPhotoImage)
  const [wrapperDims, setWrapperDims] = useState(0)
  const matchPhotoImageDims = useSelector(store => store.matchPhotoImageDims)
  const savedSurfaceColors = useSelector(store => store.colorsForSurfacesFromSavedScene)

  // Use this hook to push any facet level embedded data to redux and handle any initialization
  useEffect(() => {
    dispatch(setMaxSceneHeight(maxSceneHeight))
    dispatch(setActiveSceneLabel(ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE))
    fetchRemoteScenes(SCENE_TYPES.ROOM, brandId, { language }, SCENES_ENDPOINT, handleScenesFetchedForCVW, handleScenesFetchErrorForCVW, dispatch)
  }, [])

  // this logic is the app level observer of paintscene cache, used to help direct navigation to the color wall and set it up to return
  // THIS IS ONLY UTILIZED BY FLOWS THAT HAVE RETURN PATHS!!!!!!!
  useEffect(() => {
    // Whenever we navigate update the wrapper dimensions
    if (wrapperRef.current) {
      // @todo this should allow us to pass by prop drilling to any comps that need to do math base don the box dims _RS
      const wrapperDims = wrapperRef.current.getBoundingClientRect()
      setWrapperDims(wrapperDims)
    }
    // Set return intent for color wall rule
    if (navigationIntent === ROUTES_ENUM.COLOR_WALL &&
      ((activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE && isPaintSceneCached) ||
        activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE) && navigationReturnIntent) {
      history.push(navigationIntent)
      // tell app that color wall is visible modally, the parent condition assures this will evaluate to true in the action
      dispatch(setIsColorWallModallyPresented(navigationReturnIntent))
      // Return intent should be set already, if not something is violating the data lifecycle
      dispatch(stageNavigationReturnIntent(navigationReturnIntent))
      return
    }

    // paint a photo drop down rules
    if (navigationIntent === ROUTES_ENUM.SCENES) {
      if (activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE) {
        if (shouldShowGlobalDestroyWarning) {
          // @todo show warning modal
          console.log('SHOW WARNING MODAL')
          return
        }
        history.push(navigationIntent)
      }
    }

    if (navigationIntent === ROUTES_ENUM.ACTIVE_PAINT_SCENE) {
      // navigate from upload screen to image rotate screen
      history.push(navigationIntent)
      dispatch(clearNavigationIntent())
    }

    if (navigationIntent === ROUTES_ENUM.UPLOAD_MATCH_PHOTO) {
      history.push(navigationIntent)
      dispatch(clearNavigationIntent())
    }
  }, [isPaintSceneCached, navigationIntent, navigationReturnIntent, activeSceneLabel, shouldShowGlobalDestroyWarning, ingestedImageUrl])

  if (!window.localStorage.getItem('landingPageShownSession') && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.splashScreen) && SHOW_LOADER_ONLY_BRANDS.indexOf(brandId) < 0) {
    return <LandingPage />
  }

  const handleSurfacePaintedState = (selectedSceneUid: string, variantName: string, surfaceColors: MiniColor[]) => {
    // @todo These params can be used for download and save. State can be local to this component -RS
    const isScenePolluted = !!surfaceColors.reduce((acc, curr) => (curr ? 1 : 0) + acc, 0)
    dispatch(setIsScenePolluted(isScenePolluted ? 'POLLUTED_STOCK_SCENE' : ''))
    dispatch(setModalThumbnailColor(surfaceColors))
    setSelectedVarName(variantName)
  }

  const setPaintScenePolluted = () => {
    dispatch(setIsScenePolluted('POLLUTED_PAINT_SCENE'))
  }

  // @todo this will be unnecessary in the future, when the way scene management is done is readdressed -RS
  const shouldHideSceneManagerDiv = (path: string) => {
    if (path === '/') {
      return false
    }
    const cleanedPath = path[path.length - 1] === '/' ? path.substring(0, path.length - 1) : path
    return !cleanedPath.match(/(active|active\/colors|inspiration|scenes|active\/color-wall\/)$/)
  }

  // This callback initializes all of the scene data
  const handleSceneSurfacesLoaded = (variants) => {
    dispatch(setVariantsCollection(variants))
    // Default to the first room type for the CVW.
    dispatch(setSelectedSceneUid(variants.filter(variant => variant.sceneType === SCENE_TYPES.ROOM)[0].sceneUid))
    dispatch(setVariantsLoading(false))
  }

  const handleSceneBlobLoaderError = (err) => {
    dispatch(err)
  }

  const handleBlobLoaderInit = () => {
    dispatch(setVariantsLoading(true))
  }

  const navigateToSceneSelector = (e: SyntheticEvent) => {
    dispatch(setNavigationIntent(ROUTES_ENUM.USE_OUR_IMAGE))
    // ToDo : Navigate to the more scenes screen - PM
  }

  const handleSceneSelection = (payload) => {
    // @todo implement handler for sample sceneWrapper -RS
  }

  const openSceneFromMyIdeasPreview = (sceneType: string) => {
    let sceneLabel = ''

    if (sceneType === SCENE_TYPE.anonStock) {
      sceneLabel = ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE
    }

    if (sceneType === SCENE_TYPE.anonCustom) {
      sceneLabel = ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE
    }

    dispatch(setActiveSceneLabel(sceneLabel))
    history.push(ROUTES_ENUM.ACTIVE)
  }

  const goToPaintScene = (imageUrl: string, width: number, height: number, refDims: ReferenceDimensions) => {
    try {
      dispatch(setLayersForPaintScene(imageUrl, [], [], width, height, WORKSPACE_TYPES.generic, 0, '', []))
      dispatch(setActiveSceneLabel(ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE))
      history.push(ROUTES_ENUM.ACTIVE)
    } catch (e) {
      console.warn(`Url specified could not be revoked: ${e.message}`)
    }
  }

  const goToMatchPhoto = (imageUrl: string, width: number, height: number, refDims: ReferenceDimensions) => {
    try {
      dispatch(setImageForMatchPhoto(imageUrl))
      dispatch(setImageDimsForMatchPhoto(refDims))
      history.push(ROUTES_ENUM.ACTIVE_MATCH_PHOTO)
    } catch (e) {
      console.warn(`Url specified could not be revoked: ${e.message}`)
    }
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

  return (
    <>
      {scenes ? <SceneBlobLoader scenes={scenes} variants={variants} initHandler={handleBlobLoaderInit} handleBlobsLoaded={handleSceneSurfacesLoaded} handleError={handleSceneBlobLoaderError} /> : null}
      {toggleCompareColor
        ? <CompareColor />
        : (
          <>
            <CVWModalManager selectedVarName={selectedVarName} />
            <ColorDetailsModal />
            <div className={`cvw__root-wrapper ${colorDetailsModalShowing ? 'hide-on-small-screens' : ''}`} ref={wrapperRef}>
              {/* @todo rename setLastActiveComponent prop scene need to rethink it right now it will do nothing -RS */ }
              <ColorVisualizerNav />
              <Switch>
                <Route path={ROUTES_ENUM.COLOR_DETAILS} render={() => <ColorDetails />} />
                <Route path={`${ROUTES_ENUM.COLOR_WALL}(/.*)?`} render={() => <ColorWallPage displayAddButton displayInfoButton displayDetailsLink={false} />} />
                <Route path={ROUTES_ENUM.COLOR_COLLECTION} render={() => <ColorCollections isExpertColor={false} {...location.state} />} />
                <Route path={ROUTES_ENUM.UPLOAD_MATCH_PHOTO} render={() => <ImageIngestView cleanupCallback={cleanupStaleIngestedImage} handleDismissCallback={goToMatchPhoto} imageUrl={ingestedImageUrl} maxSceneHeight={maxSceneHeight} />} />
                <Route path={ROUTES_ENUM.ACTIVE_PAINT_SCENE} render={() => <ImageIngestView cleanupCallback={cleanupStaleIngestedImage} handleDismissCallback={goToPaintScene} imageUrl={ingestedImageUrl} maxSceneHeight={maxSceneHeight} />} />
                <Route path={ROUTES_ENUM.ACTIVE_MATCH_PHOTO} render={() => <MatchPhotoContainer colors={unorderedColors} imageUrl={matchPhotoImage} imageDims={matchPhotoImageDims} maxSceneHeight={maxSceneHeight} scalingWidth={wrapperDims.width} />} />
                <Route path={ROUTES_ENUM.USE_OUR_IMAGE} render={() => <SampleScenesWrapper isColorTinted activateScene={handleSceneSelection} />} />
                <Route path={ROUTES_ENUM.EXPERT_COLORS} render={() => <ExpertColorPicks isExpertColor />} />
                <Route path={ROUTES_ENUM.COLOR_FORM_IMAGE} render={() => <InspiredScene />} />
                {/* @todo rename activateScene prop scene to handleSceneSelection should set selectedSceneId and navigate active, useEffect may be need to rerender -RS */ }
                <Route path={ROUTES_ENUM.PAINT_PHOTO} render={() => <SampleScenesWrapper activateScene={handleSceneSelection} />} />
                <Route path={ROUTES_ENUM.MY_IDEAS_PREVIEW} render={() => <MyIdeaPreview openScene={openSceneFromMyIdeasPreview} />} />
                <Route path={ROUTES_ENUM.MASKING} render={() => <PaintSceneMaskingWrapper />} />
                <Route path={ROUTES_ENUM.MYIDEAS} render={() => <MyIdeasContainer />} />
                <Route path={ROUTES_ENUM.HELP} render={() => <Help />} />
              </Switch>
              <div
              /* This div has multiple responsibilities in the DOM tree. It cannot be removed, moved, or changed without causing regressions. */
                style={{ display: shouldHideSceneManagerDiv(location.pathname) ? 'none' : 'block' }}
              >
                {activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE ? <SingleTintableSceneView
                  allowVariantSwitch
                  showClearButton
                  interactive
                  surfaceColorsFromParents={savedSurfaceColors}
                  selectedSceneUid={selectedSceneUid}
                  variantsCollection={variantsCollection}
                  scenesCollection={scenesCollection}
                  handleSurfacePaintedState={handleSurfacePaintedState}
                  customButton={<SceneSelectorNavButton clickHandler={navigateToSceneSelector} />} /> : paintSceneWorkspace
                  ? <PaintScene
                    maxSceneHeight={maxSceneHeight}
                    workspace={paintSceneWorkspace}
                    lpActiveColor={activeColor}
                    intl={intl}
                    setActiveScenePolluted={setPaintScenePolluted} /> : null}
              </div>
            </div>
          </>
        )
      }
      {
        isShowFooter && <div className='cvw__root-container__footer'>
          <div className='cvw__root-container__footer--priority'>
            <LivePalette />
          </div>
          <div className='cvw__root-container__footer--secondary'>
            {/* @todo params could be passed in for save and download -RS */}
            <SaveOptions />
          </div>
        </div>
      }
    </>
  )
}

export default CVW
