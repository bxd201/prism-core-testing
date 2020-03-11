// @flow
import React, { createRef, PureComponent } from 'react'
import { connect } from 'react-redux'
import find from 'lodash/find'
import flattenDeep from 'lodash/flattenDeep'
import includes from 'lodash/includes'
import memoizee from 'memoizee'
import * as GA from 'src/analytics/GoogleAnalytics'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { DndProvider } from 'react-dnd-cjs'
import HTML5Backend from 'react-dnd-html5-backend-cjs'
import { injectIntl } from 'react-intl'

import { SCENE_TYPES, SCENE_VARIANTS } from 'constants/globals'
import {
  loadScenes,
  paintSceneSurface,
  activateScene,
  deactivateScene,
  changeSceneVariant,
  addNewMask,
  toggleEditMode,
  updateCurrentSceneInfo
} from '../../store/actions/scenes'
import TintableScene from './TintableScene'
import SceneVariantSwitch from './SceneVariantSwitch'
import ImagePreloader from '../../helpers/ImagePreloader'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import ConfigurationContext from '../../contexts/ConfigurationContext/ConfigurationContext'
import ColorPickerSlide from '../ColorPickerSlide/ColorPickerSlide'
import type { Color } from '../../shared/types/Colors.js.flow'
import type { Scene, SceneStatus, SceneWorkspace, Surface, Variant } from '../../shared/types/Scene'

import './SceneManager.scss'
import 'src/scss/convenience/visually-hidden.scss'
import SceneDownload from '../SceneDownload/SceneDownload'
import DynamicModal from '../DynamicModal/DynamicModal'
import { saveStockScene } from '../../store/actions/stockScenes'
import { showSavedConfirmModal, showSaveSceneModal } from '../../store/actions/persistScene'
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
import { replaceSceneStatus } from '../../shared/utils/sceneUtil'

const getRefDimension = (ref, dimName) => ref && ref.current ? ref.current.getBoundingClientRect()[dimName] : 0

const getThumbnailAssetArrayByScene = memoizee((sceneVariant: Variant, surfaces: Surface[]): string[] => {
  return flattenDeep([
    sceneVariant.thumb,
    surfaces.map(surface => surface.shadows),
    surfaces.map(surface => surface.mask),
    surfaces.map(surface => surface.highlights)
  ])
})

const getFullSizeAssetArrayByScene = memoizee((scene: Scene): string[] => {
  return flattenDeep([
    scene.variants.map((v: Variant) => [
      v.image,
      v.thumb,
      v.surfaces.map((s: Surface) => [
        s.mask,
        s.hitArea,
        s.shadows,
        s.highlights
      ])
    ])
  ])
})

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
  loadingScenes: boolean,
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
  onSceneChanged?: number => void,
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
  showSavedConfirmModal: Function
}

type State = {
  currentSceneIndex: number,
  uniqueSceneId: string
}

export class SceneManager extends PureComponent<Props, State> {
  static baseClass = 'prism-scene-manager'
  static contextType = ConfigurationContext
  static defaultProps = {
    expertColorPicks: false,
    interactive: true,
    maxActiveScenes: 1,
    type: SCENE_TYPES.ROOM
  }

  state = {
    currentSceneIndex: 0,
    uniqueSceneId: createUniqueSceneId()
  }

  constructor (props: Props) {
    super(props)

    this.handleColorUpdate = this.handleColorUpdate.bind(this)
    this.handleClickSceneToggle = this.handleClickSceneToggle.bind(this)
    this.changeVariant = this.changeVariant.bind(this)
    this.changeVariant = memoizee(this.changeVariant, { primitive: true, length: 1 })
    this.updateCurrentSceneInfo = this.updateCurrentSceneInfo.bind(this)
    this.saveSceneFromModal = this.saveSceneFromModal.bind(this)
    this.hideSaveSceneModal = this.hideSaveSceneModal.bind(this)
    this.hideSavedConfirmModal = this.hideSavedConfirmModal.bind(this)

    this.wrapperRef = createRef()
  }

  componentDidMount () {
    this.props.loadScenes(this.props.type)
    // @todo uncomment the two immediate lines below to add custom mask data for manual test.
    // this.props.addNewMask(1, 2, window.localStorage.getItem('sampleMask'))
    // this.props.toggleEditMode(false)
  }

  saveSceneFromModal (e: SyntheticEvent, saveSceneName: string) {
    e.preventDefault()
    e.stopPropagation()

    if (this.props.sceneStatus && this.props.activeScenes) {
      // @todo should I throw an error if no active scene or is this over kill? -RS
      const currentSceneData = this.props.sceneStatus.find(item => item.id === this.props.activeScenes[0])
      this.props.saveStockScene(this.state.uniqueSceneId, saveSceneName, currentSceneData, this.props.currentSceneType)
      this.props.showSavedConfirmModal(true)
    }
  }

  hideSaveSceneModal () {
    this.props.showSaveSceneModalAction(false)
  }

  hideSavedConfirmModal () {
    this.props.showSavedConfirmModal(false)
  }

  handleColorUpdate = function handleColorUpdate (sceneId: string, surfaceId: string, color: Color) {
    this.props.paintSceneSurface(sceneId, surfaceId, color)
  }

  handleClickSceneToggle = function handleClickSceneToggle (id: number) {
    const { activeScenes } = this.props

    // if this scene is active...
    if (includes(activeScenes, id)) {
      this.deactivateScene(id)
    } else {
      // ... otherwise activate this scene
      this.props.onSceneChanged && this.props.onSceneChanged(id)
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
      // compare prev and current scenes, continut to eliminate oldest until max active is all that remains
      deactivateScene(activeScenes.slice(0, activeScenes.length - maxActiveScenes + 1))
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
    const { changeSceneVariant, onVariantChanged } = this.props

    return function _changeVariant (variant: string) {
      onVariantChanged && onVariantChanged(variant)
      changeSceneVariant(sceneId, variant)
    }
  }

  render () {
    // eslint-disable-next-line no-unused-vars
    const { scenes,
      sceneStatus,
      loadingScenes,
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
      showSavedConfirmModalFlag } = this.props

    if (loadingScenes) {
      return <div className={`${SceneManager.baseClass}__loader`}><CircleLoader /></div>
    }

    const colors = []
    sceneStatus.map((status) => {
      status.surfaces.map((statusSurface) => {
        if (statusSurface.color) {
          colors.push(statusSurface.color)
        }
      })
    })

    const firstActiveSceneId = activeScenes[0]
    const firstActiveScene: Scene = scenes.filter(scene => (scene.id === firstActiveSceneId))[0]
    const firstActiveSceneInfo = getSceneInfoById(firstActiveScene, sceneStatus)

    return (
      <DndProvider backend={HTML5Backend}>
        <div className={SceneManager.baseClass} ref={this.wrapperRef}>
          {/* Do not use scene height for modal, use the sceneManager wrapper */}
          {showSaveSceneModalFlag ? <DynamicModal
            actions={[
              { text: intl.messages['SAVE_SCENE_MODAL.SAVE'], callback: this.saveSceneFromModal },
              { text: intl.messages['SAVE_SCENE_MODAL.CANCEL'], callback: this.hideSaveSceneModal }
            ]}
            description={intl.messages['SAVE_SCENE_MODAL.DESCRIPTION']}
            height={getRefDimension(this.wrapperRef, 'height')}
            allowInput
            inputDefault={`${intl.messages['SAVE_SCENE_MODAL.DEFAULT_DESCRIPTION']} ${this.props.sceneCount}`} /> : null}
          { /* ----------Confirm modal ---------- */ }
          {showSavedConfirmModalFlag ? <DynamicModal
            actions={[
              { text: intl.messages['SCENE_MANAGER.OK'], callback: this.hideSavedConfirmModal }
            ]}
            description={intl.messages['SCENE_MANAGER.SCENE_SAVED']}
            height={getRefDimension(this.wrapperRef, 'height')} /> : null}
          {activeScenes.length === 1 && expertColorPicks ? <ColorPickerSlide {...getSceneInfoById(find(scenes, { 'id': activeScenes[0] }), sceneStatus).variant} /> : null}
          <div className={`${SceneManager.baseClass}__block ${SceneManager.baseClass}__block--tabs`} role='radiogroup' aria-label='scene selector'>
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
                          height={scene.height}
                          interactive={false}
                          isEditMode={this.props.isEditMode}
                          loading={loading}
                          mainColor={mainColor}
                          onUpdateColor={this.handleColorUpdate}
                          previewColor={previewColor}
                          sceneId={scene.id}
                          sceneName={sceneVariant.name}
                          sceneWorkspaces={sceneWorkspaces}
                          surfaces={surfaces}
                          surfaceStatus={status.surfaces}
                          type={type}
                          width={scene.width}
                        />
                      )}
                    </ImagePreloader>
                  </div>
                  {activeMarker}
                </button>
              )
            })}
          </div>

          <div className={`${SceneManager.baseClass}__block ${SceneManager.baseClass}__block--scenes`} role='main'>
            {activeScenes.map((sceneId, index) => {
              const scene: Scene = scenes.filter(
                scene => scene.id === sceneId
              )[0]

              if (!scene) {
                return null
              }

              const sceneInfo = getSceneInfoById(scene, sceneStatus)

              if (!sceneInfo) {
                console.warn(
                  `Cannot find scene variant based on id ${scene.id}`
                )
                return void 0
              }

              const status: SceneStatus = sceneInfo.status
              const sceneVariant: Variant = sceneInfo.variant
              const surfaces: Surface[] = sceneInfo.surfaces

              let variantSwitch = null

              // if we have more than one variant for this scene...
              if (scene.variant_names.length > 1) {
                // if we have day and night variants...
                // TODO: Remove this dayNightToggle check, this is for demonstration purposes
                if (
                  SceneVariantSwitch.DayNight.isCompatible(scene.variant_names)
                ) {
                  // ... then create a day/night variant switch
                  variantSwitch = (
                    <SceneVariantSwitch.DayNight
                      currentVariant={status.variant}
                      variants={[SCENE_VARIANTS.DAY, SCENE_VARIANTS.NIGHT]}
                      onChange={this.changeVariant(sceneId)}
                      sceneId={scene.id}
                    />
                  )
                }
              }

              return (
                <div className={`${SceneManager.baseClass}__scene-wrapper`} key={sceneId}>
                  <ImagePreloader preload={getFullSizeAssetArrayByScene(scene)}>
                    {({ loading, error }) => (
                      <TintableScene
                        background={sceneVariant.image}
                        clickToPaintColor={activeColor}
                        el={TintableScene}
                        error={error}
                        height={scene.height}
                        imageValueCurve={sceneVariant.normalizedImageValueCurve}
                        interactive={interactive}
                        isEditMode={this.props.isEditMode}
                        loading={loading}
                        mainColor={mainColor}
                        onUpdateColor={this.handleColorUpdate}
                        previewColor={previewColor}
                        sceneId={sceneId}
                        sceneName={sceneVariant.name}
                        /* eslint-disable-next-line no-undef */
                        sceneWorkspaces={sceneWorkspaces}
                        surfaces={surfaces}
                        surfaceStatus={status.surfaces}
                        type={type}
                        updateCurrentSceneInfo={this.updateCurrentSceneInfo}
                        width={scene.width}
                      />
                    )}
                  </ImagePreloader>
                  {variantSwitch}
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <SceneDownload {...{ buttonCaption: 'DOWNLOAD_SCENE', colors: colors, sceneInfo: firstActiveSceneInfo }} />
        </div>
      </DndProvider>
    )
  }
}

const mapStateToProps = (state, props) => {
  let activeColor = void (0)
  let previewColor = void (0)
  const scenes = state.selectedSceneStatus ? replaceSceneStatus(state.scenes, state.selectedSceneStatus) : state.scenes

  if (state.lp.activeColor) {
    activeColor = state.lp.activeColor
  }

  if (state.lp.activePreviewColor) {
    previewColor = state.lp.activePreviewColor
  }

  return {
    scenes: scenes.sceneCollection[state.scenes.type],
    sceneStatus: scenes.sceneStatus[state.scenes.type],
    numScenes: scenes.numScenes,
    activeScenes: scenes.activeScenes,
    loadingScenes: scenes.loadingScenes,
    activeColor: activeColor,
    previewColor: previewColor,
    // @todo - the idea is the scene workspace is the data object created by the mask editor.
    sceneWorkspaces: state.sceneWorkspaces,
    isEditMode: state.isEditMode,
    sceneCount: state.scenesAndRegions.length + 1,
    showSaveSceneModalFlag: state.showSaveSceneModal,
    // Created this to prevent the syncing warned below
    currentSceneType: state.scenes.type,
    saveSceneName: state.saveSceneName,
    selectedSceneStatus: state.selectedSceneStatus,
    showSavedConfirmModalFlag: state.showSavedConfirmModal
    // NOTE: uncommenting this will sync scene type with redux data
    // we may not want that in case there are multiple instances with different scene collections running at once
    // type: state.scenes.type
    // scenes.sceneStatus[<scenes.sceneStatus.sceneType>].rooms[roomIndex].surfaces[surfaceIndex].color
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadScenes: (type: string) => {
      dispatch(loadScenes(type))
    },
    paintSceneSurface: (sceneId, surfaceId, color) => {
      dispatch(paintSceneSurface(sceneId, surfaceId, color))
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
    saveStockScene: (id: string, sceneName: string, sceneData: Object, sceneType: string) => dispatch(saveStockScene(id, sceneName, sceneData, sceneType)),
    showSavedConfirmModal: (shouldShow: boolean) => dispatch(showSavedConfirmModal(shouldShow))
  }
}

function getSceneInfoById (scene: Scene, sceneStatus: SceneStatus[]): {
  status: SceneStatus,
  variant: Variant,
  surfaces: Surface[]
} | void {
  const status: SceneStatus | void = find(sceneStatus, { 'id': scene.id })

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

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SceneManager))
