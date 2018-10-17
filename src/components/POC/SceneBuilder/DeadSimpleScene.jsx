// @flow
import React, { PureComponent, Fragment } from 'react'
// import { findDOMNode } from 'react-dom';
import _ from 'lodash'

import './DeadSimpleScene.scss'

type Props = {
  background: string,
  surfaces: Array<{
    id: string,
    mask: string,
    color: string,
    hitArea: string
  }>,
  width: number,
  height: number
}

type State = {
  id: string
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

    this.state = {
      id: _.uniqueId(DeadSimpleScene.baseClass)
    }
  }

  handleClick = function handleClick (e: any) {
    console.log('zong', e, e.target, e.currentTarget) // eslint-disable-line
  }

  componentDidMount () {
    window.addEventListener('click', this.handleClick)
  }

  componentWillUnmount () {
    window.removeEventListener('click', this.handleClick)
  }

  render () {
    const { id } = this.state
    const { background, width, height, surfaces } = this.props

    return (
      <div className={DeadSimpleScene.baseClass}>
        <div className={`${DeadSimpleScene.baseClass}__svg-defs`}>
          <svg x='0' y='0' width='0' height='0' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox={`0 0 ${width} ${height}`}>
            <defs>
              {surfaces.map((surface, index) => (
                <Fragment key={index}>
                  <filter id={`${id}__tinter-filter-${index}`} x='0' y='0' width='100%' height='100%' filterUnits='objectBoundingBox' primitiveUnits='objectBoundingBox' colorInterpolationFilters='sRGB'>
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
                  <mask id={`${id}__object-mask-${index}`} x='0' y='0' width='100%' height='100%' maskUnits='objectBoundingBox'>
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
            <Fragment key={index}>
              <svg className={`${DeadSimpleScene.baseClass}__surface`}
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio='none'>

                <image xlinkHref={background} width='100%' height='100%' mask={`url(#${id}__object-mask-${index})`} filter={`url(#${id}__tinter-filter-${index})`} />
              </svg>
            </Fragment>
          ))}
        </div>

        <div className={`${DeadSimpleScene.baseClass}__hit-wrapper`}>
          {surfaces.map((surface, index) => (
            <Fragment key={index}>
              <svg className={`${DeadSimpleScene.baseClass}__hit-area`} style={{ fill: surface.color }}>
                <use ref={(el) => (this.zong[index] = el)} xlinkHref={`${surface.hitArea}#svg1`} />
              </svg>
            </Fragment>
          ))}
        </div>
      </div>
    )
  }
}

export default DeadSimpleScene
