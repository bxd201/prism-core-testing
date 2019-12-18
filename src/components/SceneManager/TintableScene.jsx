// @flow
import React, { PureComponent, Fragment } from 'react'
import includes from 'lodash/includes'
import uniqueId from 'lodash/uniqueId'
import uniq from 'lodash/uniq'
import without from 'lodash/without'
import concat from 'lodash/concat'
import find from 'lodash/find'
import kebabCase from 'lodash/kebabCase'
import { LiveMessage } from 'react-aria-live'
import { varValues } from 'variables'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

import { ensureFullyQualifiedAssetUrl } from '../../shared/helpers/DataUtils'
import type { Color } from '../../shared/types/Colors'
import type { SceneWorkspace, Surface, SurfaceStatus } from '../../shared/types/Scene'
import TintableSceneHitArea from './TintableSceneHitArea'
import TintableSceneSurface from './TintableSceneSurface'
import TintableSceneSVGDefs from './TintableSceneSVGDefs'
import GenericOverlay from '../Overlays/GenericOverlay/GenericOverlay'

type Props = {
  background: string,
  clickToPaintColor?: Color,
  error?: boolean,
  height: number,
  imageValueCurve: string,
  interactive: boolean,
  isEditMode: boolean,
  loading?: boolean,
  mainColor?: Color | void, // eslint-disable-line
  onUpdateColor?: Function,
  previewColor?: Color | void,
  render: boolean,
  sceneId: number,
  sceneName: string,
  sceneWorkspaces?: SceneWorkspace[],
  surfaceStatus: SurfaceStatus[],
  surfaces: Surface[],
  type: string,
  updateCurrentSceneInfo?: Function,
  width: number,
}

type State = {
  activePreviewSurfaces: Array<string | number>,
  instanceId: string,
  hitAreaLoaded: boolean,
  hitAreaError: boolean,
  currentSurface: number | null
}

class TintableScene extends PureComponent<Props, State> {
  static classNames = {
    base: 'prism-scene-manager__scene',
    inner: 'prism-scene-manager__scene__inner',
    transition: 'prism-scene-manager__transition'
  }

  static defaultProps = {
    render: true,
    interactive: true,
    loading: false,
    error: false,
    surfaces: []
  }

  hitAreaLoadingCount: number = 0

  constructor (props: Props) {
    super(props)

    this.handleColorDrop = this.handleColorDrop.bind(this)
    this.handleClickSurface = this.handleClickSurface.bind(this)
    this.handleOver = this.handleOver.bind(this)
    this.handleOut = this.handleOut.bind(this)
    this.handleHitAreaLoadingSuccess = this.handleHitAreaLoadingSuccess.bind(this)
    this.handleHitAreaLoadingError = this.handleHitAreaLoadingError.bind(this)
    this.setCurrentSurface = this.setCurrentSurface.bind(this)
    this.getMaskImage = this.getMaskImage.bind(this)

    this.state = {
      activePreviewSurfaces: [],
      // must be unique among ALL TintableScene instances so as not to cross-contaminate filter definition IDs
      instanceId: uniqueId('TS'),
      hitAreaError: false,
      hitAreaLoaded: props.surfaces.length === 0,
      currentSurface: null
    }

    // set non-state property of this instance for tracking how many hit areas have loaded -- we don't need to rerender as this changes
    this.hitAreaLoadingCount = this.props.surfaces.length
  }

  handleHitAreaLoadingSuccess = function handleHitAreaLoadingSuccess () {
    // one more hit area has loaded
    this.hitAreaLoadingCount--

    // if all have loaded...
    if (this.hitAreaLoadingCount <= 0) {
      // ... change state
      this.setState({ hitAreaLoaded: true })
    }
  }

  handleHitAreaLoadingError = function handleHitAreaLoadingError () {
    this.setState({ hitAreaError: true })
  }

  handleClickSurface = function handleClickSurface (surfaceId: string) {
    const { clickToPaintColor } = this.props
    if (this.props.updateCurrentSceneInfo && this.props.isEditMode) {
      this.props.updateCurrentSceneInfo(this.props.sceneId, surfaceId)

      return
    }

    if (clickToPaintColor) {
      this.updateSurfaceColor(surfaceId, clickToPaintColor)
    }
  }

  handleColorDrop = function handleColorDrop (surfaceId: string, color: Color) {
    // clear out all active preview surfaces
    this.setState({
      activePreviewSurfaces: []
    })

    // update the specified surface of this scene to display the provided color
    this.updateSurfaceColor(surfaceId, color)
  }

  handleOver = function handleOver (surfaceId: string) {
    const { activePreviewSurfaces } = this.state

    // add the specified surface to activePreviewSurfaces -- this is an array since a one-for-one add/remove
    // was adding/removing in the order that the surfaces exist in the scene data, not in the hovering in/out order
    this.setState({
      activePreviewSurfaces: uniq(concat(activePreviewSurfaces, surfaceId))
    })
  }

  handleOut = function handleOut (surfaceId: string) {
    const { activePreviewSurfaces } = this.state

    this.setState({
      activePreviewSurfaces: without(activePreviewSurfaces, surfaceId)
    })
  }

  updateSurfaceColor = function updateSurfaceColor (surfaceId: string, color: Color) {
    this.props.onUpdateColor && this.props.onUpdateColor(this.props.sceneId, surfaceId, color)
  }

  getTintColorBySurface = function getTintColorBySurface (surface: Surface): ?Color {
    const { previewColor, surfaceStatus } = this.props
    const { activePreviewSurfaces } = this.state

    let tintColor = void (0)
    // get the SurfaceStatus object associated with the provided Surface
    const status: ?SurfaceStatus = surface ? find(surfaceStatus, { 'id': surface.id }) : void (0)
    // if available, extract the color set for this surface from SurfaceStatus
    const surfaceColor: ?Color = status ? status.color : void (0)

    // if this surface is one of the active preview surfaces...
    if (includes(activePreviewSurfaces, surface.id)) {
      // ... use the previewColor prop for this surface's color
      tintColor = previewColor
    } else if (surfaceColor) {
      // ... if surfaceColor has been defined and there's no preview color, tint our surface with it
      tintColor = surfaceColor
    }

    return tintColor
  }

  setCurrentSurface = function setCurrentSurface (surfaceId: number) {
    this.setState({ currentSurface: surfaceId })
  }

  getMaskImage = function getMaskImage (surface: Surface) {
    if (this.props.sceneWorkspaces && this.props.sceneWorkspaces.length) {
      const sceneWorkspaces = find(this.props.sceneWorkspaces, { surfaceId: surface.id })

      if (sceneWorkspaces) {
        return sceneWorkspaces.imageData
      }
    }

    return surface.mask.path
  }

  render () {
    const { surfaces, sceneName, background, width, height, render, interactive, type, loading, error, sceneId, imageValueCurve } = this.props
    const { instanceId, hitAreaError, hitAreaLoaded } = this.state
    const ratio = height / width

    if (!render) {
      return null
    }

    if (isNaN(ratio) || !isFinite(ratio) || !type || !sceneId || !background) {
      console.warn('TintableScene will not render without all required props.')
      return null
    }

    let content = null

    if (error) {
      content = <GenericOverlay type={GenericOverlay.TYPES.ERROR} message='Error loading scene' />
    } else {
      // run our background image through here to eliminate relative references
      const _background = ensureFullyQualifiedAssetUrl(background)

      content = (
        <Fragment>
          {!loading && (
            <Fragment>
              <div className={`${TintableScene.classNames.base}__svg-defs`}>
                <TransitionGroup className={`${TintableScene.classNames.transition}__svg-defs`}>
                  {surfaces.map((surface, index) => {
                    const { mask, highlights, shadows, id } = surface
                    const tintColor: ?Color = this.getTintColorBySurface(surface)
                    if (tintColor && mask) {
                      return (
                        <CSSTransition
                          key={`${id}_${tintColor.hex}`}
                          timeout={varValues.scenes.tintTransitionTime}
                          mountOnEnter
                          classNames={`${TintableScene.classNames.transition}__svg-defs__def-`}>
                          <TintableSceneSVGDefs
                            type={type}
                            width={width}
                            height={height}
                            highlightMap={ensureFullyQualifiedAssetUrl(highlights)}
                            shadowMap={ensureFullyQualifiedAssetUrl(shadows)}
                            filterId={getFilterId(instanceId, id, tintColor.hex)}
                            filterColor={tintColor.hex}
                            filterImageValueCurve={imageValueCurve}
                            maskId={getMaskId(instanceId, id, tintColor.hex)}
                            maskImage={this.getMaskImage(surface)}
                          />
                        </CSSTransition>
                      )
                    }
                  })}
                </TransitionGroup>
              </div>

              <div className={`${TintableScene.classNames.base}__tint-wrapper`}>
                <img className={`${TintableScene.classNames.base}__natural`} src={_background} alt={sceneName} />
                <TransitionGroup className={`${TintableScene.classNames.transition}__colors`}>
                  {surfaces.map((surface: Surface, index) => {
                    const tintColor: ?Color = this.getTintColorBySurface(surface)
                    if (tintColor) {
                      return (
                        <CSSTransition
                          key={`${surface.id}_${tintColor.hex}`}
                          timeout={varValues.scenes.tintTransitionTime}
                          mountOnEnter
                          classNames={`${TintableScene.classNames.transition}__colors__color-`}>
                          <TintableSceneSurface
                            type={type}
                            image={_background}
                            width={width}
                            height={height}
                            maskId={getMaskId(instanceId, surface.id, tintColor.hex)}
                            filterId={getFilterId(instanceId, surface.id, tintColor.hex)}
                          />
                        </CSSTransition>
                      )
                    }
                  })}
                </TransitionGroup>
              </div>

              <LiveMessage message={`${sceneName} scene has been loaded`} aria-live='polite' />
            </Fragment>
          )}

          {interactive && (
            <div className={`${TintableScene.classNames.base}__hit-wrapper`}>
              {surfaces.map((surface, index) => (
                <TintableSceneHitArea key={surface.id}
                  id={surface.id}
                  onDrop={this.handleColorDrop}
                  onOver={this.handleOver}
                  onOut={this.handleOut}
                  onLoadingSuccess={this.handleHitAreaLoadingSuccess}
                  onLoadingError={this.handleHitAreaLoadingError}
                  onClick={this.handleClickSurface}
                  svgSource={surface.hitArea} />
              ))}
            </div>
          )}

          {hitAreaError ? (
            <GenericOverlay type={GenericOverlay.TYPES.ERROR} message='Error loading paintable surfaces' />
          ) : (loading || (interactive && !hitAreaLoaded)) ? (
            <GenericOverlay type={GenericOverlay.TYPES.LOADING} />
          ) : null}
        </Fragment>
      )
    }

    return (
      <div className={TintableScene.classNames.base}>
        <div className={TintableScene.classNames.inner} style={{ paddingTop: `${ratio * 100}%` }}>
          {content}
        </div>
      </div>
    )
  }
}

export default TintableScene

function getFilterId (sceneId: string, surfaceId: string | number, suffix?: string) {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_tinter-filter${suffix ? `_${suffix}` : ''}`)
}

function getMaskId (sceneId: string, surfaceId: string | number, suffix?: string) {
  return kebabCase(`scene${sceneId}_surface${surfaceId}_object-mask${suffix ? `_${suffix}` : ''}`)
}
