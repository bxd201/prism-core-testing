// @flow
import React, { PureComponent } from 'react'

import { SCENE_TYPES } from 'constants/globals'

type Props = {
  image: string,
  maskId: string,
  filterId: string,
  width: string | number,
  height: string | number,
  type: string
}

class TintableSceneSurface extends PureComponent<Props> {
  static baseClass = 'prism-scene-manager__scene__surface'

  getSvgContents () {
    const { image, maskId, filterId, type } = this.props

    switch (type) {
      case SCENE_TYPES.ROOM:
        return <image xlinkHref={image} width='100%' height='100%' mask={`url(#${maskId})`} filter={`url(#${filterId})`} />
      case SCENE_TYPES.OBJECT:
      case SCENE_TYPES.AUTOMOTIVE:
        return <rect className='rect' x='0' y='0' width='100%' height='100%' mask={`url(#${maskId})`} filter={`url(#${filterId})`} />
    }
  }

  render () {
    const { width, height } = this.props

    return (
      <svg className={TintableSceneSurface.baseClass}
        viewBox={`0 0 ${width} ${height}`}
        version='1.1'
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        preserveAspectRatio='none'>
        {this.getSvgContents()}
      </svg>
    )
  }
}

export default TintableSceneSurface
