// @flow
import React from 'react'

import './CircleLoader.scss'

type Props = {
  color: string,
}

function CircleLoader (props: Props) {
  let { color } = props

  if (!color) {
    color = '#FFF'
  }

  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid' className='prism-loader-circle'>
      <circle cx='50' cy='50' fill='none' stroke={color} strokeWidth='5' r='35' strokeDasharray='164.93361431346415 56.97787143782138' transform='rotate(143.836 50 50)'>
        <animateTransform attributeName='transform' type='rotate' calcMode='linear' values='0 50 50;360 50 50' keyTimes='0;1' dur='1s' begin='0s' repeatCount='indefinite' />
      </circle>
    </svg>
  )
}

export default CircleLoader
