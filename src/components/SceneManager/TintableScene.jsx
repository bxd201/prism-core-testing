// @flow
import React, { PureComponent, Fragment } from 'react'
import _ from 'lodash'

import TintableSceneHitArea from './TintableSceneHitArea'
import TintableSceneSurface from './TintableSceneSurface'
import TintableSceneSVGDefs from './TintableSceneSVGDefs'

type Props = {
  background: string,
  surfaces: Array<{
    id: string,
    mask: string,
    color?: string,
    hitArea: string
  }>,
  width: number,
  height: number,
  render: boolean,
  interactive: boolean,
  sceneId: string | number,
  previewColor?: string | void,
  clickToPaintColor?: string,
  onUpdateColor?: Function
}

type State = {
  activePreviewSurfaces: Array<string | number>,
  instanceId: string
}

class TintableScene extends PureComponent<Props, State> {
  static baseClass = 'prism-scene-manager__scene'

  static defaultProps = {
    width: 1200,
    height: 725,
    render: true,
    interactive: true
  }

  static getFilterId (sceneId: string | number, surfaceId: string | number, suffix?: string) {
    return `scene${sceneId}_surface${surfaceId}_tinter-filter${suffix ? `_${suffix}` : ''}`
  }

  static getMaskId (sceneId: string | number, surfaceId: string | number, suffix?: string) {
    return `scene${sceneId}_surface${surfaceId}_object-mask${suffix ? `_${suffix}` : ''}`
  }

  constructor (props: Props) {
    super(props)

    this.handleColorDrop = this.handleColorDrop.bind(this)
    this.handleClickSurface = this.handleClickSurface.bind(this)
    this.handleOver = this.handleOver.bind(this)
    this.handleOut = this.handleOut.bind(this)

    this.state = {
      activePreviewSurfaces: [],
      // must be unique among ALL TintableScene instances so as not to cross-contaminate filter definition IDs
      instanceId: _.uniqueId('TS')
    }
  }

  handleClickSurface = function handleClickSurface (surfaceId: string) {
    const { clickToPaintColor } = this.props

    if (clickToPaintColor) {
      this.updateSurfaceColor(surfaceId, clickToPaintColor)
    }
  }

  handleColorDrop = function handleColorDrop (surfaceId: string, color: string) {
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
      activePreviewSurfaces: _.uniq(_.concat(activePreviewSurfaces, surfaceId))
    })
  }

  handleOut = function handleOut (surfaceId: string) {
    const { activePreviewSurfaces } = this.state

    this.setState({
      activePreviewSurfaces: _.without(activePreviewSurfaces, surfaceId)
    })
  }

  updateSurfaceColor (surfaceId: string, color: string) {
    this.props.onUpdateColor && this.props.onUpdateColor(this.props.sceneId, surfaceId, color)
  }

  render () {
    const { surfaces, background, width, height, render, interactive, previewColor } = this.props
    const { activePreviewSurfaces, instanceId } = this.state

    if (!render) {
      return null
    }

    return (
      <div className={TintableScene.baseClass}>
        <div className={`${TintableScene.baseClass}__svg-defs`}>
          <svg x='0' y='0' width='0' height='0' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox={`0 0 ${width} ${height}`}>
            <defs>
              {surfaces.map((surface, index) => {
                let tintColor = void (0)

                if (activePreviewSurfaces.indexOf(surface.id) > -1) {
                  tintColor = previewColor
                } else if (surface && surface.color) {
                  tintColor = surface.color
                }

                if (tintColor) {
                  return (
                    <Fragment
                      key={surface.id}>
                      <TintableSceneSVGDefs
                        filterId={TintableScene.getFilterId(instanceId, surface.id)}
                        filterColor={tintColor}
                        maskId={TintableScene.getMaskId(instanceId, surface.id)}
                        maskImage={surface.mask}
                      />
                    </Fragment>
                  )
                }

                return null
              })}
            </defs>
          </svg>
        </div>

        <div className={`${TintableScene.baseClass}__tint-wrapper`}>
          <img className={`${TintableScene.baseClass}__natural`} src={background} />
          {surfaces.map((surface, index) => (
            <TintableSceneSurface key={surface.id}
              image={background}
              width={width}
              height={height}
              maskId={TintableScene.getMaskId(instanceId, surface.id)}
              filterId={TintableScene.getFilterId(instanceId, surface.id)}
            />
          ))}
        </div>

        {interactive && (
          <div className={`${TintableScene.baseClass}__hit-wrapper`}>
            {surfaces.map((surface, index) => (
              <TintableSceneHitArea key={surface.id}
                id={surface.id}
                onDrop={this.handleColorDrop}
                onOver={this.handleOver}
                onOut={this.handleOut}
                onClick={this.handleClickSurface}
                color={surface.color}
                svgSource={surface.hitArea} />
            ))}
          </div>
        )}
      </div>
    )
  }
}

export default TintableScene
