// @flow
import React, { useContext, useState, useEffect, useRef } from 'react'
import type { Element } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route, useLocation, useHistory } from 'react-router-dom'
import { ColorCollections } from '../../ColorCollections/ColorCollections'
import ExpertColorPicks from '../../ExpertColorPicks/ExpertColorPicks'
import { ColorWallPage } from '../ColorWallFacet'
import ColorDetails from '../ColorDetails/ColorDetails'
import CompareColor from '../../CompareColor/CompareColor'
import InspiredScene from '../../InspirationPhotos/InspiredSceneNavigator'
import LivePalette from '../../LivePalette/LivePalette'
import ColorVisualizerNav from './ColorVisualizerNav'
import SceneManager from '../../SceneManager/SceneManager'
import SampleScenesWrapper from '../../SampleScenes/SampleScenes'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import { activateOnlyScene, unpaintSceneSurfaces, showWarningModal } from '../../../store/actions/scenes'
import MyIdeasContainer from '../../MyIdeasContainer/MyIdeasContainer'
import MyIdeaPreview from '../../MyIdeaPreview/MyIdeaPreview'
import Help from '../../Help/Help'
// @todo delete this module, I don't think we need it anymore -RS
// eslint-disable-next-line no-unused-vars
import CVWWarningModal from './WarningModal'
import SaveOptions from '../../SaveOptions/SaveOptions'
import ColorDetailsModal from './ColorDetailsModal/ColorDetailsModal'
import { PreLoadingSVG } from './PreLoadingSVG'
import LandingPage from '../../LandingPage/LandingPage'
import './ColorVisualizer.scss'
import PaintSceneMaskingWrapper from 'src/components/PaintScene/PaintSceneMask'
import { shouldAllowFeature } from '../../../shared/utils/featureSwitch.util'
import { FEATURE_EXCLUSIONS } from '../../../constants/configurations'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { setMaxSceneHeight } from '../../../store/actions/system'
import { SHOW_LOADER_ONLY_BRANDS } from '../../../constants/globals'
import {
  ACTIVE_SCENE_LABELS_ENUM, clearImageRotateBypass, setIsColorWallModallyPresented,
  setIsScenePolluted, setShouldShowGlobalDestroyWarning,
  stageNavigationReturnIntent
} from '../../../store/actions/navigation'
import { ROUTES_ENUM } from './routeValueCollections'
import DynamicModal, { DYNAMIC_MODAL_STYLE, getRefDimension } from '../../DynamicModal/DynamicModal'
import { useIntl } from 'react-intl'

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
  const isPaintSceneCached = useSelector(store => !!store.paintSceneCache)
  const isStockSceneCached = useSelector(store => !!store.stockSceneCache)
  const navigationIntent = useSelector(store => store.navigationIntent)
  const navigationReturnIntent = useSelector(store => store.navigationReturnIntent)

  const [activeStockScene: Element, setActiveScene: (Element) => void] = useState(<SceneManager expertColorPicks hideSceneSelector />)
  const [activePaintScene: Element, setActivePaintSceneState: (Element) => void] = useState()
  const [lastActiveComponent: string, setLastActiveComponent: (string) => void] = useState('StockScene')
  const [isLoading: boolean, setIsLoading: boolean => void] = useState(true)
  const [matchPhotoScene: Element, setMatchPhotoScene: (Element) => void] = useState()
  const [ImageRotateScene: Element, setUploadPaintSceneState: (Element) => void] = useState()
  const isShowFooter = location.pathname.match(/active\/masking$/) === null
  const { featureExclusions } = useContext(ConfigurationContext)
  const activeSceneLabel = useSelector(store => store.activeSceneLabel)
  const shouldShowGlobalDestroyWarning = useSelector(store => store.shouldShowGlobalDestroyWarning)
  const intl = useIntl()
  const wrapperRef = useRef()
  // const isColorwallModallyPresented = useSelector(store => store.isColorwallModallyPresented)

  // Use this hook to push any facet level embedded data to redux
  useEffect(() => {
    dispatch(setMaxSceneHeight(maxSceneHeight))
  }, [])
  // @todo remove -RS
  // this hook determines if user should be warned of a navigation that will destroy work.
  // useEffect(() => {
  //   if ((isStockSceneCached || isPaintSceneCached) && isColorwallModallyPresented) {
  //     setShouldShowDestroyWarning(true)
  //   } else {
  //     setShouldShowDestroyWarning(false)
  //   }
  // }, [isStockSceneCached, isPaintSceneCached, isColorwallModallyPresented])

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
      // @todo This largely works bc of a trick and I don't like it.  When a user clicks through to upload a paint scene, scenemanager loads and unloads thus clearing the activeScenelabel and causes the bypass to clean up.
      // I'd like this to be more deterministically clean. -RS
      dispatch(clearImageRotateBypass())
    }
  }, [activeSceneLabel])

  setTimeout(() => setIsLoading(false), 1000)

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

  if (isLoading) {
    return <PreLoadingSVG hideSVG={SHOW_LOADER_ONLY_BRANDS.indexOf(brand) > -1} />
  } else if (!window.localStorage.getItem('landingPageShownSession') && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.splashScreen) && SHOW_LOADER_ONLY_BRANDS.indexOf(brand) < 0) {
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
  }

  const handleNavigationIntentCancel = (e: SyntheticEvent) => {
    e.stopPropagation()
    dispatch(setShouldShowGlobalDestroyWarning(false))
  }

  // @todo this will be unnecessary in the future, when the way scene management is done is readdressed -RS
  const shouldHideSceneManagerDiv = (path: string) => {
    if (path === '/') {
      return false
    }
    const cleanedPath = path[path.length - 1] === '/' ? path.substring(0, path.length - 1) : path
    return !cleanedPath.match(/(active|active\/colors|inspiration|scenes|active\/color-wall\/)$/)
  }

  return (
    <div className='cvw__root-container'>
      {toggleCompareColor
        ? <CompareColor />
        : (
          <div className='cvw__root-wrapper' ref={wrapperRef}>
            { shouldShowGlobalDestroyWarning ? <DynamicModal
              description={intl.formatMessage({ id: 'CVW.WARNING_REPLACEMENT' })}
              actions={[
                { text: intl.formatMessage({ id: 'YES' }), callback: handleNavigationIntentConfirm },
                { text: intl.formatMessage({ id: 'NO' }), callback: handleNavigationIntentCancel }
              ]}
              modalStyle={DYNAMIC_MODAL_STYLE.danger}
              height={getRefDimension(wrapperRef, 'height')} /> : null}
            <ColorVisualizerNav uploadPaintScene={setUploadPaintScene} activePaintScene={setActivePaintScene} setLastActiveComponent={setLastActiveComponent} setMatchPhotoScene={setMatchPhotoScene} />
            <ColorDetailsModal />
            <Switch>
              <Route path='/active/color/:colorId/:colorSEO' render={() => <ColorDetails />} />
              <Route path='/active/color-wall(/.*)?' render={() => <ColorWallPage displayAddButton displayInfoButton displayDetailsLink={false} />} />
              <Route path='/active/color-collections' render={() => <ColorCollections isExpertColor={false} {...location.state} />} />
              <Route path='/upload/match-photo'>{getActiveScene()}</Route>
              <Route path='/upload/paint-scene'>{getActiveScene()}</Route>
              <Route path='/active/paint-scene'>{ImageRotateScene}</Route>
              <Route path='/active/match-photo'>{matchPhotoScene}</Route>
              <Route path='/active/use-our-image' render={() => <SampleScenesWrapper isColorTinted activateScene={activateStockScene} />} />
              <Route path='/active/expert-colors' render={() => <ExpertColorPicks isExpertColor />} />
              <Route path='/active/color-from-image' render={() => <InspiredScene />} />
              <Route path='/active/paint-photo' render={() => <SampleScenesWrapper activateScene={activateStockScene} />} />
              <Route path='/my-ideas-preview' render={() => <MyIdeaPreview openScene={openSceneFromPreview} />} />
              <Route path='/active/masking' render={() => <PaintSceneMaskingWrapper />} />
              <Route path='/active/my-ideas' render={() => <MyIdeasContainer />} />
              <Route path='/active/help' render={() => <Help />} />
            </Switch>
            <div
              /* This div has multiple responsibilities in the DOM tree. It cannot be removed, moved, or changed without causing regressions. */
              style={{ display: shouldHideSceneManagerDiv(location.pathname) ? 'none' : 'block' }}
              className={colorDetailsModalShowing ? 'hide-on-small-screens' : ''}
            >
              {lastActiveComponent === 'StockScene' && activeStockScene}
              {lastActiveComponent === 'PaintScene' && activePaintScene}
            </div>
          </div>
        )
      }
      {
        isShowFooter && <div className='cvw__root-container__footer'>
          <div className='cvw__root-container__footer--priority'>
            <LivePalette />
          </div>
          <div className='cvw__root-container__footer--secondary'>
            <SaveOptions activeComponent={lastActiveComponent} />
          </div>
        </div>
      }
    </div>
  )
}

CVW.defaultProps = { ...facetPubSubDefaultProps, ...facetBinderDefaultProps }

export default facetBinder(CVW, 'ColorVisualizer')
