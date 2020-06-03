// @flow
import ColorCollection from '../../ColorCollections/ColorCollections'
import ExpertColorPicks from '../../ExpertColorPicks/ExpertColorPicks'
import { ColorWallPage } from '../ColorWallFacet'
import ColorDetails from '../ColorDetails/ColorDetails'
import CompareColor from '../../CompareColor/CompareColor'
import InspiredScene from '../../InspirationPhotos/InspiredSceneNavigator'
import LivePalette from '../../LivePalette/LivePalette'
import ColorDataWrapper from '../../../helpers/ColorDataWrapper/ColorDataWrapper'
import ColorVisualizerNav, { isColors, isInspiration, isPaintPhoto, isMyIdeas, isHelp } from './ColorVisualizerNav'
import React, { Component, createRef } from 'react'
import SceneManager from '../../SceneManager/SceneManager'
import SampleScenesWrapper from '../../SampleScenes/SampleScenes'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import { activateScene, deactivateScene, unpaintSceneSurfaces, unsetActiveStockScenePolluted, changeSceneVariant, unsetSelectedSceneVariantChanged, unsetSelectedScenePaletteLoaded, loadScenes } from '../../../store/actions/scenes'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

import { ROUTE_PARAMS, ROUTE_PARAM_NAMES, SCENE_VARIANTS, SCENE_TYPES } from 'constants/globals'
import ImageRotateContainer from '../../MatchPhoto/ImageRotateContainer'
import MyIdeasContainer from '../../MyIdeasContainer/MyIdeasContainer'
import MyIdeaPreview from '../../MyIdeaPreview/MyIdeaPreview'
import Help from '../../Help/Help'
import { withRouter } from 'react-router'
import DropDownMenu from './RouteComponents'
import { RouteContext } from '../../../contexts/RouteContext/RouteContext'
import CVWWarningModal from './WarningModal'
import { setLayersForPaintScene } from '../../../store/actions/paintScene'
import SaveOptions from '../../SaveOptions/SaveOptions'
import { resetSaveState, SCENE_TYPE } from '../../../store/actions/persistScene'
import type { Scene, SceneStatus } from '../../shared/types/Scene'
import { StaticTintScene } from '../../CompareColor/StaticTintScene'
// eslint-disable-next-line no-unused-vars
import { getRefDimension } from '../../DynamicModal/DynamicModal'
import { modalHeight, refreshModalHeight } from '../../../store/actions/modal'
import debounce from 'lodash/debounce'
import { setSelectedSceneStatus } from '../../../store/actions/stockScenes'
import { replaceSceneStatus } from '../../../shared/utils/sceneUtil'
import ColorDetailsModal from './ColorDetailsModal/ColorDetailsModal'
import { PreLoadingSVG } from './PreLoadingSVG'
import at from 'lodash/at'
import GenericMessage from '../../Messages/GenericMessage'
import { injectIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { removeSystemMessage } from '../../../store/actions/systemMessages'

const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`

// this is very vague because react-router doesn't have the ability to match /section/x/family/y/color/z and /section/x/color/z with the same route
// we're handling the URL-parsing logic manually in ColorWallComponent below
const colorWallUrlPattern = `${colorWallBaseUrl}(/.*)?`

// since the CDP component won't have any color information if we go to it directly, we need to wrap it
// in the ColorDataWrapper HOC to ensure it has color data prior to rendering it.
const ColorDetailsWithData = ColorDataWrapper(ColorDetails)
const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..

const cvwBaseClassName = 'cvw__root-container'
const cvwFooterClassName = `${cvwBaseClassName}__footer`
const footerPriorityItemClassName = `${cvwFooterClassName}--priority`
const footerSecondaryItemClassName = `${cvwFooterClassName}--secondary`
const footerSecondaryItemTextClassName = `${cvwFooterClassName}--secondary__text`
const messageWrapper = `${cvwBaseClassName}__message_wrapper`
const messageBodyBox = `${messageWrapper}__message`
const messageCloseButton = `${messageWrapper}__btn`

// Route constants
const PAINT_SCENE_COMPONENT = 'PaintScene'
const SCENE_MANAGER_COMPONENT = 'SceneManager'
const PAINT_SCENE_ROUTE = '/paint-scene'
const ACTIVE_ROUTE = '/active'
const HELP_ROUTE = '/help'

export const COLORS_ROUTE = `${ACTIVE_ROUTE}/colors`
export const INSPIRATION_ROUTE = `${ACTIVE_ROUTE}/inspiration`
export const SCENES_ROUTE = `${ACTIVE_ROUTE}/scenes`
export const MY_IDEAS_PREVIEW = '/my-ideas-preview'
export const MATCH_PHOTO = '/match-photo'
export const MY_IDEAS = '/my-ideas'
const TYPE_MATCH_PHOTO = 'MATCH_A_PHOTO'
const TYPE_UPLOAD_YOUR_PHOTO = 'UPLOAD_YOUR_PHOTO'
export const HELP_PATH = '/help'

export const RootRedirect = () => {
  return <Redirect to='/active' />
}

type Props = FacetPubSubMethods & FacetBinderMethods & {
  toggleCompareColor: boolean,
  resetSaveState: Function,
  sceneStatus: SceneStatus[],
  scenes: Scene[],
  activeScenes: Array<number>,
  unpaintSceneSurfaces: Function,
  setModalHeight: number,
  refreshModalHeight: boolean,
  selectedStockSceneId: string | null,
  sceneMetadata: Array<Object> | null,
  setSelectedSceneStatus: Function,
  selectedSceneStatus: Object,
  isActiveStockScenePolluted: boolean,
  unsetSelectedSceneVariantChanged: Function,
  unsetSelectedScenePaletteLoaded: Function,
  systemMessages: string,
  dismissSystemMessage: Function, intl: any
}

const pathNameSet = new Set([`${ACTIVE_ROUTE}/colors`, `${ACTIVE_ROUTE}/inspiration`, `${ACTIVE_ROUTE}/scenes`, ACTIVE_ROUTE, '/'])
const notReLoadingPath = new Set(['/color-from-image', '/match-photo', '/paint-scene', '/help'])
const nonOverlayRouteSet = new Set([ACTIVE_ROUTE, HELP_ROUTE, MY_IDEAS])

export class ColorVisualizerWrapper extends Component<Props> {
  static defaultProps = {
    ...facetPubSubDefaultProps,
    ...facetBinderDefaultProps
  }

  constructor (props) {
    super(props)
    const { pathname } = this.props.location
    const isShow = pathNameSet.has(pathname)
    this.state = {
      close: !isShow,
      showDefaultPage: isShow,
      showPaintScene: false,
      remountKey: (new Date()).getTime(),
      lastActiveComponent: SCENE_MANAGER_COMPONENT,
      exploreColorsLinkRef: null,
      isTabbedOutFromHelp: false,
      isShowWarningModal: false,
      checkIsPaintSceneUpdate: false,
      isUseOurPhoto: false,
      showMatchPhoto: false,
      isFromMyIdeas: false,
      isPaintSceneActive: false,
      isPaintScenePolluted: false,
      imgUrlMatchPhoto: '',
      imgUrl: '',
      tmpUrl: '',
      currentActiveId: 1,
      lastActiveId: 0,
      setLayersForPaintSceneData: {},
      isRedirectFromMyIdeas: false,
      isActivateScene: false,
      tmpActiveId: null,
      isRedirectFromMyIdeasStockScene: false,
      openUnpaintedStockScene: false,
      isFirstLoading: true
    }

    this.wrapperRef = createRef()
    this.resizeHandler = debounce(this.resizeHandler.bind(this), 300)
    window.addEventListener('resize', this.resizeHandler)
  }

  resizeHandler (e: SyntheticEvent) {
    const height = getRefDimension(this.wrapperRef, 'height', true)
    this.props.setModalHeight(height)
  }

  onRouteChanged = () => {
    const currLocation = this.props.location.pathname
    const isSubRoute = isColors(currLocation) || isInspiration(currLocation) || isPaintPhoto(currLocation) || isMyIdeas(currLocation) || isHelp(currLocation)
    const { showDefaultPage, showPaintScene, lastActiveComponent } = this.state
    let isShowPaintScene = true
    let isShowDefaultPage = true
    // save action uses redux flags that need to be cleared. This prevents the save modal from showing up when it should not
    this.props.resetSaveState()

    if (showPaintScene) {
      isShowDefaultPage = false
    }
    if (showDefaultPage) {
      isShowPaintScene = false
    }
    if (showPaintScene || showDefaultPage) {
      if (pathNameSet.has(currLocation)) {
        this.setState({ close: false, showPaintScene: isShowPaintScene, showDefaultPage: isShowDefaultPage, isFirstLoading: false })
      } else if (isSubRoute) {
        this.setState({ showPaintScene: false, showDefaultPage: false, close: true })
      } else {
        this.setState({ showPaintScene: isShowPaintScene, showDefaultPage: isShowDefaultPage })
      }
    } else {
      if (pathNameSet.has(currLocation)) {
        if (lastActiveComponent === SCENE_MANAGER_COMPONENT) {
          this.setState({ showDefaultPage: true, showPaintScene: false, close: false })
        }
        if (lastActiveComponent === PAINT_SCENE_COMPONENT) {
          this.setState({ showDefaultPage: false, showPaintScene: true, close: false })
        }
      }
    }
  }

  close = (e) => {
    if (e.target.matches('div.nav__dropdown-overlay') || e.target.matches('a') || e.target.matches('span') || e.target.matches('button') || e.target.matches('svg') || e.target.matches('path')) {
      this.props.history.push(ACTIVE_ROUTE)
      this.setState({ close: true })
    }
  }

  redirectTo=() => {
    this.setState({ close: true })
  }

  open = (isShowDropDown, close) => {
    const { lastActiveComponent } = this.state
    if (lastActiveComponent === SCENE_MANAGER_COMPONENT) {
      this.setState({ showDefaultPage: isShowDropDown, showPaintScene: false })
    }
    if (lastActiveComponent === PAINT_SCENE_COMPONENT) {
      this.setState({ showDefaultPage: false, showPaintScene: isShowDropDown })
    }
    this.setState({ close: close, isFirstLoading: false })
  }

  setActiveComponent =() => {
    const { lastActiveComponent } = this.state
    if (lastActiveComponent === SCENE_MANAGER_COMPONENT) {
      this.setState({ showDefaultPage: true, showPaintScene: false })
    }
    if (lastActiveComponent === PAINT_SCENE_COMPONENT) {
      this.setState({ showDefaultPage: false, showPaintScene: true })
    }
  }

  redirectMyIdeas = (isRedirectFromMyIdeasStockScene: boolean = false, tmpActiveId: string | null = null) => {
    if (isRedirectFromMyIdeasStockScene) {
      this.activateScene(tmpActiveId, isRedirectFromMyIdeasStockScene)
    } else {
      this.props.history.push(ACTIVE_ROUTE)
      this.setState({
        imgUrl: '',
        showDefaultPage: false,
        close: true,
        showPaintScene: true,
        showMatchPhoto: false,
        remountKey: (new Date()).getTime(),
        lastActiveComponent: PAINT_SCENE_COMPONENT,
        isFromMyIdeas: true,
        isShowWarningModal: false,
        checkIsPaintSceneUpdate: false,
        isRedirectFromMyIdeas: false
      })
    }
  }

  showWarningModalMyIdeas = (data) => {
    const { checkIsPaintSceneUpdate } = this.state
    if (data.isStockScenePolluted) {
      if (data.isPaintSceneProject) {
        this.setState({
          isRedirectFromMyIdeas: true,
          setLayersForPaintSceneData: data
        })
      } else {
        this.setState({
          isRedirectFromMyIdeasStockScene: true,
          checkIsPaintSceneUpdate: !checkIsPaintSceneUpdate,
          isRedirectFromMyIdeas: true,
          tmpActiveId: data.tmpActiveId,
          isActivateScene: true,
          openUnpaintedStockScene: data.openUnpaintedStockScene
        })
      }
      const currentSceneData = this.props.sceneStatus.find(item => item.id === this.props.activeScenes[0])
      const currentSceneMetaData = this.props.scenes.find(scene => scene.id === this.props.activeScenes[0])
      const miniImage = <StaticTintScene scene={currentSceneMetaData} statuses={currentSceneData.surfaces} config={{ isNightScene: currentSceneData.variant === SCENE_VARIANTS.NIGHT }} />
      this.showWarningModal(miniImage)
      return false
    }
    if (data.isPaintSceneProject) {
      this.setState({
        checkIsPaintSceneUpdate: !checkIsPaintSceneUpdate,
        isRedirectFromMyIdeas: true,
        setLayersForPaintSceneData: data
      })
    } else {
      this.setState({
        isRedirectFromMyIdeasStockScene: true,
        checkIsPaintSceneUpdate: !checkIsPaintSceneUpdate,
        isRedirectFromMyIdeas: true,
        tmpActiveId: data.tmpActiveId,
        isActivateScene: true,
        openUnpaintedStockScene: data.openUnpaintedStockScene
      })
    }
    return false
  }

  renderComponent = (url, type) => {
    const { checkIsPaintSceneUpdate, lastActiveComponent, isPaintSceneActive, isPaintScenePolluted, currentActiveId } = this.state
    if (type === TYPE_MATCH_PHOTO || type === TYPE_UPLOAD_YOUR_PHOTO) {
      if (type === TYPE_MATCH_PHOTO) {
        this.props.history.push(MATCH_PHOTO)
        this.setState({
          imgUrlMatchPhoto: url,
          showDefaultPage: false,
          showPaintScene: false,
          close: true,
          showMatchPhoto: true,
          remountKey: this.state.remountKey,
          lastActiveComponent: lastActiveComponent
        })
      }
      if (type === TYPE_UPLOAD_YOUR_PHOTO) {
        const isStockScenePolluted = this.checkIsStockScenePolluted()
        if ((lastActiveComponent === SCENE_MANAGER_COMPONENT && !isStockScenePolluted) || (isPaintSceneActive && !isPaintScenePolluted)) {
          // check scene manager whether update here
          this.props.unpaintSceneSurfaces(currentActiveId)
          this.props.history.push(PAINT_SCENE_ROUTE)
          this.setState({
            imgUrl: url,
            showDefaultPage: false,
            close: true,
            showPaintScene: true,
            showMatchPhoto: false,
            remountKey: (new Date()).getTime(),
            lastActiveComponent: PAINT_SCENE_COMPONENT,
            isFromMyIdeas: false,
            checkIsPaintSceneUpdate: false
          })
        } else {
          if (isStockScenePolluted && !isPaintSceneActive && !isPaintScenePolluted) {
            this.setState({ tmpUrl: url, isFromMyIdeas: false })
            const currentSceneData = this.props.sceneStatus.find(item => item.id === this.props.activeScenes[0])
            const currentSceneMetaData = this.props.scenes.find(scene => scene.id === this.props.activeScenes[0])
            const miniImage = <StaticTintScene scene={currentSceneMetaData} statuses={currentSceneData.surfaces} config={{ isNightScene: currentSceneData.variant === SCENE_VARIANTS.NIGHT }} />
            this.showWarningModal(miniImage)
          } else {
            this.setState({ checkIsPaintSceneUpdate: !checkIsPaintSceneUpdate, tmpUrl: url })
          }
        }
      }
    } else {
      this.setState({
        showDefaultPage: false,
        showPaintScene: false,
        lastActiveComponent: lastActiveComponent
      })
    }
  }

  setExploreColorsLinkRef = (exploreColorsLinkRef) => {
    if (this.state.exploreColorsLinkRef === null) {
      this.setState({
        exploreColorsLinkRef: exploreColorsLinkRef
      })
    }
  }

  setIsTabbedOutFromHelp = () => {
    if (!this.state.close) {
      this.setState({
        isTabbedOutFromHelp: true
      })
    }
  }

  showWarningModal = (base64) => {
    this.setState({ isShowWarningModal: true, tmpPaintSceneImage: base64 })
  }

  loadNewCanvas=() => {
    const { tmpUrl, checkIsPaintSceneUpdate, isUseOurPhoto, lastActiveId, currentActiveId, isRedirectFromMyIdeas, isActivateScene, tmpActiveId, isRedirectFromMyIdeasStockScene, openUnpaintedStockScene } = this.state
    if (isRedirectFromMyIdeas && !isRedirectFromMyIdeasStockScene && this.state.setLayersForPaintSceneData.backgroundCanvasRef) {
      this.props.setLayersForPaintScene(this.state.setLayersForPaintSceneData)
      this.redirectMyIdeas(false)
      return
    }
    if (isUseOurPhoto || isActivateScene || isRedirectFromMyIdeasStockScene) {
      this.props.history.push('/')
      this.props.unpaintSceneSurfaces(currentActiveId)
      this.props.changeSceneVariant(currentActiveId, SCENE_VARIANTS.DAY)
      this.props.unsetActiveStockScenePolluted()
      this.props.setSelectedSceneStatus(null)
      this.props.unsetSelectedSceneVariantChanged()
      this.props.unsetSelectedScenePaletteLoaded()
      if (isUseOurPhoto && currentActiveId !== lastActiveId) {
        this.props.activateScene(currentActiveId)
        this.props.deactivateScene(lastActiveId)
      } else if (isActivateScene || isRedirectFromMyIdeasStockScene) {
        if (currentActiveId !== tmpActiveId) {
          this.props.activateScene(tmpActiveId)
          this.props.deactivateScene(currentActiveId)
        }
        if (isRedirectFromMyIdeasStockScene) {
          let selectedScene = {}
          const expectStockData = this.props.sceneMetadata.find(item => item.sceneType === SCENE_TYPE.anonStock && item.id === this.props.selectedStockSceneId)
          if (expectStockData) {
            const stockSceneData = this.props.scenes.find(item => item.id === expectStockData.scene.id)
            const palette = expectStockData.scene.surfaces.map(surface => surface.color).filter(color => color !== undefined)
            selectedScene = { name: expectStockData.name, palette: palette, savedSceneType: SCENE_TYPE.anonStock, stockSceneData: stockSceneData, expectStockData: expectStockData, openUnpaintedStockScene: openUnpaintedStockScene }
          }
          if (selectedScene.stockSceneData) {
            this.props.setSelectedSceneStatus(selectedScene)
          }
        }
        this.setState({
          currentActiveId: tmpActiveId,
          isActivateScene: false,
          tmpActiveId: null,
          isPaintSceneActive: false
        })
      }
      this.setState({
        showDefaultPage: true,
        showPaintScene: false,
        lastActiveComponent: SCENE_MANAGER_COMPONENT,
        remountKey: (new Date()).getTime(),
        isShowWarningModal: false,
        isUseOurPhoto: false,
        checkIsPaintSceneUpdate: !checkIsPaintSceneUpdate,
        isFromMyIdeas: false,
        lastActiveId: currentActiveId,
        isPaintScenePolluted: false,
        isRedirectFromMyIdeasStockScene: false,
        setLayersForPaintSceneData: {}
      })
    }
    if (!isUseOurPhoto && !isActivateScene) {
      this.setState({
        imgUrl: tmpUrl,
        showDefaultPage: false,
        close: true,
        showPaintScene: true,
        remountKey: (new Date()).getTime(),
        lastActiveComponent: PAINT_SCENE_COMPONENT,
        isShowWarningModal: false,
        checkIsPaintSceneUpdate: false,
        isFromMyIdeas: false,
        isPaintScenePolluted: false,
        tmpUrl: '',
        setLayersForPaintSceneData: {}
      })
      this.props.unpaintSceneSurfaces(currentActiveId)
    }
  }

  cancel = () => {
    this.setState({ isShowWarningModal: false, checkIsPaintSceneUpdate: false, isActivateScene: false, tmpActiveId: null, tmpUrl: '', isRedirectFromMyIdeas: false, openUnpaintedStockScene: false })
  }

  setIsPaintSceneActive = () => {
    if (!this.state.isPaintSceneActive) this.setState({ isPaintSceneActive: true })
  }

  unsetIsPaintSceneActive = () => {
    this.setState({ isPaintSceneActive: false })
  }

  setIsPaintScenePolluted = () => {
    if (!this.state.isPaintScenePolluted) this.setState({ isPaintScenePolluted: true })
  }

  unSetIsPaintScenePolluted = () => {
    if (this.state.isPaintScenePolluted) this.setState({ isPaintScenePolluted: false })
  }

  activateScene = (id, isRedirectFromMyIdeasStockScene = false) => {
    const { checkIsPaintSceneUpdate, lastActiveComponent, currentActiveId, isPaintScenePolluted, isActivateScene } = this.state
    if (lastActiveComponent === SCENE_MANAGER_COMPONENT) {
      if (this.checkIsStockScenePolluted()) {
        this.setState({
          tmpActiveId: id,
          isActivateScene: true
        })
        const currentSceneData = this.props.sceneStatus.find(item => item.id === this.props.activeScenes[0])
        const currentSceneMetaData = this.props.scenes.find(scene => scene.id === this.props.activeScenes[0])
        const miniImage = <StaticTintScene scene={currentSceneMetaData} statuses={currentSceneData.surfaces} config={{ isNightScene: currentSceneData.variant === SCENE_VARIANTS.NIGHT }} />
        this.showWarningModal(miniImage)
        return
      }
      this.props.history.push('/')
      this.props.unpaintSceneSurfaces(currentActiveId)
      this.props.changeSceneVariant(currentActiveId, SCENE_VARIANTS.DAY)
      this.props.unsetActiveStockScenePolluted()
      if (!isRedirectFromMyIdeasStockScene) {
        this.props.setSelectedSceneStatus(null)
        this.props.unsetSelectedSceneVariantChanged()
        this.props.unsetSelectedScenePaletteLoaded()
      }
      if (id !== currentActiveId) {
        this.props.activateScene(id)
        this.props.deactivateScene(currentActiveId)
      }
      this.setState({
        showDefaultPage: true,
        showPaintScene: false,
        lastActiveComponent: SCENE_MANAGER_COMPONENT,
        remountKey: (new Date()).getTime(),
        currentActiveId: id,
        lastActiveId: currentActiveId,
        isFromMyIdeas: false
      })
    } else {
      if (isPaintScenePolluted) {
        this.setState({
          checkIsPaintSceneUpdate: !checkIsPaintSceneUpdate,
          isActivateScene: true,
          tmpActiveId: id
        })
      } else {
        this.props.history.push('/')
        this.props.unpaintSceneSurfaces(currentActiveId)
        this.props.changeSceneVariant(currentActiveId, SCENE_VARIANTS.DAY)
        this.props.unsetActiveStockScenePolluted()
        this.props.unsetSelectedSceneVariantChanged()
        this.props.unsetSelectedScenePaletteLoaded()
        if (!isRedirectFromMyIdeasStockScene) {
          this.props.setSelectedSceneStatus(null)
        }
        if (currentActiveId !== id) {
          this.props.deactivateScene(currentActiveId)
          this.props.activateScene(id)
        }
        if (isActivateScene || isRedirectFromMyIdeasStockScene) {
          this.setState({
            isActivateScene: false,
            tmpActiveId: null,
            isPaintSceneActive: false
          })
        }
        this.setState({
          isUseOurPhoto: false,
          lastActiveComponent: SCENE_MANAGER_COMPONENT,
          currentActiveId: id,
          lastActiveId: currentActiveId,
          showDefaultPage: true,
          showPaintScene: false,
          isFromMyIdeas: false
        })
      }
    }
  }

  checkIsPaintScenePolluted = () => this.state.isPaintScenePolluted

  checkIsStockScenePolluted = () => {
    if (this.props.isActiveStockScenePolluted) {
      return true
    }
    return false
  }

  render () {
    const { close, imgUrl, showDefaultPage, showPaintScene, remountKey, isShowWarningModal, tmpPaintSceneImage, checkIsPaintSceneUpdate, exploreColorsLinkRef, isTabbedOutFromHelp, isFromMyIdeas, imgUrlMatchPhoto, isFirstLoading } = this.state
    const { toggleCompareColor, location, loadingScenes, loadingColorData, loadingCS, loadingECP, colorDetailsModalShowing } = this.props
    const isloadingPath = !notReLoadingPath.has(this.props.location.pathname)
    const isLoading = loadingScenes && loadingColorData && loadingCS && loadingECP && isloadingPath && isFirstLoading
    const dropMenuProps = {
      close: this.close,
      redirectTo: this.redirectTo,
      getImageUrl: (url, type) => this.renderComponent(url, type)
    }

    const { systemMessages } = this.props
    const currentSystemMessage = systemMessages.length ? systemMessages[systemMessages.length - 1] : null
    let currentSystemMessageBody = currentSystemMessage ? currentSystemMessage.messageBody : null

    if (currentSystemMessage && currentSystemMessage.errorKey) {
      currentSystemMessageBody = this.props.intl.messages[`SYSTEM.${currentSystemMessage.errorKey}`]
    }

    const currentSystemMessageType = currentSystemMessage ? currentSystemMessage.messageType : null
    const currentSystemMessageId = currentSystemMessage ? currentSystemMessage.id : null

    return (
      <React.Fragment>
        {systemMessages.length ? <GenericMessage type={currentSystemMessageType} fillParent><div className={messageWrapper}><div className={messageBodyBox}>{currentSystemMessageBody}</div>
          <div className={messageCloseButton}>
            <button onClick={(e: SyntheticEvent) => {
              e.preventDefault()
              this.props.dismissSystemMessage(currentSystemMessageId)
            }}>
              <FontAwesomeIcon
                title={this.props.intl.messages.SAVE_MASKS}
                icon={['fa', 'window-close']}
                size='2x' />
            </button>
          </div></div></GenericMessage> : null}
        { isLoading && <PreLoadingSVG />}
        <div className={`${cvwBaseClassName} ${isLoading ? `${cvwBaseClassName}--loading` : ''} `} ref={this.wrapperRef}>
          <RouteContext.Provider value={{
            navigate: (isShowDropDown, close) => this.open(isShowDropDown, close),
            setActiveComponent: () => this.setActiveComponent(),
            getExploreColorsLinkRef: (exploreColorsLinkRef) => this.setExploreColorsLinkRef(exploreColorsLinkRef),
            setIsTabbedOutFromHelp: () => this.setIsTabbedOutFromHelp(),
            showWarningModal: (base64) => this.showWarningModal(base64),
            loadNewCanvas: () => this.loadNewCanvas(),
            redirectMyIdeas: (isRedirectFromMyIdeasStockScene, tmpActiveId) => this.redirectMyIdeas(isRedirectFromMyIdeasStockScene, tmpActiveId),
            setIsPaintSceneActive: () => this.setIsPaintSceneActive(),
            unsetIsPaintSceneActive: () => this.unsetIsPaintSceneActive(),
            setIsPaintScenePolluted: () => this.setIsPaintScenePolluted(),
            unSetIsPaintScenePolluted: () => this.unSetIsPaintScenePolluted(),
            checkIsPaintScenePolluted: () => this.checkIsPaintScenePolluted(),
            showWarningModalMyIdeas: (data) => this.showWarningModalMyIdeas(data),
            checkIsStockScenePolluted: () => this.checkIsStockScenePolluted(),
            exploreColorsLinkRef: exploreColorsLinkRef
          }}>
            { /* The warning modal can also be triggered by the router context, when debugging trace showWarningModalMyIdeas too */ }
            {isShowWarningModal && <CVWWarningModal miniImage={tmpPaintSceneImage} cancel={this.cancel} confirm={this.loadNewCanvas} />}
            <ColorDetailsModal />
            {<div className={`cvw__root-container__nav-wrapper ${colorDetailsModalShowing ? 'hide-on-small-screens' : ''} ${toggleCompareColor ? 'cvw__root-container__nav-wrapper--hide' : ''}`}>
              <div className={`cvw__root-container__nav-container ${(location.pathname === HELP_PATH) ? `cvw__root-container__nav-container--hide` : (location.pathname === MY_IDEAS) ? `cvw__root-container__nav-container--hide-my-ideas` : ``}`}><ColorVisualizerNav /></div>
              <div className='cvw__root-wrapper'>
                {(!showDefaultPage && !showPaintScene && location.pathname === PAINT_SCENE_ROUTE) && (<canvas name='canvas' width='600' height='600' />)}
                <Route path='/' exact component={RootRedirect} />
                <Route path={colorWallUrlPattern}>
                  <ColorWallPage displayAddButton displayInfoButton displayDetailsLink={false} />
                </Route>
                <Route path={`${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact component={ColorDetailsWithData} />
                <Route path='/color-from-image' component={InspiredScene} />
                <Route path='/use-our-image' render={() => <SampleScenesWrapper isColorTinted activateScene={(id) => this.activateScene(id)} />} />
                <Route path='/paint-photo' render={() => <SampleScenesWrapper activateScene={(id) => this.activateScene(id)} />} />
                <Route path='/color-collections' render={(props) => (<ColorCollection isExpertColor={false} {...props.location.state} />)} />
                <Route path='/expert-colors' render={() => <ExpertColorPicks isExpertColor />} />
                <Route path={MY_IDEAS} render={() => <MyIdeasContainer />} />
                <Route path={MY_IDEAS_PREVIEW} component={MyIdeaPreview} />
                <Route path={`/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact component={ColorDetails} />
                <Route path='/help' component={Help} />
                <Route path='/match-photo' render={() => <ImageRotateContainer showPaintScene imgUrl={imgUrlMatchPhoto} />} />
                {showDefaultPage && <SceneManager expertColorPicks hideSceneSelector />}
                <ImageRotateContainer isFromMyIdeas={isFromMyIdeas} isPaintScene checkIsPaintSceneUpdate={checkIsPaintSceneUpdate} showPaintScene={showPaintScene} imgUrl={imgUrl} key={remountKey} />
                <div className={`${isShowWarningModal ? 'cvw__modal__overlay' : 'cvw__route-wrapper'}`} />
                {!close && <div role='presentation' className={`${(!close && !nonOverlayRouteSet.has(location.pathname)) ? 'nav__dropdown-overlay' : ''}`} onClick={this.close}>
                  <Route path='/active/colors' component={(props) => <DropDownMenu isTabbedOutFromHelp={isTabbedOutFromHelp} exploreColorsLinkRef={exploreColorsLinkRef} dataKey='color' {...dropMenuProps} />} />
                  <Route path='/active/inspiration' component={() => <DropDownMenu isTabbedOutFromHelp={isTabbedOutFromHelp} exploreColorsLinkRef={exploreColorsLinkRef} dataKey='inspiration' {...dropMenuProps} />} />
                  <Route path='/active/scenes' component={() => <DropDownMenu isTabbedOutFromHelp={isTabbedOutFromHelp} exploreColorsLinkRef={exploreColorsLinkRef} dataKey='scenes' {...dropMenuProps} />} />
                </div>}
              </div>
            </div>}
            {toggleCompareColor && <CompareColor />}
            <div className={cvwFooterClassName}>
              <div className={footerPriorityItemClassName}>
                <LivePalette />
              </div>
              <div className={footerSecondaryItemClassName}>
                <div className={footerSecondaryItemTextClassName}>My Color Palette</div>
                <SaveOptions activeComponent={this.state.lastActiveComponent} />
              </div>
            </div>
          </RouteContext.Provider>
        </div>
      </React.Fragment>
    )
  }

  componentDidMount () {
    if (!this.props.scenes) {
      this.props.loadScenes()
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.location !== prevProps.location && this.props.location.pathname !== ACTIVE_ROUTE) {
      this.onRouteChanged()
    }

    if (this.props.refreshModalHeight) {
      const height = getRefDimension(this.wrapperRef, 'height', true)
      this.props.setModalHeight(height)
    }
  }

  componentWillUnmount () {
    if (typeof this.props.unsubscribeAll === 'function') {
      this.props.unsubscribeAll()
    }
    window.removeEventListener('resize', this.resizeHandler)
  }
}

const mapStateToProps = (state, props) => {
  const currentSceneData = state.scenes && state.scenes.sceneStatus[state.scenes.type] && state.scenes.sceneStatus[state.scenes.type].find(item => item.id === state.scenes.activeScenes[0])
  const sceneSurfaceTinted = currentSceneData && currentSceneData.surfaces.find(surface => !!surface.color)
  const scenes = state.selectedSceneStatus && !state.selectedSceneStatus.openUnpaintedStockScene && sceneSurfaceTinted !== void 0 ? replaceSceneStatus(state.scenes, state.selectedSceneStatus) : state.scenes
  const { systemMessages } = state

  return {
    toggleCompareColor: state.lp.toggleCompareColor,
    scenes: scenes.sceneCollection[state.scenes.type],
    sceneStatus: scenes.sceneStatus[state.scenes.type],
    activeScenes: scenes.activeScenes,
    refreshModalHeight: state.refreshModalHeight,
    selectedStockSceneId: state.selectedStockSceneId,
    sceneMetadata: state.sceneMetadata,
    selectedSceneStatus: state.selectedSceneStatus,
    isActiveStockScenePolluted: state.scenes.isActiveStockScenePolluted,
    colorDetailsModalShowing: state.colors.colorDetailsModal.showing,
    loadingScenes: scenes.loadingScenes,
    loadingColorData: !at(state, 'colors.status.loading')[0],
    loadingCS: state.collectionSummaries.loadingCS,
    loadingECP: state.expertColorPicks.loadingECP,
    systemMessages
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    activateScene: (sceneId) => {
      dispatch(activateScene(sceneId))
    },
    deactivateScene: (sceneId) => {
      dispatch(deactivateScene(sceneId))
    },
    loadScenes: (scene) => {
      dispatch(loadScenes(SCENE_TYPES.ROOM))
    },
    setLayersForPaintScene: (data) => {
      const { backgroundCanvasRef, layersRef, selectedScenePalette, initialWidth, initialHeight } = data
      dispatch(setLayersForPaintScene(backgroundCanvasRef, layersRef, selectedScenePalette, initialWidth, initialHeight))
    },
    resetSaveState: () => dispatch(resetSaveState()),
    unpaintSceneSurfaces: (sceneId) => dispatch(unpaintSceneSurfaces(sceneId)),
    setModalHeight: (height: number) => {
      dispatch(modalHeight(height))
      dispatch(refreshModalHeight(false))
    },
    setSelectedSceneStatus: (selectedScene) => dispatch(setSelectedSceneStatus(selectedScene)),
    unsetActiveStockScenePolluted: () => dispatch(unsetActiveStockScenePolluted()),
    changeSceneVariant: (sceneId: number, variant: string) => {
      dispatch(changeSceneVariant(sceneId, variant))
    },
    unsetSelectedSceneVariantChanged: () => dispatch(unsetSelectedSceneVariantChanged()),
    unsetSelectedScenePaletteLoaded: () => dispatch(unsetSelectedScenePaletteLoaded()),
    dismissSystemMessage: (id) => dispatch(removeSystemMessage(id))
  }
}
export default facetBinder(connect(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(ColorVisualizerWrapper))), 'ColorVisualizerWrapper')
