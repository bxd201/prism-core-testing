// @flow
import React, { PureComponent, Fragment } from 'react'

import { SCENE_TYPES } from 'constants/globals'

type Props = {
  maskImage: string,
  maskId: string,
  filterId: string,
  type: string,
  filterColor?: string,
  highlightMap?: string,
  shadowMap?: string,
  filterImageValueCurve?: string
}

class TintableSceneSurface extends PureComponent<Props> {
  render () {
    const { filterId, maskId, maskImage, filterColor, type, highlightMap, shadowMap, filterImageValueCurve } = this.props
    let content = void (0)

    switch (type) {
      case SCENE_TYPES.ROOM: {
        content = (
          <Fragment>
            <filter id={filterId} x='0' y='0' width='100%' height='100%' filterUnits='objectBoundingBox' primitiveUnits='objectBoundingBox' colorInterpolationFilters='sRGB'>
              <feComponentTransfer in='SourceGraphic' result='adjustedHistogram'>
                {filterImageValueCurve ? <>
                  <feFuncR type='table' tableValues={filterImageValueCurve} />
                  <feFuncG type='table' tableValues={filterImageValueCurve} />
                  <feFuncB type='table' tableValues={filterImageValueCurve} />
                </> : null}
              </feComponentTransfer>

              <feFlood floodColor={filterColor} result='tintHue' />
              <feBlend mode='multiply' in2='tintHue' in='adjustedHistogram' />
            </filter>
            <mask id={maskId} x='0' y='0' width='100%' height='100%' maskUnits='objectBoundingBox'>
              <image x='0' y='0' width='100%' height='100%' xlinkHref={maskImage} />
            </mask>
          </Fragment>
        )
        break
      }
      case SCENE_TYPES.AUTOMOTIVE:
      case SCENE_TYPES.OBJECT: {
        content = (
          <Fragment>
            <filter id={filterId} x='0' y='0' width='100%' height='100%' filterUnits='objectBoundingBox' primitiveUnits='objectBoundingBox' colorInterpolationFilters='sRGB'>
              <feFlood floodColor={filterColor} result='tintHue' />
              {highlightMap ? (
                <feImage xlinkHref={highlightMap} x='0' y='0' width='100%' height='100%' result='highlight-map' />
              ) : null}
              {shadowMap ? (
                <feImage xlinkHref={shadowMap} x='0' y='0' width='100%' height='100%' result='shadow-map' />
              ) : null}
              <feBlend mode='screen' in2='highlight-map' in='tintHue' result='tint-highlight-blend' />
              <feBlend mode='multiply' in='shadow-map' in2='tint-highlight-blend' result='finished-tint' />
              <feBlend mode='luminosity' in='finished-tint' in2='tintHue' result='finished-filter' />
            </filter>
            <mask id={maskId} x='0' y='0' width='100%' height='100%' maskUnits='objectBoundingBox'>
              <image x='0' y='0' width='100%' height='100%' xlinkHref={maskImage} />
            </mask>
          </Fragment>
        )
        break
      }
    }

    return (
      <defs>
        {content}
      </defs>
    )
  }
}

export default TintableSceneSurface
