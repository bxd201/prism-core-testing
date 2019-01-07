// @flow
import React, { PureComponent, Fragment } from 'react'
import { uniqueId, uniq, without, concat } from 'lodash'

import type { Color } from '../../shared/types/Colors'
import type { Surface } from '../../shared/types/Scene'
import TintableSceneHitArea from './TintableSceneHitArea'
import TintableSceneSurface from './TintableSceneSurface'
import TintableSceneSVGDefs from './TintableSceneSVGDefs'
import TintableSceneOverlay from './TintableSceneOverlay'

type Props = {
  background: string,
  type: string,
  surfaces: Surface[],
  width: number,
  height: number,
  render: boolean,
  interactive: boolean,
  sceneId: string | number,
  previewColor?: Color | void,
  mainColor?: Color | void, // eslint-disable-line
  clickToPaintColor?: Color,
  onUpdateColor?: Function,
  loading?: boolean,
  error?: boolean
}

type State = {
  activePreviewSurfaces: Array<string | number>,
  instanceId: string,
  hitAreaLoaded: boolean,
  hitAreaError: boolean
}

class TintableScene extends PureComponent<Props, State> {
  static classNames = {
    base: 'prism-scene-manager__scene',
    inner: 'prism-scene-manager__scene__inner'
  }

  static defaultProps = {
    render: true,
    interactive: true,
    loading: false,
    error: false,
    surfaces: []
  }

  static getFilterId (sceneId: string | number, surfaceId: string | number, suffix?: string) {
    return `scene${sceneId}_surface${surfaceId}_tinter-filter${suffix ? `_${suffix}` : ''}`
  }

  static getMaskId (sceneId: string | number, surfaceId: string | number, suffix?: string) {
    return `scene${sceneId}_surface${surfaceId}_object-mask${suffix ? `_${suffix}` : ''}`
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

    this.state = {
      activePreviewSurfaces: [],
      // must be unique among ALL TintableScene instances so as not to cross-contaminate filter definition IDs
      instanceId: uniqueId('TS'),
      hitAreaError: false,
      hitAreaLoaded: props.surfaces.length === 0
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

  updateSurfaceColor (surfaceId: string, color: Color) {
    this.props.onUpdateColor && this.props.onUpdateColor(this.props.sceneId, surfaceId, color)
  }

  getTintColorBySurface (surface: Surface): ?Color {
    const { previewColor } = this.props
    const { activePreviewSurfaces } = this.state

    let tintColor = void (0)

    if (activePreviewSurfaces.indexOf(surface.id) > -1) {
      tintColor = previewColor
    } else if (surface && surface.color) {
      tintColor = surface.color
    }

    return tintColor
  }

  render () {
    const { surfaces, background, width, height, render, interactive, type, loading, error, sceneId } = this.props
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
      content = <TintableSceneOverlay type={TintableSceneOverlay.TYPES.ERROR} message='Error loading scene' />
    } else {
      content = (
        <Fragment>
          {!loading && (
            <Fragment>
              <div className={`${TintableScene.classNames.base}__svg-defs`}>
                <svg x='0' y='0' width='0' height='0' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox={`0 0 ${width} ${height}`}>
                  <defs>
                    {surfaces.map((surface, index) => {
                      const tintColor: ?Color = this.getTintColorBySurface(surface)
                      if (tintColor) {
                        return (
                          <TintableSceneSVGDefs
                            key={surface.id}
                            type={type}
                            highlightMap={surface.highlights}
                            shadowMap={surface.shadows}
                            filterId={TintableScene.getFilterId(instanceId, surface.id)}
                            filterColor={tintColor.hex}
                            maskId={TintableScene.getMaskId(instanceId, surface.id)}
                            maskImage={surface.mask}
                          />
                        )
                      }
                    })}
                  </defs>
                </svg>
              </div>

              <div className={`${TintableScene.classNames.base}__tint-wrapper`}>
                <img className={`${TintableScene.classNames.base}__natural`} src={background} />
                {surfaces.map((surface: Surface, index) => {
                  const tintColor: ?Color = this.getTintColorBySurface(surface)
                  if (tintColor) {
                    return (
                      <TintableSceneSurface key={surface.id}
                        type={type}
                        image={background}
                        width={width}
                        height={height}
                        maskId={TintableScene.getMaskId(instanceId, surface.id)}
                        filterId={TintableScene.getFilterId(instanceId, surface.id)}
                      />
                    )
                  }
                })}
              </div>
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
                  color={surface.color}
                  svgSource={surface.hitArea} />
              ))}
            </div>
          )}

          {hitAreaError ? (
            <TintableSceneOverlay type={TintableSceneOverlay.TYPES.ERROR} message='Error loading paintable surfaces' />
          ) : (loading || (interactive && !hitAreaLoaded)) ? (
            <TintableSceneOverlay type={TintableSceneOverlay.TYPES.LOADING} />
          ) : null}
        </Fragment>
      )
    }

    return (
      <div className={TintableScene.classNames.base} style={{ maxWidth: `${Math.round(width / 2)}px` }}>
        <div className={TintableScene.classNames.inner} style={{ paddingTop: `${ratio * 100}%` }}>
          {content}
        </div>
      </div>
    )
  }
}

export default TintableScene
