// @flow
import React from 'react'

export type DayNightIconProps = {
  isEnlarged: boolean,
  color: string,
  strokeWidth?: number
}
export default function SunIcon(props: DayNightIconProps) {
  const { isEnlarged, color, strokeWidth } = props
  const blownUp = { width: '22px', height: '22px' }
  const normal = { width: '19px', height: '19px' }
  return (
    <svg
      width='28'
      height='28'
      viewBox='0 0 28 28'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      style={isEnlarged ? blownUp : normal}
    >
      <path
        d='M14 20.5625C17.6244 20.5625 20.5625 17.6244 20.5625 14C20.5625 10.3756 17.6244 7.4375 14 7.4375C10.3756 7.4375 7.4375 10.3756 7.4375 14C7.4375 17.6244 10.3756 20.5625 14 20.5625Z'
        stroke={color}
        strokeWidth={`${strokeWidth ?? 2}`}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14 3.9375V1.75M6.88457 6.8847L5.33777 5.3379M3.9375 14H1.75M6.88457 21.1152L5.33777 22.662M14 24.0625V26.25M21.1154 21.1152L22.6622 22.662M24.0625 14H26.25M21.1154 6.8847L22.6622 5.3379'
        stroke={color}
        strokeWidth={`${strokeWidth ?? 2}`}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
