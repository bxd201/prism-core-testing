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
import SceneManager from '../../SceneManager/SceneManager'
import SampleScenesWrapper from '../../SampleScenes/SampleScenes'
import { activateOnlyScene, unpaintSceneSurfaces, showWarningModal } from '../../../store/actions/scenes'
import MyIdeasContainer from '../../MyIdeasContainer/MyIdeasContainer'
import MyIdeaPreview from '../../MyIdeaPreview/MyIdeaPreview'
import SaveOptions from '../../SaveOptions/SaveOptions'
import ColorDetailsModal from './ColorDetailsModal/ColorDetailsModal'
import LandingPage from '../../LandingPage/LandingPage'
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
  clearNavigationIntent,
  setDirtyNavigationIntent,
  setIsColorWallModallyPresented,
  setIsScenePolluted,
  setShouldShowGlobalDestroyWarning,
  stageNavigationReturnIntent
} from '../../../store/actions/navigation'
import { ROUTES_ENUM } from './routeValueCollections'
import DynamicModal, { DYNAMIC_MODAL_STYLE, getRefDimension } from '../../DynamicModal/DynamicModal'
import { useIntl } from 'react-intl'
import SceneBlobLoader from '../../SceneManager/SceneBlobLoader'
import { setSelectedSceneUid, setVariantsCollection, setVariantsLoading } from '../../../store/actions/loadScenes'
import SingleTintableSceneView from '../../SingleTintableSceneView/SingleTintableSceneView'

type CVWPropsType = {
  maxSceneHeight: number,
  brand: string
}

export const CVW = (props: CVWPropsType) => {
  const { maxSceneHeight, brand } = props
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()
  const toggleCompareColor: boolean = useSelector(store => store.lp.toggleCompareColor)
  const colorDetailsModalShowing: boolean = useSelector(store => store.colors.colorDetailsModal.showing)
  const isActiveScenePolluted: string = useSelector(store => store.scenePolluted)
  const isPaintSceneCached: boolean = useSelector(store => !!store.paintSceneCache)
  const isStockSceneCached: boolean = useSelector(store => !!store.stockSceneCache)
  const navigationIntent: string = useSelector(store => store.navigationIntent)
  const navigationReturnIntent: string = useSelector(store => store.navigationReturnIntent)
  const scenes = useSelector(store => store.scenesCollection)
  const variants = useSelector(store => store.variantsCollection)

  const [activeStockScene: Element, setActiveScene: (Element) => void] = useState(<SceneManager expertColorPicks hideSceneSelector />)
  const [activePaintScene: Element, setActivePaintSceneState: (Element) => void] = useState()
  const [lastActiveComponent: string, setLastActiveComponent: (string) => void] = useState('StockScene')
  const [matchPhotoScene: Element, setMatchPhotoScene: (Element) => void] = useState()
  const [ImageRotateScene: Element, setUploadPaintSceneState: (Element) => void] = useState()
  const isShowFooter = location.pathname.match(/active\/masking$/) === null
  const { featureExclusions } = useContext(ConfigurationContext)
  const activeSceneLabel = useSelector(store => store.activeSceneLabel)
  const shouldShowGlobalDestroyWarning = useSelector(store => store.shouldShowGlobalDestroyWarning)
  const intl = useIntl()
  const wrapperRef = useRef()
  const dirtyNavIntent = useSelector(store => store.dirtyNavigationIntent)

  // Use this hook to push any facet level embedded data to redux
  useEffect(() => {
    dispatch(setMaxSceneHeight(maxSceneHeight))
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
    setActivePaintSceneState(element)
    setUploadPaintSceneState(null)
    history.push('/active')
  }

  const setUploadPaintScene = (element) => {
    setUploadPaintSceneState(element)
  }

  const openSceneFromPreview = (scene, type) => {
    if (type === 'StockScene') {
      setActiveScene(scene)
      setLastActiveComponent(type)
    }
    if (type === 'PaintScene') {
      setActivePaintSceneState(scene)
      setLastActiveComponent(type)
    }
  }

  const activateStockScene = (id) => {
    const activate = () => {
      dispatch(setIsScenePolluted())
      dispatch(unpaintSceneSurfaces(id))
      dispatch(activateOnlyScene(id))
      setActiveScene(<SceneManager expertColorPicks hideSceneSelector />)
      setLastActiveComponent('StockScene')
      history.push('/active')
    }
    isActiveScenePolluted ? dispatch(showWarningModal(activate)) : activate()
  }

  if (!window.localStorage.getItem('landingPageShownSession') && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.splashScreen) && SHOW_LOADER_ONLY_BRANDS.indexOf(brand) < 0) {
    return <LandingPage />
  }

  const getActiveScene = () => {
    if (lastActiveComponent === 'StockScene') {
      return activeStockScene
    }
    if (lastActiveComponent === 'PaintScene') {
      return activePaintScene || activeStockScene
    }
  }

  const handleNavigationIntentConfirm = (e: SyntheticEvent) => {
    e.stopPropagation()
    dispatch(setShouldShowGlobalDestroyWarning(false))
    history.push(dirtyNavIntent)
    // clean up the one set by the nav click when one was already set
    dispatch(setDirtyNavigationIntent())
    // clean up the original, this should be the value set from the return path
    dispatch(clearNavigationIntent())
    // Allow add color button to respond again
    dispatch(setIsColorWallModallyPresented(false))
    dispatch(setIsScenePolluted())
  }

  const handleNavigationIntentCancel = (e: SyntheticEvent) => {
    e.stopPropagation()
    dispatch(setShouldShowGlobalDestroyWarning(false))
    dispatch(setDirtyNavigationIntent())
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

  return (
    <>
      {scenes ? <SceneBlobLoader scenes={scenes} variants={variants} initHandler={handleBlobLoaderInit} handleBlobsLoaded={handleSceneSurfacesLoaded} handleError={handleSceneBlobLoaderError} /> : null}
      {toggleCompareColor
        ? <CompareColor />
        : (
          <>
            {shouldShowGlobalDestroyWarning && (
              <DynamicModal
                description={intl.formatMessage({ id: 'CVW.WARNING_REPLACEMENT' })}
                actions={[
                  { text: intl.formatMessage({ id: 'YES' }), callback: handleNavigationIntentConfirm },
                  { text: intl.formatMessage({ id: 'NO' }), callback: handleNavigationIntentCancel }
                ]}
                modalStyle={DYNAMIC_MODAL_STYLE.danger}
                height={getRefDimension(wrapperRef, 'height')}
              />
            )}
            <ColorDetailsModal />
            <div className={`cvw__root-wrapper ${colorDetailsModalShowing ? 'hide-on-small-screens' : ''}`} ref={wrapperRef}>
              <ColorVisualizerNav uploadPaintScene={setUploadPaintScene} activePaintScene={setActivePaintScene} setLastActiveComponent={setLastActiveComponent} setMatchPhotoScene={setMatchPhotoScene} />
              <Switch>
                <Route path={ROUTES_ENUM.COLOR_DETAILS} render={() => <ColorDetails />} />
                <Route path={`${ROUTES_ENUM.COLOR_WALL}(/.*)?`} render={() => <ColorWallPage displayAddButton displayInfoButton displayDetailsLink={false} />} />
                <Route path={ROUTES_ENUM.COLOR_COLLECTION} render={() => <ColorCollections isExpertColor={false} {...location.state} />} />
                <Route path={ROUTES_ENUM.UPLOAD_MATCH_PHOTO}>{getActiveScene()}</Route>
                <Route path={ROUTES_ENUM.UPLOAD_PAINT_SCENE}>{getActiveScene()}</Route>
                <Route path={ROUTES_ENUM.PAINT_SCENE}>{ImageRotateScene}</Route>
                <Route path={ROUTES_ENUM.ACTIVE_MATCH_PHOTO}>{matchPhotoScene}</Route>
                <Route path={ROUTES_ENUM.USE_OUR_IMAGE} render={() => <SampleScenesWrapper isColorTinted activateScene={activateStockScene} />} />
                <Route path={ROUTES_ENUM.EXPERT_COLORS} render={() => <ExpertColorPicks isExpertColor />} />
                <Route path={ROUTES_ENUM.COLOR_FORM_IMAGE} render={() => <InspiredScene />} />
                <Route path={ROUTES_ENUM.PAINT_PHOTO} render={() => <SampleScenesWrapper activateScene={activateStockScene} />} />
                <Route path={ROUTES_ENUM.MY_IDEAS_PREVIEW} render={() => <MyIdeaPreview openScene={openSceneFromPreview} />} />
                <Route path={ROUTES_ENUM.MASKING} render={() => <PaintSceneMaskingWrapper />} />
                <Route path={ROUTES_ENUM.MYIDEAS} render={() => <MyIdeasContainer />} />
                <Route path={ROUTES_ENUM.HELP} render={() => <Help />} />
                <Route path={'/test'} render={() => <SingleTintableSceneView />} />
              </Switch>
              <div
              /* This div has multiple responsibilities in the DOM tree. It cannot be removed, moved, or changed without causing regressions. */
                style={{ display: shouldHideSceneManagerDiv(location.pathname) ? 'none' : 'block' }}
              >
                {lastActiveComponent === 'StockScene' && activeStockScene}
                {lastActiveComponent === 'PaintScene' && activePaintScene}
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
