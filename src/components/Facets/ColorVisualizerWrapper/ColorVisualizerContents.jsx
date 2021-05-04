// @flow
import React, { useContext, useState, useEffect, useRef } from 'react'
import type { Element } from 'react'
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
  clearImageRotateBypass,
  setActiveSceneLabel,
  setIsColorWallModallyPresented,
  setIsScenePolluted,
  stageNavigationReturnIntent,
  setNavigationIntent
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
  const isStockSceneCached: boolean = useSelector(store => !!store.stockSceneCache)
  const navigationIntent: string = useSelector(store => store.navigationIntent)
  const navigationReturnIntent: string = useSelector(store => store.navigationReturnIntent)
  const scenes = useSelector(store => store.scenesCollection)
  const variants = useSelector(store => store.variantsCollection)
  const [matchPhotoScene: Element, setMatchPhotoScene: (Element) => void] = useState()
  const [ImageRotateScene: Element, setUploadPaintSceneState: (Element) => void] = useState()
  const isShowFooter = location.pathname.match(/active\/masking$/) === null
  const { featureExclusions, brandId } = useContext(ConfigurationContext)
  const activeSceneLabel = useSelector(store => store.activeSceneLabel)
  const wrapperRef = useRef()

  // Use this hook to push any facet level embedded data to redux and handle any initialization
  useEffect(() => {
    dispatch(setMaxSceneHeight(maxSceneHeight))
    dispatch(setActiveSceneLabel(ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE))
    fetchRemoteScenes(SCENE_TYPES.ROOM, brandId, { language }, SCENES_ENDPOINT, handleScenesFetchedForCVW, handleScenesFetchErrorForCVW, dispatch)
  }, [])

  // this logic is the app level observer of paintscene cache, used to help direct navigation to the color wall and set it up to return
  // THIS IS ONLY UTILIZED BY FLOWS THAT HAVE RETURN PATHS!!!!!!!
  useEffect(() => {
    // @todo is it overkill to check ACTIVE_SCENE from redux? -RS
    if (navigationIntent === ROUTES_ENUM.COLOR_WALL && (isPaintSceneCached || isStockSceneCached) && navigationReturnIntent) {
      history.push(navigationIntent)
      // tell app that color wall is visible modally, the parent condition assures this will evaluate to true in the action
      dispatch(setIsColorWallModallyPresented(navigationReturnIntent))
      // Return intent should be set already, if not something is violating the data lifecycle
      dispatch(stageNavigationReturnIntent(navigationReturnIntent))
    }
  }, [isPaintSceneCached, isStockSceneCached, navigationIntent, navigationReturnIntent])

  // This hook will clear the image rotate bypass if paintscene not active
  useEffect(() => {
    if (activeSceneLabel !== ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE) {
      // @todo This largely works bc of a trick and I don't like it.  When a user clicks through to upload a paint scene, scenemanager loads and unloads thus clearing the activeSceneLabel and causes the bypass to clean up.
      // I'd like this to be more deterministically clean. -RS
      dispatch(clearImageRotateBypass())
    }
  }, [activeSceneLabel])

  const setActivePaintScene = (element) => {
    setUploadPaintSceneState(null)
    history.push('/active')
  }

  const setUploadPaintScene = (element) => {
    setUploadPaintSceneState(element)
  }

  if (!window.localStorage.getItem('landingPageShownSession') && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.splashScreen) && SHOW_LOADER_ONLY_BRANDS.indexOf(brandId) < 0) {
    return <LandingPage />
  }

  const handleSurfacePaintedState = (surfacesColor: boolean) => {
    const isScenePolluted = !!surfacesColor.reduce((acc, curr) => (curr ? 1 : 0) + acc, 0)
    dispatch(setIsScenePolluted(isScenePolluted ? 'POLLUTED_STOCK_SCENE' : ''))
    dispatch(setModalThumbnailColor(surfacesColor))
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

  // @todo implement handler for sample sceneWrapper -RS
  const handleSceneSelection = (payload) => {
    console.log('handling scene selection:', payload)
  }

  // @todo reimplement -RS
  const openSceneFromPreview = (payload) => {
    console.log('opening scene from preview:', payload)
  }

  // @todo reimplement -RS
  const handleActiveSceneChange = (payload) => {
    console.log('handle active scene change:', payload)
  }

  return (
    <>
      {scenes ? <SceneBlobLoader scenes={scenes} variants={variants} initHandler={handleBlobLoaderInit} handleBlobsLoaded={handleSceneSurfacesLoaded} handleError={handleSceneBlobLoaderError} /> : null}
      {toggleCompareColor
        ? <CompareColor />
        : (
          <>
            <CVWModalManager />
            <ColorDetailsModal />
            <div className={`cvw__root-wrapper ${colorDetailsModalShowing ? 'hide-on-small-screens' : ''}`} ref={wrapperRef}>
              {/* @todo rename setLastActiveComponent prop scene need to rethink it right now it will do nothing -RS */ }
              <ColorVisualizerNav uploadPaintScene={setUploadPaintScene} activePaintScene={setActivePaintScene} setLastActiveComponent={handleActiveSceneChange} setMatchPhotoScene={setMatchPhotoScene} />
              <Switch>
                <Route path={ROUTES_ENUM.COLOR_DETAILS} render={() => <ColorDetails />} />
                <Route path={`${ROUTES_ENUM.COLOR_WALL}(/.*)?`} render={() => <ColorWallPage displayAddButton displayInfoButton displayDetailsLink={false} />} />
                <Route path={ROUTES_ENUM.COLOR_COLLECTION} render={() => <ColorCollections isExpertColor={false} {...location.state} />} />
                <Route path={ROUTES_ENUM.UPLOAD_MATCH_PHOTO} />
                <Route path={ROUTES_ENUM.UPLOAD_PAINT_SCENE} />
                <Route path={ROUTES_ENUM.PAINT_SCENE}>{ImageRotateScene}</Route>
                <Route path={ROUTES_ENUM.ACTIVE_MATCH_PHOTO}>{matchPhotoScene}</Route>
                <Route path={ROUTES_ENUM.USE_OUR_IMAGE} render={() => <SampleScenesWrapper isColorTinted activateScene={handleSceneSelection} />} />
                <Route path={ROUTES_ENUM.EXPERT_COLORS} render={() => <ExpertColorPicks isExpertColor />} />
                <Route path={ROUTES_ENUM.COLOR_FORM_IMAGE} render={() => <InspiredScene />} />
                {/* @todo rename activateScene prop scene to handleSceneSelection should set selectedSceneId and navigate active, useEffect may be need to rerender -RS */ }
                <Route path={ROUTES_ENUM.PAINT_PHOTO} render={() => <SampleScenesWrapper activateScene={handleSceneSelection} />} />
                <Route path={ROUTES_ENUM.MY_IDEAS_PREVIEW} render={() => <MyIdeaPreview openScene={openSceneFromPreview} />} />
                <Route path={ROUTES_ENUM.MASKING} render={() => <PaintSceneMaskingWrapper />} />
                <Route path={ROUTES_ENUM.MYIDEAS} render={() => <MyIdeasContainer />} />
                <Route path={ROUTES_ENUM.HELP} render={() => <Help />} />
                <Route path={'/test'} render={() => <SingleTintableSceneView
                  allowVariantSwitch
                  showClearButton
                  interactive
                  handleSurfacePaintedState={handleSurfacePaintedState}
                  customButton={<SceneSelectorNavButton clickHandler={navigateToSceneSelector} />} />} />
              </Switch>
              <div
              /* This div has multiple responsibilities in the DOM tree. It cannot be removed, moved, or changed without causing regressions. */
                style={{ display: shouldHideSceneManagerDiv(location.pathname) ? 'none' : 'block' }}
              >
                {/* @todo when this is not a stock scene it should render paint scene, MUST REWRITE IMAGEROTATECONTAINER!!!  -RS */}
                {activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE ? <SingleTintableSceneView
                  allowVariantSwitch
                  showClearButton
                  handleSurfacePaintedState={handleSurfacePaintedState}
                  customButton={<SceneSelectorNavButton clickHandler={navigateToSceneSelector} />} /> : null}
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
            <SaveOptions />
          </div>
        </div>
      }
    </>
  )
}

export default CVW
