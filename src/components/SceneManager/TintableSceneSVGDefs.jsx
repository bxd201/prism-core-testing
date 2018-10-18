// @flow
import React, { PureComponent, Fragment } from 'react'

type Props = {
  maskImage: string,
  maskId: string,
  filterId: string,
  filterColor?: string
}

class TintableSceneSurface extends PureComponent<Props> {
  render () {
    const { filterId, maskId, maskImage, filterColor } = this.props

    return (
      <Fragment>
        <filter id={filterId} x='0' y='0' width='100%' height='100%' filterUnits='objectBoundingBox' primitiveUnits='objectBoundingBox' colorInterpolationFilters='sRGB'>
          <feColorMatrix
            in='SourceGraphic'
            result='sourceImageInGrayscale'
            type='matrix'
            values='0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0 1 0 1 0' />
          <feFlood floodColor={filterColor} result='tintHue' />
          <feBlend mode='multiply' in2='tintHue' in='sourceImageInGrayscale' />
        </filter>
        <mask id={maskId} x='0' y='0' width='100%' height='100%' maskUnits='objectBoundingBox'>
          <image x='0' y='0' width='100%' height='100%' xlinkHref={maskImage} />
        </mask>
      </Fragment>
    )
  }
}

export default TintableSceneSurface
