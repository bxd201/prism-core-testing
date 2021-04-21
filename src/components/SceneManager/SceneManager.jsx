// @flow
import React, { createRef, PureComponent } from 'react'
import { connect } from 'react-redux'
import find from 'lodash/find'
import flattenDeep from 'lodash/flattenDeep'
import includes from 'lodash/includes'
import sortBy from 'lodash/sortBy'
import memoizee from 'memoizee'
import * as GA from 'src/analytics/GoogleAnalytics'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { DndProvider } from 'react-dnd-cjs'
import HTML5Backend from 'react-dnd-html5-backend-cjs'
import { Link } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'
import WithConfigurationContext from 'src/contexts/ConfigurationContext/WithConfigurationContext'
import { SCENE_TYPES, SCENE_VARIANTS } from 'constants/globals'
import {
  loadScenes,
  paintSceneSurface,
  unpaintSceneSurfaces,
  activateScene,
  deactivateScene,
  changeSceneVariant,
  addNewMask,
  toggleEditMode,
  updateCurrentSceneInfo,
  setSelectedSceneVariantChanged,
  setSelectedScenePaletteLoaded
} from '../../store/actions/scenes'
import { StaticTintScene } from '../CompareColor/StaticTintScene'
import TintableScene from './TintableScene'
import SceneVariantSwitch from './SceneVariantSwitch'
import ImagePreloader from '../../helpers/ImagePreloader'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import ColorPickerSlide from '../ColorPickerSlide/ColorPickerSlide'
import type { Color } from '../../shared/types/Colors.js.flow'
import type { Scene, SceneStatus, SceneWorkspace, Surface, Variant } from '../../shared/types/Scene'
import type { ColorMap } from 'src/shared/types/Colors.js.flow'
import {
  ACTIVE_SCENE_LABELS_ENUM, cacheStockScene,
  clearNavigationIntent, clearStockSceneCache,
  navigateToIntendedDestination,
  POLLUTED_ENUM, setActiveSceneLabel,
  setIsScenePolluted
} from '../../store/actions/navigation'

import './SceneManager.scss'
import 'src/scss/convenience/visually-hidden.scss'
import DynamicModal, { getRefDimension, DYNAMIC_MODAL_STYLE } from '../DynamicModal/DynamicModal'
import { saveStockScene } from '../../store/actions/stockScenes'
import { showSavedConfirmModal, showSaveSceneModal } from '../../store/actions/persistScene'
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
import { replaceSceneStatus } from '../../shared/utils/sceneUtil'
import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'
import { checkCanMergeColors, shouldPromptToReplacePalette, getColorInstances } from '../LivePalette/livePaletteUtility'
import { mergeLpColors, replaceLpColors } from '../../store/actions/live-palette'
import { ROUTES_ENUM, TOP_LEVEL_ROUTES } from '../Facets/ColorVisualizerWrapper/routeValueCollections'
import {
  fetchRemoteScenes,
  handleScenesFetchedForCVW,
  handleScenesFetchErrorForCVW
} from '../../store/actions/loadScenes'
import { SCENES_ENDPOINT } from 'constants/endpoints'
import type { FlatVariant } from '../../store/actions/loadScenes'

const getThumbnailAssetArrayByScene = memoizee((sceneVariant: Variant, surfaces: Surface[]): string[] => {
  return flattenDeep([
    sceneVariant.thumb,
    surfaces.map(surface => surface.shadows),
    surfaces.map(surface => surface.mask),
    surfaces.map(surface => surface.highlights)
  ])
})
// @todo deprecate -RS
// const getFullSizeAssetArrayByScene = memoizee((scene: Scene): string[] => {
//   return flattenDeep([
//     scene.variants.map((v: Variant) => [
//       v.image,
//       v.thumb,
//       v.surfaces.map((s: Surface) => [
//         s.mask,
//         s.hitArea,
//         s.shadows,
//         s.highlights
//       ])
//     ])
//   ])
// })

const getMinHeightFromRef = (ref: React$Ref, aspectRatio: number = 0.75) => {
  // This default value is the same as the myideas wrapper
  const val = 606
  if (ref && ref.current) {
    const { width } = ref.current.getBoundingClientRect()
    return Math.floor(width * aspectRatio)
  }
  return val
}

type Props = {
  activateScene: Function,
  activeColor: Color | void,
  activeScenes: Array<number>,
  // eslint-disable-next-line react/no-unused-prop-types
  addNewMask: Function,
  changeSceneVariant: Function,
  deactivateScene: Function,
  expertColorPicks: boolean,
  interactive: boolean,
  isEditMode: boolean,
  isLoadingScenes: boolean,
  loadScenes: Function,
  mainColor: Color | void,
  maxActiveScenes: number,
  paintSceneSurface: Function,
  previewColor: Color | void,
  scenes: Scene[],
  sceneStatus: SceneStatus[],
  sceneWorkspaces: SceneWorkspace[],
  // eslint-disable-next-line react/no-unused-prop-types
  toggleEditMode: Function,
  type: string,
  updateCurrentSceneInfo: Function,
  onSceneChanged?: SceneStatus => void,
  onVariantChanged?: string => void,
  sceneCount: number,
  showSaveSceneModalFlag: boolean,
  showSaveSceneModalAction: Function,
  intl: any,
  saveStockScene: Function,
  currentSceneType: string,
  saveSceneName: string,
  selectedSceneStatus: Object,
  showSavedConfirmModalFlag: boolean,
  showSavedConfirmModal: Function,
  hideSceneSelector?: boolean,
  sceneStatusActiveSceneStore: SceneStatus,
  isColorDetail?: boolean,
  selectedSceneStatusActiveScene: SceneStatus,
  setActiveScenePolluted: Function,
  isActiveStockScenePolluted: boolean,
  selectedScenedVariant: string | null,
  setSelectedSceneVariantChanged: Function,
  selectedSceneVariantChanged: boolean,
  lpColors: Array<Color> | undefined,
  mergeLpColors: Function,
  replaceLpColors: Function,
  colorMap: ColorMap | null,
  setSelectedScenePaletteLoaded: Function,
  selectedScenePaletteLoaded: boolean,
  config: {
    brandId: string,
    featureExclusions?: string[]
  },
  intl: {
    locale: string
  },
  clearNavigationIntent: Function,
  navigateToIntendedDestination: Function,
  isActiveScenePolluted: string,
  navigationIntent: string,
  setActiveSceneLabel: Function,
  stockSceneCache: any,
  cacheStockScene: Function,
  activeSceneLabel: string,
  clearStockSceneCache: Function,
  unpaintSceneSurfaces: Function,
  unsetActiveScenePolluted: Function,
  // new stuff
  fetchRemoteScenes: Function,
  scenesCollection: any[] | null,
  variantsCollection: FlatVariant[] | null
}

type State = {
  currentSceneIndex: number,
  uniqueSceneId: string,
  activeSceneStatus: Object | null,
  isChangeVariantCalled: boolean,
  showSelectPaletteModal: boolean,
  activeScenesId: string[] | null,
  activeVariants: FlatVariant[] | null,
  sceneVariants: string[] | null
}

export class SceneManager extends PureComponent<Props, State> {
  static baseClass = 'prism-scene-manager'
  static bottomBtnClass = 'prism-scene-manager__bottom-btn'
  static defaultProps = {
    expertColorPicks: false,
    interactive: true,
    maxActiveScenes: 1,
    type: SCENE_TYPES.ROOM
  }

  constructor (props: Props) {
    super(props)

    this.state = {
      currentSceneIndex: 0,
      uniqueSceneId: createUniqueSceneId(),
      activeSceneStatus: props.sceneStatusActiveSceneStore || null,
      isChangeVariantCalled: false,
      showSelectPaletteModal: false,
      activeScenesId: null,
      activeVariants: null,
      sceneVariants: null,
      presentedVariant: null,
      presentedSceneUid: null,
      surfaceColorsByVariant: []
    }

    this.handleColorUpdate = this.handleColorUpdate.bind(this)
    this.handleClickSceneToggle = this.handleClickSceneToggle.bind(this)
    this.changeVariant = this.changeVariant.bind(this)
    this.changeVariant = memoizee(this.changeVariant, { primitive: true, length: 1 })
    this.updateCurrentSceneInfo = this.updateCurrentSceneInfo.bind(this)
    this.saveSceneFromModal = this.saveSceneFromModal.bind(this)
    this.hideSaveSceneModal = this.hideSaveSceneModal.bind(this)
    this.hideSavedConfirmModal = this.hideSavedConfirmModal.bind(this)
    this.tryToMergeColors = this.tryToMergeColors.bind(this)
    this.loadPalette = this.loadPalette.bind(this)
    this.getSelectPaletteModalConfig = this.getSelectPaletteModalConfig.bind(this)
    this.wrapperRef = createRef()
    this.loaderWrapperRef = createRef()
  }

  componentDidMount () {
    // load initial scene data
    // this.props.loadScenes(this.props.type, this.props.config.brandId, { language: this.props.intl.locale })
    const { type: sceneType, config: { brandId }, intl: { locale } } = this.props
    this.props.fetchRemoteScenes(sceneType, brandId, { language: locale }, SCENES_ENDPOINT, handleScenesFetchedForCVW, handleScenesFetchErrorForCVW)
    // This code loads saved scenes
    if (!this.props.isColorDetail && this.props.selectedSceneStatusActiveScene && !this.props.selectedScenePaletteLoaded) {
      this.tryToMergeColors()
      this.props.setSelectedScenePaletteLoaded()
    }

    if (this.props.stockSceneCache) {
      this.props.setActiveScenePolluted()
      this.props.clearStockSceneCache()
    }
    // @todo uncomment the two immediate lines below to add custom mask data for manual test. DEPRECATED -RS
    // this.props.addNewMask(1, 2, window.localStorage.getItem('sampleMask'))
    // this.props.toggleEditMode(false)
    // Redux uses this to be aware if paint scene or stock scene is active
    // eslint-disable-next-line no-debugger
  }

  componentDidUpdate (prevProps: any, prevState: any) {
    const { navigationIntent, stockSceneCache, activeSceneLabel, activeScenes, sceneStatus, onSceneChanged } = this.props
    if (navigationIntent === ROUTES_ENUM.COLOR_WALL && !stockSceneCache) {
      // @todo in the future this should set aside the data that tells which surfaces are painted, right now it is just a flag -RS
      this.prepareDataCache(true)
    }

    // @todo this is a very loose approach, it assumes that an unset label means this is presented, which may be true,
    //  but this component stays mounted and it probably should either dependably unmount or a redux flag higher up should know if its presented to the user, this is a refactor for another day -RS
    if (!activeSceneLabel) {
      this.props.setActiveSceneLabel(ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE)
    }

    activeScenes && (prevProps.activeScenes !== activeScenes) && activeScenes[0] && sceneStatus && onSceneChanged && onSceneChanged(sceneStatus[activeScenes[0]])
    // update variants when blobs are added to the surfaces
    if (prevProps.variantsCollection !== this.props.variantsCollection && this.props.variantsCollection) {
      const activeVariants = this.props.variantsCollection.filter(variant => variant.sceneUid === this.state.activeScenesUid)
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ activeVariants })
    }
  }

  componentWillUnmount () {
    // @todo this was put here to follow the pattern that works in paintscene this should be tested as we haven't really depended on scenemanager unmounting, theoretic vs practical... -RS
    // This causes a useful side effect in that it dependably allows the bypass to be cleared
    this.props.setActiveSceneLabel()
  }

  static getDerivedStateFromProps (props: Props, state: State) {
    let derivedState = state
    if (!props.isColorDetail && props.selectedSceneStatusActiveScene && state.activeSceneStatus !== null && props.sceneStatusActiveSceneStore) {
      props.selectedSceneStatusActiveScene.surfaces.map((surface, index) => {
        if (props.sceneStatusActiveSceneStore.surfaces[index].color) {
          derivedState.activeSceneStatus.surfaces[index].color = props.sceneStatusActiveSceneStore.surfaces[index].color
        } else if (surface.color) {
          derivedState.activeSceneStatus.surfaces[index].color = surface.color
        }
      })

      if (!state.isChangeVariantCalled) {
        derivedState.activeSceneStatus.variant = props.selectedScenedVariant
      } else if (state.isChangeVariantCalled && state.activeSceneStatus.variant !== props.sceneStatusActiveSceneStore.variant) {
        derivedState.activeSceneStatus.variant = props.sceneStatusActiveSceneStore.variant
      }

      derivedState = {
        ...derivedState,
        activeSceneStatus: derivedState.activeSceneStatus
      }
    }

    // update local state with redux store values ounce they have been fetched and loaded
    if (!state.activeScenesId && !state.activeVariants && props.scenesCollection && props.variantsCollection) {
      const { scenesCollection, variantsCollection, type } = props
      const activeScene = scenesCollection.filter(scene => scene.sceneType === type)[0]
      const activeSceneUid = activeScene.uid
      // @ todo refactor to activeScenesUid -RS

      derivedState.activeScenesId = [activeSceneUid]
      // @todo this is partially redundant and only works for a single scene scenario, right now it is used to select updated active variants when the blobs load -RS
      derivedState.activeScenesUid = activeSceneUid
      derivedState.activeVariants = variantsCollection.filter(variant => variant.sceneUid === activeSceneUid)
      derivedState.sceneVariants = [...activeScene.variantNames]
      derivedState.presentedVariant = derivedState.sceneVariants[0]
      derivedState.surfaceColorsByVariant = flattenDeep(derivedState.activeVariants?.map(variant => {
        return variant.surfaces.map(surface => {
          return {
            id: null,
            hex: null,
            colorNumber: null,
            variantName: variant.variantName
          }
        })
      }), 2)
    }

    return derivedState
  }

  saveSceneFromModal (e: SyntheticEvent, saveSceneName: string) {
    e.preventDefault()
    e.stopPropagation()
    if (saveSceneName.trim() === '') {
      return false
    }
    if (this.props.sceneStatus && this.props.activeScenes) {
      // @todo should I throw an error if no active scene or is this over kill? -RS
      const currentSceneData = this.props.sceneStatus.find(item => item.id === this.props.activeScenes[0])
      let livePaletteColorsIdArray = []
      this.props.lpColors && this.props.lpColors.map(color => {
        livePaletteColorsIdArray.push(color.id)
      })
      this.props.saveStockScene(this.state.uniqueSceneId, saveSceneName, currentSceneData, this.props.currentSceneType, livePaletteColorsIdArray)
      this.props.showSavedConfirmModal(true)
    }
  }

  hideSaveSceneModal () {
    this.props.showSaveSceneModalAction(false)
  }

  hideSavedConfirmModal () {
    this.props.showSavedConfirmModal(false)
  }

  // @todo deprecate the surfaceid, its is uncessary now. The scenemanager tracks the active variant and just needs to update the positional.
  // rerender will flow set color to tintable scene.
  applyColorToSurface = (surfaceId: string, color: Color, surfaceIndex: number) => {
    const variantName = this.state.presentedVariant
    const newSurfaceColors = {
      // added id for referential integrity, ignored others to avoid deep clone since we can look up colors easily and cheaply
      id: color.id,
      hex: color.hex,
      colorNumber: color.colorNumber,
      variantName
    }
    const surfaceColors = this.state.surfaceColorsByVariant.map((surfaceColor, i) => {
      if (i !== surfaceIndex) {
        return { ...surfaceColor }
      }

      return newSurfaceColors
    })

    this.setState({ surfaceColorsByVariant: surfaceColors })
  }

  handleColorUpdate = function handleColorUpdate (sceneId: string, surfaceId: string, color: Color) {
    const { selectedSceneStatusActiveScene, isColorDetail, isActiveStockScenePolluted } = this.props
    const sceneStatusStoreBeforeUpdate = this.props.sceneStatus.find(scene => scene.id === sceneId)
    if (!isColorDetail && sceneStatusStoreBeforeUpdate && !isActiveStockScenePolluted) {
      let sceneStatusStoreUpdated = {
        ...sceneStatusStoreBeforeUpdate,
        surfaces: sceneStatusStoreBeforeUpdate.surfaces.map(surface => {
          if (surface.id === surfaceId) {
            surface.color = color
            return surface
          }
          return surface
        })
      }
      if (selectedSceneStatusActiveScene && sceneStatusStoreUpdated) {
        selectedSceneStatusActiveScene.surfaces.map((surface, index) => {
          if (surface.color && sceneStatusStoreUpdated.surfaces[index].color && surface.color.colorNumber !== sceneStatusStoreUpdated.surfaces[index].color.colorNumber) {
            this.props.setActiveScenePolluted()
          } else if (!surface.color && sceneStatusStoreUpdated.surfaces[index].color) {
            this.props.setActiveScenePolluted()
          }
        })
      } else if (this.props.sceneStatus && this.props.sceneStatus.find(scene => scene.id === this.props.activeScenes[0])) {
        this.props.sceneStatus.find(scene => scene.id === this.props.activeScenes[0]).surfaces && this.props.sceneStatus.find(scene => scene.id === this.props.activeScenes[0]).surfaces.map(surface => {
          if (surface.color) {
            this.props.setActiveScenePolluted()
          }
        })
      }
    }
    this.props.paintSceneSurface(sceneId, surfaceId, color)
  }

  handleClickSceneToggle = function handleClickSceneToggle (id: number) {
    const { activeScenes } = this.props

    // if this scene is active...
    if (includes(activeScenes, id)) {
      this.deactivateScene(id)
    } else {
      // ... otherwise activate this scene
      this.activateScene(id)
      GA.event({
        category: 'Scene Manager',
        action: 'Toggle Active Scene',
        label: 'Toggle Active Scene'
      })
    }
  }

  activateScene (id: string) {
    const { activeScenes, maxActiveScenes, activateScene, deactivateScene } = this.props

    // if active scenes exceed or match max active scenes...
    if (activeScenes.length >= parseInt(maxActiveScenes, 10)) {
      // compare prev and current scenes, continue to eliminate oldest until max active is all that remains
      activeScenes.map(id => deactivateScene(id))
    }

    activateScene(id)
  }

  deactivateScene (id: string) {
    const { activeScenes, deactivateScene } = this.props

    if (activeScenes.length === 1) {
      // don't let the user deactivate the last scene
      return
    }
    // ... deactivate it
    deactivateScene(id)
  }

  updateCurrentSceneInfo = (sceneId: number, surfaceId: number) => {
    this.props.updateCurrentSceneInfo(sceneId, surfaceId)
  }

  changeVariant = (sceneId: number) => {
    const { changeSceneVariant, onVariantChanged, isColorDetail, selectedSceneVariantChanged, setSelectedSceneVariantChanged, selectedSceneStatus } = this.props
    const { isChangeVariantCalled } = this.state

    const _changeVariant = (variant: string) => {
      onVariantChanged && onVariantChanged(variant)
      if (!isChangeVariantCalled && !isColorDetail) {
        this.setState({ isChangeVariantCalled: true })
      }
      if (selectedSceneStatus && !selectedSceneVariantChanged) {
        setSelectedSceneVariantChanged()
      }
      changeSceneVariant(sceneId, variant)
    }
    return _changeVariant
  }

  tryToMergeColors () {
    // eslint-disable-next-line no-new-object
    const { lpColors, isColorDetail, selectedSceneStatus, colorMap } = this.props
    if (!isColorDetail && selectedSceneStatus && !selectedSceneStatus.openUnpaintedStockScene && selectedSceneStatus.palette && lpColors) {
      const colorInstances = getColorInstances(selectedSceneStatus.palette, selectedSceneStatus.expectStockData.livePaletteColorsIdArray, colorMap)
      const colorInstancesSliced = colorInstances.slice(0, 8)
      if (checkCanMergeColors(lpColors, colorInstancesSliced, LP_MAX_COLORS_ALLOWED)) {
        this.props.mergeLpColors(colorInstancesSliced)
      } else {
        if (shouldPromptToReplacePalette(lpColors, colorInstancesSliced, LP_MAX_COLORS_ALLOWED)) {
          this.setState({ showSelectPaletteModal: true })
        }
      }
    }
  }

  getSelectPaletteModalConfig () {
    const { intl } = this.props

    const selectPaletteActions = [{ callback: (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.setState({ showSelectPaletteModal: false })
    },
    text: intl.formatMessage({ id: 'PAINT_SCENE.CANCEL' }),
    type: DYNAMIC_MODAL_STYLE.primary },
    { callback: (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.loadPalette()
      this.setState({ showSelectPaletteModal: false })
    },
    text: intl.formatMessage({ id: 'PAINT_SCENE.OK' }),
    type: DYNAMIC_MODAL_STYLE.primary }]

    return {
      selectPaletteActions,
      selectPaletteTitle: intl.formatMessage({ id: 'PAINT_SCENE.SELECT_PALETTE_TITLE' }),
      selectPaletteDescription: intl.formatMessage({ id: 'PAINT_SCENE.SELECT_PALETTE_DESC' })
    }
  }

  loadPalette () {
    const { selectedSceneStatus, colorMap } = this.props
    const colorInstances = getColorInstances(selectedSceneStatus.palette, selectedSceneStatus.expectStockData.livePaletteColorsIdArray, colorMap)
    this.props.replaceLpColors(colorInstances.slice(0, 8))
  }

  unPaintAllSurfaces = () => {
    const { scenes, unpaintSceneSurfaces, unsetActiveScenePolluted } = this.props
    scenes.forEach((scene) => {
      unpaintSceneSurfaces(scene.id)
    })
    unsetActiveScenePolluted()
  }

  getPreviewData = (showLivePalette) => {
    const currentSceneData = this.props.sceneStatus.find(item => item.id === this.props.activeScenes[0])
    const currentSceneMetaData = this.props.scenes.find(scene => scene.id === this.props.activeScenes[0])
    const livePaletteColorsDiv = this.props.lpColors.filter(color => !!color).map((color, i) => {
      const { red, green, blue } = color
      return (
        <div
          key={i}
          style={{ backgroundColor: `rgb(${red},${green},${blue})`, flexGrow: '1', borderLeft: (i > 0) ? '1px solid #ffffff' : 'none' }}>
          &nbsp;
        </div>
      )
    })

    return <>
      <StaticTintScene scene={currentSceneMetaData} statuses={currentSceneData.surfaces} config={{ isNightScene: currentSceneData.variant === SCENE_VARIANTS.NIGHT }} />
      {showLivePalette && <div style={{ display: 'flex', marginTop: '1px' }}>{livePaletteColorsDiv}</div>}
    </>
  }

  handleNavigationIntentConfirm = (e: SyntheticEvent) => {
    e.stopPropagation()
    this.props.navigateToIntendedDestination()
  }

  handleNavigationIntentCancel = (e: SyntheticEvent) => {
    e.stopPropagation()
    this.props.clearNavigationIntent()
  }

  prepareDataCache = (state: ComponentState) => {
    // @todo this is a stub for any future cache prep
    this.props.cacheStockScene(state)
  }

  handleVariantThumbLoaded = (e: SyntheticTouchEvent, i: number) => {

  }

  render () {
    // eslint-disable-next-line no-unused-vars
    const { scenes,
      sceneStatus,
      isLoadingScenes,
      activeColor,
      previewColor,
      mainColor,
      activeScenes,
      type,
      interactive,
      sceneWorkspaces,
      expertColorPicks,
      intl,
      showSaveSceneModalFlag,
      showSavedConfirmModalFlag,
      hideSceneSelector,
      navigationIntent,
      isActiveScenePolluted,
      isColorDetail,
      config,
      unsetActiveScenePolluted,
      scenesCollection
    } = this.props

    const { activeSceneStatus, showSelectPaletteModal } = this.state
    const { selectPaletteActions, selectPaletteTitle, selectPaletteDescription } = this.getSelectPaletteModalConfig()
    const livePaletteColorCount = (this.props.lpColors && this.props.lpColors.length) || 0
    if (isLoadingScenes) {
      return <div ref={this.loaderWrapperRef} style={{ 'minHeight': getMinHeightFromRef(this.loaderWrapperRef) }} className={`${SceneManager.baseClass}__loader`}><CircleLoader /></div>
    }

    if (activeSceneStatus) {
      const sceneStatusIndexActiveScene = sceneStatus.findIndex(scene => scene.id === activeScenes[0])
      sceneStatus[sceneStatusIndexActiveScene] = activeSceneStatus
    }

    if (this.props.selectedScenedVariant && !this.state.isChangeVariantCalled) {
      const sceneStatusIndexActiveScene = sceneStatus.findIndex(scene => scene.id === activeScenes[0])
      sceneStatus[sceneStatusIndexActiveScene].variant = this.props.selectedScenedVariant
    }

    // data adapter
    const { activeVariants, presentedVariant, presentedSceneUid, surfaceColorsByVariant } = this.state
    const currentVariant = activeVariants?.find(variant => variant.variantName === presentedVariant)
    let colors = surfaceColorsByVariant.filter(color => color?.variantName === presentedVariant)
    const activeScene = scenesCollection?.find(scene => scene.uid === currentVariant.sceneUid)
    const backgroundImageUrl = currentVariant?.image

    return (
      <DndProvider backend={HTML5Backend}>
        <div className={SceneManager.baseClass} ref={this.wrapperRef}>
          {/* Do not use scene height for modal, use the sceneManager wrapper */}
          {showSelectPaletteModal ? <DynamicModal
            actions={selectPaletteActions}
            title={selectPaletteTitle}
            height={getRefDimension(this.wrapperRef, 'height')}
            description={selectPaletteDescription} /> : null}
          {showSaveSceneModalFlag && livePaletteColorCount !== 0 ? <DynamicModal
            actions={[
              { text: intl.formatMessage({ id: 'SAVE_SCENE_MODAL.SAVE' }), callback: this.saveSceneFromModal },
              { text: intl.formatMessage({ id: 'SAVE_SCENE_MODAL.CANCEL' }), callback: this.hideSaveSceneModal }
            ]}
            previewData={this.getPreviewData(true)}
            height={getRefDimension(this.wrapperRef, 'height')}
            allowInput
            inputDefault={`${intl.formatMessage({ id: 'SAVE_SCENE_MODAL.DEFAULT_DESCRIPTION' })} ${this.props.sceneCount}`} /> : null}
          {showSaveSceneModalFlag && livePaletteColorCount === 0 ? <DynamicModal
            actions={[
              { text: intl.formatMessage({ id: 'SAVE_SCENE_MODAL.CANCEL' }), callback: this.hideSaveSceneModal }
            ]}
            description={intl.formatMessage({ id: 'SAVE_SCENE_MODAL.UNABLE_TO_SAVE_WARNING' })}
            height={getRefDimension(this.wrapperRef, 'height')} /> : null}
          { /* ---------- Confirm modal ---------- */ }
          {showSavedConfirmModalFlag ? <DynamicModal
            actions={[
              { text: intl.formatMessage({ id: 'SCENE_MANAGER.OK' }), callback: this.hideSavedConfirmModal }
            ]}
            description={intl.formatMessage({ id: 'SCENE_MANAGER.SCENE_SAVED' })}
            height={getRefDimension(this.wrapperRef, 'height')} /> : null}
          { /* ---------- Will destroy work modal ---------- */ }
          {TOP_LEVEL_ROUTES.indexOf(navigationIntent) > -1 && isActiveScenePolluted ? <DynamicModal
            description={intl.formatMessage({ id: 'CVW.WARNING_REPLACEMENT' })}
            actions={[
              { text: intl.formatMessage({ id: 'YES' }), callback: this.handleNavigationIntentConfirm },
              { text: intl.formatMessage({ id: 'NO' }), callback: this.handleNavigationIntentCancel }
            ]}
            previewData={this.getPreviewData(false)}
            modalStyle={DYNAMIC_MODAL_STYLE.danger}
            height={getRefDimension(this.wrapperRef, 'height')} /> : null}
          {activeScenes.length === 1 && expertColorPicks && (!config.featureExclusions || !config.featureExclusions.includes('expertColorPicks')) && (
            <ColorPickerSlide {...getSceneInfoById(find(scenes, { 'id': activeScenes[0] }), sceneStatus).variant} />
          )}
          {isActiveScenePolluted && !isColorDetail && <button className={`${SceneManager.baseClass}__clear-areas-btn`} onClick={this.unPaintAllSurfaces}>
            <div className={`${SceneManager.baseClass}__clear-areas-btn__icon`}><FontAwesomeIcon size='lg' icon={['fa', 'eraser']} /></div>
            <div className={`${SceneManager.baseClass}__clear-areas-btn__text`}><FormattedMessage id='CLEAR_AREAS' /></div>
          </button>}
          {/* RENDERING FOR COLOR DETAIL SELECTOR */}
          {!hideSceneSelector && <div className={`${SceneManager.baseClass}__block ${SceneManager.baseClass}__block--tabs`} role='radiogroup' aria-label='scene selector'>
            {scenes.map((scene, index) => {
              const sceneInfo = getSceneInfoById(scene, sceneStatus)
              const sceneWorkspaces = this.props.sceneWorkspaces.filter(
                workspace => workspace.sceneId === scene.id
              )

              if (!sceneInfo) {
                console.warn(
                  `Cannot find scene variant based on id ${scene.id}`
                )
                return void 0
              }

              const status: SceneStatus = sceneInfo.status
              const sceneVariant: Variant = sceneInfo.variant
              const surfaces: Surface[] = sceneInfo.surfaces
              const activeMarker = includes(activeScenes, scene.id) ? (
                <FontAwesomeIcon
                  icon={['fa', 'check']}
                  className={`${SceneManager.baseClass}__flag`}
                />
              ) : null

              return (
                <button
                  key={scene.id}
                  role='radio'
                  aria-checked={includes(activeScenes, scene.id)}
                  className={`${SceneManager.baseClass}__btn ${includes(activeScenes, scene.id) ? `${SceneManager.baseClass}__btn--active` : ''}`}
                  onClick={() => this.handleClickSceneToggle(scene.id)}
                  onKeyDown={e => e.key === 'Enter' && this.handleClickSceneToggle(scene.id)}
                  tabIndex={0}
                >
                  <div role='presentation'>
                    <ImagePreloader preload={getThumbnailAssetArrayByScene(sceneVariant, surfaces)}>
                      {({ loading, error }) => (
                        <TintableScene
                          background={sceneVariant.thumb}
                          clickToPaintColor={activeColor}
                          error={error}
                          height={activeScene.height}
                          imageValueCurve={sceneVariant.normalizedImageValueCurve}
                          interactive={false}
                          isEditMode={this.props.isEditMode}
                          loading={loading}
                          mainColor={mainColor}
                          onUpdateColor={this.handleColorUpdate}
                          previewColor={previewColor}
                          sceneId={activeScene.uid}
                          sceneName={sceneVariant.name}
                          sceneWorkspaces={sceneWorkspaces}
                          surfaces={surfaces}
                          surfaceColors={colors}
                          surfaceStatus={status.surfaces}
                          type={type}
                          width={activeScene.width}
                        />
                      )}
                    </ImagePreloader>
                  </div>
                  {activeMarker}
                </button>
              )
            })}
          </div>}
          {/* RENDERING FOR  SCENE TINTER */}
          <div className={`${SceneManager.baseClass}__block ${SceneManager.baseClass}__block--scenes`} role='main'>
            {activeVariants?.filter(variant => variant.variantName === presentedVariant).map((variant, index) => {
              // const scene: Scene = scenes.filter(
              //   scene => scene.id === sceneId
              // )[0]
              //
              // if (!scene) {
              //   return null
              // }
              //
              // const sceneInfo = getSceneInfoById(scene, sceneStatus)
              //
              // if (!sceneInfo) {
              //   console.warn(
              //     `Cannot find scene variant based on id ${scene.id}`
              //   )
              //   return void 0
              // }
              //
              // const status: SceneStatus = sceneInfo.status
              // const sceneVariant: Variant = sceneInfo.variant
              // const surfaces: Surface[] = sceneInfo.surfaces
              //
              let variantSwitch = null

              // if we have more than one variant for this scene...
              if (activeVariants.length > 1) {
                // @todo we will rewrite this logic to pass the variant names & values into variant swith comp -RS
                // if we have day and night variants...
                // TODO: Remove this dayNightToggle check, this is for demonstration purposes
                if (
                  SceneVariantSwitch.DayNight.isCompatible(activeVariants.map(variant => variant.variantName))
                ) {
                  // @todo this is just to keep code rolling -RS
                  const sceneId = null
                  // ... then create a day/night variant switch
                  variantSwitch = (
                    <SceneVariantSwitch.DayNight
                      currentVariant={presentedVariant}
                      variants={[SCENE_VARIANTS.DAY, SCENE_VARIANTS.NIGHT]}
                      onChange={this.changeVariant(sceneId)}
                      sceneId={sceneId} // was scene.id
                    />
                  )
                }
              }

              return (
                <div className={`${SceneManager.baseClass}__scene-wrapper`} key={`${presentedSceneUid}-${currentVariant.variantName}`}>
                  {/* preload bg image to improve ux */}
                  {backgroundImageUrl ? <TintableScene
                    background={backgroundImageUrl}
                    clickToPaintColor={activeColor}
                    el={TintableScene}
                    error={false}
                    height={activeScene.height}
                    imageValueCurve={currentVariant.normalizedImageValueCurve}
                    interactive={interactive}
                    isEditMode={this.props.isEditMode}
                    // @todo removed from simple api -RS
                    loading={false}
                    mainColor={mainColor}
                    applyColorToSurface={this.applyColorToSurface}
                    previewColor={previewColor}
                    sceneId={activeScene.uid}
                    sceneName={currentVariant.variantName}
                    sceneWorkspaces={sceneWorkspaces}
                    surfaces={currentVariant.surfaces}
                    surfaceColors={colors}
                    type={type}
                    updateCurrentSceneInfo={this.updateCurrentSceneInfo}
                    width={activeScene.width}
                    useAdapter
                  /> : null}
                  <div className={SceneManager.bottomBtnClass}>
                    <div className={`${SceneManager.bottomBtnClass}__btn-wrapper`}>
                      {variantSwitch}
                      {!isColorDetail && <Link className={`${SceneManager.bottomBtnClass}__btn-wrapper__more-area-btn`} to={`/active/use-our-image`} onClick={() => unsetActiveScenePolluted()} tabIndex='-1'>
                        <span className={`${SceneManager.bottomBtnClass}__btn-wrapper__more-area-btn__icon`}>
                          <FontAwesomeIcon className={`${SceneManager.bottomBtnClass}__btn-wrapper__more-area-btn__icon-1`} icon={['fal', 'square-full']} size='sm' />
                          <FontAwesomeIcon className={`${SceneManager.bottomBtnClass}__btn-wrapper__more-area-btn__icon-2`} icon={['fal', 'square-full']} size='sm' />
                          <FontAwesomeIcon className={`${SceneManager.bottomBtnClass}__btn-wrapper__more-area-btn__icon-3`} icon={['fal', 'square-full']} size='sm' />
                        </span>
                        <div className={`${SceneManager.bottomBtnClass}__btn-wrapper__more-area-btn__text`}><FormattedMessage id='MORE_SCENES' /></div>
                      </Link>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DndProvider>
    )
  }
}

const mapStateToProps = (state, props) => {
  let activeColor = void (0)
  let previewColor = void (0)
  const scenes = !props.isColorDetail && state.selectedSceneStatus && !state.selectedSceneStatus.openUnpaintedStockScene ? replaceSceneStatus(state.scenes, state.selectedSceneStatus) : state.scenes
  if (state.lp.activeColor) {
    activeColor = state.lp.activeColor
  }

  if (state.lp.activePreviewColor) {
    previewColor = state.lp.activePreviewColor
  }

  const sceneStatus = (props.isColorDetail)
    ? state.scenes.sceneStatusColorDetails[state.scenes.type] : scenes.sceneStatus[state.scenes.type]

  const selectedSceneStatusActiveScene = state.selectedSceneStatus &&
    !state.selectedSceneStatus.openUnpaintedStockScene &&
    scenes.sceneStatus &&
    scenes.sceneStatus[state.scenes.type]
    ? scenes.sceneStatus[state.scenes.type].find(scene => scene.id === scenes.activeScenes[0])
    : null

  const sceneStatusActiveSceneStore = !props.isColorDetail && state.selectedSceneStatus &&
    !state.selectedSceneStatus.openUnpaintedStockScene &&
    state.scenes.sceneStatus &&
    scenes.sceneStatus[state.scenes.type]
    ? state.scenes.sceneStatus[state.scenes.type].find(scene => scene.id === scenes.activeScenes[0])
    : null

  const selectedScenedVariant = (!props.isColorDetail && state.selectedSceneStatus) ? state.selectedSceneStatus.expectStockData.scene.variant : null

  const sceneOptions = ((scenes, isColorDetail) => {
    if (!isColorDetail) return scenes

    const sceneIds = sortBy(scenes, scene => sortBy(scene.category).toString()).reduce((accum = [], next) => {
      const last = accum[accum.length - 1]

      if (!last) return [next]

      if (sortBy(last.category).toString() !== sortBy(next.category).toString()) {
        return [
          ...accum,
          next
        ]
      }

      return accum
    }, []).map(scene => scene.id)

    return scenes.filter(({ id }) => sceneIds.indexOf(id) > -1)
  })(scenes.sceneCollection[state.scenes.type] || [], props.isColorDetail)

  const { navigationIntent, scenePolluted, stockSceneCache, activeSceneLabel, variantsLoading, scenesCollection, variantsCollection } = state

  return {
    scenes: sceneOptions,
    sceneStatus: sceneStatus,
    selectedSceneStatusActiveScene: selectedSceneStatusActiveScene,
    sceneStatusActiveSceneStore: sceneStatusActiveSceneStore,
    numScenes: scenes.numScenes,
    activeScenes: (props.isColorDetail) ? scenes.activeScenesColorDetails : scenes.activeScenes,
    isLoadingScenes: variantsLoading, // @todo may need more robust flag check to see if we need to add flag for bg image -RS
    activeColor: activeColor,
    previewColor: previewColor,
    sceneWorkspaces: state.sceneWorkspaces,
    isEditMode: state.isEditMode,
    sceneCount: state.sceneMetadata.length + 1,
    showSaveSceneModalFlag: state.showSaveSceneModal,
    // Created this to prevent the syncing warned below
    currentSceneType: state.scenes.type,
    saveSceneName: state.saveSceneName,
    selectedSceneStatus: state.selectedSceneStatus,
    showSavedConfirmModalFlag: state.showSavedConfirmModal,
    selectedScenedVariant: selectedScenedVariant,
    selectedSceneVariantChanged: state.scenes.selectedSceneVariantChanged,
    lpColors: state.lp.colors,
    colorMap: (state.colors && state.colors.items && state.colors.items.colorMap) ? state.colors.items.colorMap : null,
    selectedScenePaletteLoaded: state.scenes.selectedScenePaletteLoaded,
    navigationIntent,
    isActiveScenePolluted: scenePolluted,
    stockSceneCache,
    activeSceneLabel,
    scenesCollection,
    variantsCollection
    // NOTE: uncommenting this will sync scene type with redux data
    // we may not want that in case there are multiple instances with different scene collections running at once
    // type: state.scenes.type
    // scenes.sceneStatus[<scenes.sceneStatus.sceneType>].rooms[roomIndex].surfaces[surfaceIndex].color
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    // @todo deprecate -RS
    loadScenes: (type: string, brandId: string, options?: {}) => {
      dispatch(loadScenes(type, brandId, options))
    },
    fetchRemoteScenes: (sceneType: string, brandId: string, options: any, sceneEndPoint: string, handleSuccess: Function, handleFailure: Function) => {
      fetchRemoteScenes(sceneType, brandId, options, sceneEndPoint, handleSuccess, handleFailure, dispatch)
    },
    paintSceneSurface: (sceneId, surfaceId, color) => {
      dispatch(paintSceneSurface(sceneId, surfaceId, color))
    },
    unpaintSceneSurfaces: (sceneId) => {
      dispatch(unpaintSceneSurfaces(sceneId))
    },
    activateScene: (sceneId) => {
      dispatch(activateScene(sceneId))
    },
    deactivateScene: (sceneId) => {
      dispatch(deactivateScene(sceneId))
    },
    changeSceneVariant: (sceneId: number, variant: string) => {
      dispatch(changeSceneVariant(sceneId, variant))
    },
    addNewMask: (sceneId: number, surfaceId: number, variant: string, imageData: string) => {
      dispatch(addNewMask(sceneId, surfaceId, variant, imageData))
    },
    toggleEditMode: (currentEditMode: boolean) => {
      dispatch(toggleEditMode(currentEditMode))
    },
    updateCurrentSceneInfo: (sceneId: number, surfaceId: number) => {
      dispatch(updateCurrentSceneInfo(sceneId, surfaceId))
    },
    showSaveSceneModalAction: (shouldShow) => dispatch(showSaveSceneModal(shouldShow)),
    saveStockScene: (id: string, sceneName: string, sceneData: Object, sceneType: string, livePaletteColorsIdArray: Array<string>) => dispatch(saveStockScene(id, sceneName, sceneData, sceneType, livePaletteColorsIdArray)),
    showSavedConfirmModal: (shouldShow: boolean) => dispatch(showSavedConfirmModal(shouldShow)),
    setActiveScenePolluted: () => dispatch(setIsScenePolluted(POLLUTED_ENUM.POLLUTED_STOCK_SCENE)),
    unsetActiveScenePolluted: () => dispatch(setIsScenePolluted()),
    setSelectedSceneVariantChanged: () => dispatch(setSelectedSceneVariantChanged()),
    mergeLpColors: (colors: Object[]) => dispatch(mergeLpColors(colors)),
    replaceLpColors: (colors: Object[]) => dispatch(replaceLpColors(colors)),
    setSelectedScenePaletteLoaded: () => dispatch(setSelectedScenePaletteLoaded()),
    navigateToIntendedDestination: () => dispatch(navigateToIntendedDestination()),
    clearNavigationIntent: () => dispatch(clearNavigationIntent()),
    setActiveSceneLabel: (label: string) => dispatch(setActiveSceneLabel(label)),
    cacheStockScene: (data: any) => dispatch(cacheStockScene(data)),
    clearStockSceneCache: () => dispatch(clearStockSceneCache())
  }
}

export function getSceneInfoById (scene: Scene, sceneStatus: SceneStatus[]): {
  status: SceneStatus,
  variant: Variant,
  surfaces: Surface[]
} | void {
  const status: SceneStatus | void = find(sceneStatus, { 'id': scene && scene.id })

  if (typeof status !== 'undefined') {
    const sceneVariant: Variant | void = find(scene.variants, { 'variant_name': status.variant })

    if (typeof sceneVariant !== 'undefined' && sceneVariant.surfaces) {
      return {
        status: status,
        variant: sceneVariant,
        surfaces: sceneVariant.surfaces
      }
    }
  }

  return void (0)
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(WithConfigurationContext(SceneManager)))
