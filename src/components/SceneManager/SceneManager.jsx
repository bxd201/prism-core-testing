// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

import { loadScenes, paintSceneSurface, activateScene, deactivateScene } from '../../actions/scenes'
import TintableScene from './TintableScene'

import './SceneManager.scss'

type Props = {
  scenes: Array<any>,
  activeScenes: Array<number | string>,
  maxActiveScenes: number,
  loadScenes: Function,
  activateScene: Function,
  deactivateScene: Function,
  paintSceneSurface: Function,
  loadingScenes: boolean,
  activeColor: string | void,
  previewColor: string | void
}

type State = {
  currentSceneIndex: number
}

class SceneManager extends PureComponent<Props, State> {
  static baseClass = 'prism-scene-manager'

  static defaultProps = {
    maxActiveScenes: 2
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
    this.props.loadScenes()
  }

  componentDidUpdate (prevProps) {
    const { activeScenes, scenes, activateScene } = this.props

    // if we have ZERO active scenes, but we DO have scenes...
    if (scenes && (!activeScenes || activeScenes.length === 0)) {
      // ... activate the first available scene
      activateScene(scenes[0].id)
    }
  }

  handleColorUpdate = function handleColorUpdate (sceneId, surfaceId, color) {
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
    const { scenes, loadingScenes, activeColor, previewColor, activeScenes } = this.props

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

              <TintableScene
                sceneId={scene.id}
                interactive={false}
                background={scene.thumb}
                clickToPaintColor={activeColor}
                surfaces={scene.surfaces.map(surface => ({
                  id: surface.id,
                  mask: surface.mask,
                  hitArea: surface.hitArea,
                  color: surface.color || void (0)
                }))}
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
              <TintableScene key={scene.id}
                sceneId={scene.id}
                background={scene.image}
                clickToPaintColor={activeColor}
                onUpdateColor={this.handleColorUpdate}
                previewColor={previewColor}
                surfaces={scene.surfaces.map(surface => ({
                  id: surface.id,
                  mask: surface.mask,
                  hitArea: surface.hitArea,
                  color: surface.color || void (0)
                }))}
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

  if (state.lp.activeColor && state.lp.activeColor.hex) {
    activeColor = state.lp.activeColor.hex
  }

  if (state.lp.activePreviewColor && state.lp.activePreviewColor.hex) {
    previewColor = state.lp.activePreviewColor.hex
  }

  return {
    scenes: state.scenes.scenes,
    numScenes: state.scenes.numScenes,
    activeScenes: state.scenes.activeScenes,
    loadingScenes: state.scenes.loadingScenes,
    activeColor: activeColor,
    previewColor: previewColor
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadScenes: () => {
      dispatch(loadScenes())
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
