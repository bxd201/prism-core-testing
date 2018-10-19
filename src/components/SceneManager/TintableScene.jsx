// @flow
import React, { PureComponent } from 'react'

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
  clickToPaintColor?: string,
  onUpdateColor?: Function
}

class TintableScene extends PureComponent<Props> {
  static baseClass = 'prism-scene-manager__scene'

  static defaultProps = {
    width: 1200,
    height: 725,
    render: true,
    interactive: true
  }

  static getFilterId (sceneId: string | number, surfaceId: string | number) {
    return `scene${sceneId}__tinter-filter-${surfaceId}`
  }

  static getMaskId (sceneId: string | number, surfaceId: string | number) {
    return `scene${sceneId}__object-mask-${surfaceId}`
  }

  constructor (props: Props) {
    super(props)

    this.handleColorDrop = this.handleColorDrop.bind(this)
    this.handleClickSurface = this.handleClickSurface.bind(this)
  }

  handleClickSurface = function handleClickSurface (surfaceId: string) {
    const { clickToPaintColor } = this.props

    if (clickToPaintColor) {
      this.updateSurfaceColor(surfaceId, clickToPaintColor)
    }
  }

  handleColorDrop = function handleColorDrop (surfaceId: string, color: string) {
    this.updateSurfaceColor(surfaceId, color)
  }

  updateSurfaceColor (surfaceId: string, color: string) {
    this.props.onUpdateColor && this.props.onUpdateColor(this.props.sceneId, surfaceId, color)
  }

  render () {
    const { surfaces, sceneId, background, width, height, render, interactive } = this.props

    if (!render) {
      return null
    }

    return (
      <div className={TintableScene.baseClass}>
        <div className={`${TintableScene.baseClass}__svg-defs`}>
          <svg x='0' y='0' width='0' height='0' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox={`0 0 ${width} ${height}`}>
            <defs>
              {surfaces.map((surface, index) => {
                if (surface && surface.color) {
                  return (
                    <TintableSceneSVGDefs
                      key={surface.id}
                      filterId={TintableScene.getFilterId(sceneId, surface.id)}
                      filterColor={surface.color}
                      maskId={TintableScene.getMaskId(sceneId, surface.id)}
                      maskImage={surface.mask}
                    />
                  )
                }
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
              maskId={TintableScene.getMaskId(sceneId, surface.id)}
              filterId={TintableScene.getFilterId(sceneId, surface.id)}
            />
          ))}
        </div>

        {interactive && (
          <div className={`${TintableScene.baseClass}__hit-wrapper`}>
            {surfaces.map((surface, index) => (
              <TintableSceneHitArea key={surface.id}
                id={surface.id}
                onDrop={this.handleColorDrop}
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
