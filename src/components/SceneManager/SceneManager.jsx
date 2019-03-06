// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import find from 'lodash/find'
import includes from 'lodash/includes'
import memoizee from 'memoizee'
import ReactGA from 'react-ga'

import { SCENE_TYPES, SCENE_VARIANTS } from 'constants/globals'
import { loadScenes, paintSceneSurface, activateScene, deactivateScene, changeSceneVariant } from '../../store/actions/scenes'
import TintableScene from './TintableScene'
import SceneVariantSwitch from './SceneVariantSwitch'
import ImagePreloader from '../../helpers/ImagePreloader'
import { ensureFullyQualifiedAssetUrl } from '../../shared/helpers/DataUtils'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { Color } from '../../shared/types/Colors'
import type { Scene, SceneStatus, Surface, Variant } from '../../shared/types/Scene'

import './SceneManager.scss'

type Props = {
  scenes: Scene[],
  sceneStatus: SceneStatus[],
  type: string,
  activeScenes: Array<number | string>,
  maxActiveScenes: number,
  loadScenes: Function,
  activateScene: Function,
  deactivateScene: Function,
  paintSceneSurface: Function,
  changeSceneVariant: Function,
  loadingScenes: boolean,
  activeColor: Color | void,
  mainColor: Color | void,
  previewColor: Color | void,
  interactive: boolean
}

type State = {
  currentSceneIndex: number
}

class SceneManager extends PureComponent<Props, State> {
  static baseClass = 'prism-scene-manager'

  static defaultProps = {
    maxActiveScenes: 2,
    type: SCENE_TYPES.ROOM,
    interactive: true
  }

  state = {
    currentSceneIndex: 0
  }

  constructor (props) {
    super(props)

    this.handleColorUpdate = this.handleColorUpdate.bind(this)
    this.handleClickSceneToggle = this.handleClickSceneToggle.bind(this)
    this.changeVariant = this.changeVariant.bind(this)
  }

  componentDidMount () {
    this.props.loadScenes(this.props.type)
  }

  handleColorUpdate = function handleColorUpdate (sceneId, surfaceId, color: Color) {
    this.props.paintSceneSurface(sceneId, surfaceId, color)
  }

  handleClickSceneToggle = function handleClickSceneToggle (id) {
    const { activeScenes } = this.props

    // if this scene is active...
    if (includes(activeScenes, id)) {
      this.deactivateScene(id)
    } else {
      // ... otherwise activate this scene
      this.activateScene(id)
      ReactGA.event({
        category: 'Scene Manager',
        action: 'Toggle Active Scene',
        label: 'Toggle Active Scene'
      })
    }
  }

  activateScene (id) {
    const { activeScenes, maxActiveScenes, activateScene, deactivateScene } = this.props

    // if active scenes exceed or match max active scenes...
    if (activeScenes.length >= parseInt(maxActiveScenes, 10)) {
      // compare prev and current scenes, continut to eliminate oldest until max active is all that remains
      deactivateScene(activeScenes.slice(0, activeScenes.length - maxActiveScenes + 1))
    }

    activateScene(id)
  }

  deactivateScene (id) {
    const { activeScenes, deactivateScene } = this.props

    if (activeScenes.length === 1) {
      // don't let the user deactivate the last scene
      return
    }
    // ... deactivate it
    deactivateScene(id)
  }

  changeVariant = memoizee(function changeVariant (sceneId: number) {
    const { changeSceneVariant } = this.props

    return function _changeVariant (variant: string) {
      changeSceneVariant(sceneId, variant)
    }
  }, { primitive: true, length: 1 })

  render () {
    const { scenes, sceneStatus, loadingScenes, activeColor, previewColor, mainColor, activeScenes, type, interactive } = this.props

    if (loadingScenes) {
      return <CircleLoader className={`${SceneManager.baseClass}__loader`} />
    }

    return (
      <div className={SceneManager.baseClass}>
        <div className={`${SceneManager.baseClass}__block ${SceneManager.baseClass}__block--tabs`}>
          {/* POC scene-switching buttons to demonstrate performance */}
          {scenes.map((scene, index) => {
            const sceneId = scene.id

            const status: SceneStatus = find(sceneStatus, { 'id': sceneId })
            const sceneVariant: Variant = find(scene.variants, { 'variant_name': status.variant })
            const surfaces: Surface[] = sceneVariant.surfaces
            const activeMarker = includes(activeScenes, scene.id)
              ? <FontAwesomeIcon icon={['fa', 'check']} className={`${SceneManager.baseClass}__flag`} />
              : null

            return (
              // TODO: Convert these to labels around checkboxes since that's how they're being used
              <button key={sceneId}
                onClick={() => this.handleClickSceneToggle(scene.id)}
                className={`${SceneManager.baseClass}__btn ${includes(activeScenes, scene.id) ? `${SceneManager.baseClass}__btn--active` : ''}`}
                type='button'>

                <span className='visually-hidden'>{sceneVariant.name}</span>
                <div role='presentation'>
                  <ImagePreloader
                    el={TintableScene}
                    preload={[
                      sceneVariant.image,
                      surfaces.map(surface => surface.shadows),
                      surfaces.map(surface => surface.mask),
                      surfaces.map(surface => surface.hitArea),
                      surfaces.map(surface => surface.highlights)
                    ]}
                    interactive={false}
                    width={scene.width}
                    height={scene.height}
                    type={type}
                    sceneId={sceneId}
                    background={ensureFullyQualifiedAssetUrl(sceneVariant.image)}
                    clickToPaintColor={activeColor}
                    onUpdateColor={this.handleColorUpdate}
                    previewColor={previewColor}
                    mainColor={mainColor}
                    surfaceStatus={status.surfaces}
                    surfaces={surfaces}
                  />
                </div>
                {activeMarker}
              </button>
            )
          })}
        </div>

        <div className={`${SceneManager.baseClass}__block ${SceneManager.baseClass}__block--scenes`}>
          {activeScenes.map((sceneId, index) => {
            const scene: Scene = scenes.filter(scene => (scene.id === sceneId))[0]

            if (!scene) {
              return null
            }

            const status: SceneStatus = find(sceneStatus, { 'id': sceneId })
            const sceneVariant: Variant = find(scene.variants, { 'variant_name': status.variant })
            const surfaces: Surface[] = sceneVariant.surfaces

            let variantSwitch = null

            // if we have more than one variant for this scene...
            if (scene.variant_names.length > 1) {
              // if we have day and night variants...
              if (SceneVariantSwitch.DayNight.isCompatible(scene.variant_names)) {
                // ... then create a day/night variant switch
                variantSwitch = <SceneVariantSwitch.DayNight currentVariant={status.variant} variants={[SCENE_VARIANTS.DAY, SCENE_VARIANTS.NIGHT]} onChange={this.changeVariant(sceneId)} />
              }
            }

            return (
              <div className={`${SceneManager.baseClass}__scene-wrapper`} key={sceneId}>
                <ImagePreloader
                  el={TintableScene}
                  preload={[
                    sceneVariant.image,
                    surfaces.map(surface => surface.mask),
                    surfaces.map(surface => surface.shadows),
                    surfaces.map(surface => surface.hitArea),
                    surfaces.map(surface => surface.highlights)
                  ]}
                  width={scene.width}
                  height={scene.height}
                  interactive={interactive}
                  type={type}
                  sceneId={sceneId}
                  background={ensureFullyQualifiedAssetUrl(sceneVariant.image)}
                  clickToPaintColor={activeColor}
                  onUpdateColor={this.handleColorUpdate}
                  previewColor={previewColor}
                  mainColor={mainColor}
                  surfaceStatus={status.surfaces}
                  surfaces={surfaces}
                  imageValueCurve={sceneVariant.normalizedImageValueCurve}
                  sceneName={sceneVariant.name}
                />
                {variantSwitch}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  let activeColor = void (0)
  let previewColor = void (0)

  if (state.lp.activeColor) {
    activeColor = state.lp.activeColor
  }

  if (state.lp.activePreviewColor) {
    previewColor = state.lp.activePreviewColor
  }

  return {
    scenes: state.scenes.sceneCollection[state.scenes.type],
    sceneStatus: state.scenes.sceneStatus[state.scenes.type],
    numScenes: state.scenes.numScenes,
    activeScenes: state.scenes.activeScenes,
    loadingScenes: state.scenes.loadingScenes,
    activeColor: activeColor,
    previewColor: previewColor
    // NOTE: uncommenting this will sync scene type with redux data
    // we may not want that in case there are multiple instances with different scene collections running at once
    // leaving here for posterity
    // type: state.scenes.type
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
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SceneManager)
