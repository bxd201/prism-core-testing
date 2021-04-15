// @flow
import React, { PureComponent } from 'react'

import { SCENE_TYPES } from 'constants/globals'
import getBeforeHash from 'src/shared/utils/getBeforeHash.util'

type Props = {
  image: string,
  maskId: string,
  filterId: string,
  width?: string | number,
  height?: string | number,
  type: string,
  children: any,
  // This prop will hardcode the width and height, use this when you need to programtically resize.
  scaleSvg?: booelan
}

class TintableSceneSurface extends PureComponent<Props> {
  static baseClass = 'prism-scene-manager__scene__surface'

  getSvgContents () {
    const { image, maskId, filterId, type } = this.props
    const baseUrl = getBeforeHash(window.location.href)
    const mask = `url("${baseUrl}#${maskId}")`
    const filter = `url("${baseUrl}#${filterId}")`

    switch (type) {
      case SCENE_TYPES.ROOM:
        return <image xlinkHref={image} width='100%' height='100%' mask={mask} filter={filter} />
      case SCENE_TYPES.OBJECT:
      case SCENE_TYPES.AUTOMOTIVE:
        return <rect className='rect' x='0' y='0' width='100%' height='100%' mask={mask} filter={filter} />
    }
  }

  render () {
    const { width, height, scaleSvg } = this.props

    return (
      <svg style={scaleSvg ? { width, height } : null} className={TintableSceneSurface.baseClass}
        viewBox={`0 0 ${width} ${height}`}
        version='1.1'
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        preserveAspectRatio='none'>
        {this.props.children}
        {this.getSvgContents()}
      </svg>
    )
  }
}

export default TintableSceneSurface
