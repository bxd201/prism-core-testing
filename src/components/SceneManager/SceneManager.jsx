// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

import { SCENE_TYPES } from 'constants/globals'
import { loadScenes, paintSceneSurface, activateScene, deactivateScene } from '../../actions/scenes'
import TintableScene from './TintableScene'
import type { Color } from '../../shared/types/Colors'
import type { Scene } from '../../shared/types/Scene'
import ImagePreloader from '../../helpers/ImagePreloader'

import './SceneManager.scss'

type Props = {
  scenes: Array<Scene>,
  type: string,
  activeScenes: Array<number | string>,
  maxActiveScenes: number,
  loadScenes: Function,
  activateScene: Function,
  deactivateScene: Function,
  paintSceneSurface: Function,
  loadingScenes: boolean,
  activeColor: Color | void,
  previewColor: Color | void
}

type State = {
  currentSceneIndex: number
}

class SceneManager extends PureComponent<Props, State> {
  static baseClass = 'prism-scene-manager'

  static defaultProps = {
    maxActiveScenes: 2,
    type: SCENE_TYPES.ROOM
  }

  state = {
    currentSceneIndex: 0
  }

  constructor (props) {
    super(props)

    this.handleColorUpdate = this.handleColorUpdate.bind(this)
    this.handleClickSceneToggle = this.handleClickSceneToggle.bind(this)
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
    if (activeScenes.indexOf(id) > -1) {
      this.deactivateScene(id)
    } else {
      // ... otherwise activate this scene
      this.activateScene(id)
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

  render () {
    const { scenes, loadingScenes, activeColor, previewColor, activeScenes, type } = this.props

    if (loadingScenes) {
      return 'Loading...'
    }

    return (
      <div className={SceneManager.baseClass}>
        <div className={`${SceneManager.baseClass}__block`}>
          {/* POC scene-switching buttons to demonstrate performance */}
          {scenes.map((scene, index) => (
            <button key={scene.id}
              onClick={() => this.handleClickSceneToggle(scene.id)}
              className={`${SceneManager.baseClass}__btn ${activeScenes.indexOf(scene.id) > -1 ? `${SceneManager.baseClass}__btn--active` : ''}`}
              type='button'>

              <ImagePreloader key={scene.id}
                el={TintableScene}
                preload={[
                  scene.image,
                  scene.surfaces.map(surface => surface.mask),
                  scene.surfaces.map(surface => surface.shadows),
                  scene.surfaces.map(surface => surface.highlights)
                ]}

                interactive={false}
                width={scene.width}
                height={scene.height}
                type={type}
                sceneId={scene.id}
                background={scene.image}
                clickToPaintColor={activeColor}
                onUpdateColor={this.handleColorUpdate}
                previewColor={previewColor}
                surfaces={scene.surfaces}
              />
            </button>
          ))}
        </div>

        <div className={`${SceneManager.baseClass}__block`}>
          {activeScenes.map((sceneId, index) => {
            const scene = _.find(scenes, { id: sceneId })

            if (!scene) {
              return null
            }

            return (
              <ImagePreloader key={scene.id}
                el={TintableScene}
                preload={[
                  scene.image,
                  scene.surfaces.map(surface => surface.mask),
                  scene.surfaces.map(surface => surface.shadows),
                  scene.surfaces.map(surface => surface.highlights)
                ]}

                width={scene.width}
                height={scene.height}
                type={type}
                sceneId={scene.id}
                background={scene.image}
                clickToPaintColor={activeColor}
                onUpdateColor={this.handleColorUpdate}
                previewColor={previewColor}
                surfaces={scene.surfaces}
              />
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
    numScenes: state.scenes.numScenes,
    activeScenes: state.scenes.activeScenes,
    loadingScenes: state.scenes.loadingScenes,
    activeColor: activeColor,
    previewColor: previewColor
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
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SceneManager)
