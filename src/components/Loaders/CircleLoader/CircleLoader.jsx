// @flow
import React from 'react'

import './CircleLoader.scss'

type Props = {
  color?: string,
  className?: string
}

function CircleLoader (props: Props) {
  const { color, className, ...other } = props

  let circleProps = {}

  if (color) {
    circleProps = Object.assign({}, { stroke: color })
  }

  return (
    <svg className={`prism-loader-circle ${typeof className === 'string' ? className : ''}`} {...other} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid'>
      <circle cx='50' cy='50' {...circleProps} fill='none' strokeWidth='5' r='35' strokeDasharray='164.93361431346415 56.97787143782138' transform='rotate(143.836 50 50)'>
        <animateTransform attributeName='transform' type='rotate' calcMode='linear' values='0 50 50;360 50 50' keyTimes='0;1' dur='1s' begin='0s' repeatCount='indefinite' />
      </circle>
    </svg>
  )
}

export default React.memo<Props>(CircleLoader)
