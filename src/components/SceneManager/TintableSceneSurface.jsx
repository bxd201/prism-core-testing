// @flow
import React, { PureComponent } from 'react'

type Props = {
  image: string,
  maskId: string,
  filterId: string,
  width: string | number,
  height: string | number
}

class TintableSceneSurface extends PureComponent<Props> {
  static baseClass = 'prism-scene-manager__scene__surface'

  render () {
    const { image, maskId, filterId, width, height } = this.props

    return (
      <svg className={TintableSceneSurface.baseClass}
        viewBox={`0 0 ${width} ${height}`}
        version='1.1'
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        preserveAspectRatio='none'>

        <image xlinkHref={image} width='100%' height='100%' mask={`url(#${maskId})`} filter={`url(#${filterId})`} />
      </svg>
    )
  }
}

export default TintableSceneSurface
