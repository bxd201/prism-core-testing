import React, { useEffect, useRef } from 'react'
import animation from './animation'

export interface SpinnerLoaderProps {
  inheritSize?: boolean
}

export const TEST_ID = 'spinner-loader'

const SpinnerLoader = ({ inheritSize = false }: SpinnerLoaderProps): JSX.Element => {
  const svgRef = useRef(null)

  useEffect(() => {
    if (svgRef.current) svgRef.current.animate?.(animation.keyframes, animation.properties)
  }, [svgRef])

  return (
    <svg
      ref={svgRef}
      className={`m-auto animate-staggeredSpin`}
      style={{ width: '1em', height: '1em', fontSize: inheritSize ? 'inherit' : '40px' }}
      version='1.1'
      baseProfile='tiny'
      id='Layer_1'
      xmlns='http://www.w3.org/2000/svg'
      x='0px'
      y='0px'
      viewBox='0 0 40 40'
      data-testid={TEST_ID}
    >
      <g stroke='none'>
        <path
          style={{ fill: '#E7E7E7' }}
          d='M20,4L20,4c0.9,0,1.6,0.9,1.6,2v4c0,1.1-0.7,2-1.6,2l0,0c-0.9,0-1.6-0.9-1.6-2V6  C18.4,4.9,19.1,4,20,4z'
        />
        <path
          style={{ fill: '#D2D2D2' }}
          d='M28,6.1L28,6.1c0.8,0.4,0.9,1.6,0.4,2.5l-2,3.5c-0.6,1-1.6,1.4-2.4,0.9l0,0c-0.8-0.4-0.9-1.6-0.4-2.5  l2-3.5C26.2,6.1,27.2,5.7,28,6.1z'
        />
        <path
          style={{ fill: '#BDBDBD' }}
          d='M33.9,12L33.9,12c0.4,0.8,0,1.8-0.9,2.4l-3.5,2c-1,0.6-2.1,0.4-2.5-0.4l0,0c-0.4-0.8,0-1.8,0.9-2.4 l3.5-2C32.3,11.1,33.4,11.2,33.9,12z'
        />
        <path
          style={{ fill: '#A8A8A8' }}
          d='M36,20L36,20c0,0.9-0.9,1.6-2,1.6h-4c-1.1,0-2-0.7-2-1.6l0,0c0-0.9,0.9-1.6,2-1.6h4 C35.1,18.4,36,19.1,36,20z'
        />
        <path
          style={{ fill: '#919191' }}
          d='M33.9,28L33.9,28c-0.4,0.8-1.6,0.9-2.5,0.4l-3.5-2c-1-0.6-1.4-1.6-0.9-2.4l0,0 c0.4-0.8,1.6-0.9,2.5-0.4l3.5,2C33.9,26.2,34.3,27.2,33.9,28z'
        />
        <path
          style={{ fill: '#7D7D7D' }}
          d='M28,33.9L28,33.9c-0.8,0.4-1.8,0-2.4-0.9l-2-3.5c-0.6-1-0.4-2.1,0.4-2.5l0,0c0.8-0.4,1.8,0,2.4,0.9 l2,3.5C28.9,32.3,28.8,33.4,28,33.9z'
        />
        <path
          style={{ fill: '#7D7D7D' }}
          d='M20,36L20,36c-0.9,0-1.6-0.9-1.6-2v-4c0-1.1,0.7-2,1.6-2l0,0c0.9,0,1.6,0.9,1.6,2v4 C21.6,35.1,20.9,36,20,36z'
        />
        <path
          style={{ fill: '#656565' }}
          d='M12,33.9L12,33.9c-0.8-0.4-0.9-1.6-0.4-2.5l2-3.5c0.6-1,1.6-1.4,2.4-0.9l0,0c0.8,0.4,0.9,1.6,0.4,2.5 l-2,3.5C13.8,33.9,12.8,34.3,12,33.9z'
        />
        <path
          style={{ fill: '#3D3D3D' }}
          d='M6.1,28L6.1,28c-0.4-0.8,0-1.8,0.9-2.4l3.5-2c1-0.6,2.1-0.4,2.5,0.4l0,0c0.4,0.8,0,1.8-0.9,2.4 l-3.5,2C7.7,28.9,6.6,28.8,6.1,28z'
        />
        <path
          style={{ fill: '#282828' }}
          d='M4,20L4,20c0-0.9,0.9-1.6,2-1.6h4c1.1,0,2,0.7,2,1.6l0,0c0,0.9-0.9,1.6-2,1.6H6C4.9,21.6,4,20.9,4,20 z'
        />
        <path
          style={{ fill: '#0B0B0B' }}
          d='M6.1,12L6.1,12c0.4-0.8,1.6-0.9,2.5-0.4l3.5,2c1,0.6,1.4,1.6,0.9,2.4l0,0c-0.4,0.8-1.6,0.9-2.5,0.4 l-3.5-2C6.1,13.8,5.7,12.8,6.1,12z'
        />
        <path
          style={{ fill: '#FFFFFF' }}
          d='M12,6.1L12,6.1c0.8-0.4,1.8,0,2.4,0.9l2,3.5c0.6,1,0.4,2.1-0.4,2.5l0,0c-0.8,0.4-1.8,0-2.4-0.9 l-2-3.5C11.1,7.7,11.2,6.6,12,6.1z'
        />
      </g>
    </svg>
  )
}

export default SpinnerLoader
