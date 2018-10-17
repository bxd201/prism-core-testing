// @flow
import React, { PureComponent, Fragment } from 'react'
import _ from 'lodash'

import DeadSimpleSceneSurfaceHitArea from './DeadSimpleSceneSurfaceHitArea'

import './DeadSimpleScene.scss'

type Props = {
  background: string,
  initSurfaces: Array<{
    id: string,
    mask: string,
    color: string,
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
    color: string,
    hitArea: string
  }>
}

class DeadSimpleScene extends PureComponent<Props, State> {
  static baseClass = 'SimpleScene'
  zong: Array<any> = []

  static defaultProps = {
    width: 1200,
    height: 725
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
      <div className={DeadSimpleScene.baseClass}>
        <div className={`${DeadSimpleScene.baseClass}__svg-defs`}>
          <svg x='0' y='0' width='0' height='0' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox={`0 0 ${width} ${height}`}>
            <defs>
              {surfaces.map((surface, index) => (
                <Fragment key={surface.surfaceId}>
                  <filter id={`${sceneId}__tinter-filter-${surface.surfaceId}`} x='0' y='0' width='100%' height='100%' filterUnits='objectBoundingBox' primitiveUnits='objectBoundingBox' colorInterpolationFilters='sRGB'>
                    <feColorMatrix
                      in='SourceGraphic'
                      result='sourceImageInGrayscale'
                      type='matrix'
                      values='0.33 0.33 0.33 0 0
                              0.33 0.33 0.33 0 0
                              0.33 0.33 0.33 0 0
                              0 1 0 1 0' />
                    <feFlood floodColor={surface.color} result='tintHue' />
                    <feBlend mode='multiply' in2='tintHue' in='sourceImageInGrayscale' />
                  </filter>
                  <mask id={`${sceneId}__object-mask-${surface.surfaceId}`} x='0' y='0' width='100%' height='100%' maskUnits='objectBoundingBox'>
                    <image x='0' y='0' width='100%' height='100%' xlinkHref={surface.mask} />
                  </mask>
                </Fragment>
              ))}
            </defs>
          </svg>
        </div>

        <div className={`${DeadSimpleScene.baseClass}__tint-wrapper`}>
          <img className={`${DeadSimpleScene.baseClass}__natural`} src={background} />
          {surfaces.map((surface, index) => (
            <Fragment key={surface.surfaceId}>
              <svg className={`${DeadSimpleScene.baseClass}__surface`}
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio='none'>

                <image xlinkHref={background} width='100%' height='100%' mask={`url(#${sceneId}__object-mask-${surface.surfaceId})`} filter={`url(#${sceneId}__tinter-filter-${surface.surfaceId})`} />
              </svg>
            </Fragment>
          ))}
        </div>

        <div className={`${DeadSimpleScene.baseClass}__hit-wrapper`}>
          {surfaces.map((surface, index) => (
            <DeadSimpleSceneSurfaceHitArea key={surface.surfaceId}
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

export default DeadSimpleScene
