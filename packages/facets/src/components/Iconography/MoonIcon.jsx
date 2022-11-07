// @flow
import React from 'react'
import type { DayNightIconProps } from './SunIcon'

export default function MoonIcon(props: DayNightIconProps) {
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
        d='M22.2339 13.359C20.4989 13.757 18.6912 13.7078 16.9804 13.2159C15.2696 12.724 13.7118 11.8057 12.4531 10.5469C11.1944 9.28823 10.276 7.73042 9.78416 6.01964C9.29229 4.30886 9.24304 2.50117 9.64102 0.766145L9.64088 0.766113C7.81424 1.18748 6.13369 2.09013 4.77372 3.38035C3.41375 4.67056 2.42394 6.3013 1.90707 8.10324C1.39019 9.90519 1.36509 11.8126 1.83437 13.6276C2.30365 15.4425 3.25021 17.0987 4.57576 18.4243C5.90131 19.7498 7.55752 20.6964 9.37245 21.1657C11.1874 21.635 13.0948 21.6099 14.8968 21.093C16.6987 20.5761 18.3295 19.5863 19.6197 18.2263C20.9099 16.8664 21.8126 15.1858 22.2339 13.3592L22.2339 13.359Z'
        stroke={color}
        strokeWidth={`${strokeWidth ?? 2}`}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
