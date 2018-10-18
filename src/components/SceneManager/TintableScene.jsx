// @flow
import React, { PureComponent } from 'react'
import _ from 'lodash'

import TintableSceneHitArea from './TintableSceneHitArea'
import TintableSceneSurface from './TintableSceneSurface'
import TintableSceneSVGDefs from './TintableSceneSVGDefs'

type Props = {
  background: string,
  initSurfaces: Array<{
    id: string,
    mask: string,
    color?: string,
    hitArea: string
  }>,
  width: number,
  height: number,
  clickToPaintColor?: string
}

type State = {
  sceneId: string,
  surfaces: Array<{
    surfaceId: string,
    mask: string,
    color?: string,
    hitArea: string
  }>
}

class TintableScene extends PureComponent<Props, State> {
  static baseClass = 'prism-scene-manager__scene'

  static defaultProps = {
    width: 1200,
    height: 725
  }

  static getFilterId (sceneId: string, surfaceId: string) {
    return `${sceneId}__tinter-filter-${surfaceId}`
  }

  static getMaskId (sceneId: string, surfaceId: string) {
    return `${sceneId}__object-mask-${surfaceId}`
  }

  constructor (props: Props) {
    super(props)

    const { initSurfaces } = this.props

    // hydrate state.surfaces w/ initSurfaces data
    this.state = {
      sceneId: _.uniqueId('scene'),
      surfaces: _.clone(initSurfaces).map(surface => {
        return {
          surfaceId: _.uniqueId('surface'),
          ...surface
        }
      })
    }

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
    const { surfaces } = this.state
    const index = _.findIndex(surfaces, surface => {
      return surface.surfaceId === surfaceId
    })
    const newSurfaces = _.clone(surfaces)

    // replace item in collection with new, updated instance of obj to avoid mutation complications
    newSurfaces[ index ] = Object.assign({}, newSurfaces[ index ], { color: color })

    if (index > -1) {
      this.setState({
        surfaces: newSurfaces
      })
    }
  }

  render () {
    const { sceneId, surfaces } = this.state
    const { background, width, height } = this.props

    return (
      <div className={TintableScene.baseClass}>
        <div className={`${TintableScene.baseClass}__svg-defs`}>
          <svg x='0' y='0' width='0' height='0' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox={`0 0 ${width} ${height}`}>
            <defs>
              {surfaces.map((surface, index) => {
                if (surface && surface.color) {
                  return (
                    <TintableSceneSVGDefs
                      key={surface.surfaceId}
                      filterId={TintableScene.getFilterId(sceneId, surface.surfaceId)}
                      filterColor={surface.color}
                      maskId={TintableScene.getMaskId(sceneId, surface.surfaceId)}
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
            <TintableSceneSurface key={surface.surfaceId}
              image={background}
              width={width}
              height={height}
              maskId={TintableScene.getMaskId(sceneId, surface.surfaceId)}
              filterId={TintableScene.getFilterId(sceneId, surface.surfaceId)}
            />
          ))}
        </div>

        <div className={`${TintableScene.baseClass}__hit-wrapper`}>
          {surfaces.map((surface, index) => (
            <TintableSceneHitArea key={surface.surfaceId}
              id={surface.surfaceId}
              onDrop={this.handleColorDrop}
              onClick={this.handleClickSurface}
              color={surface.color}
              svgSource={surface.hitArea} />
          ))}
        </div>
      </div>
    )
  }
}

export default TintableScene
