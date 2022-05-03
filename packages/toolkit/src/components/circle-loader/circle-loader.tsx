import React, { useRef, CSSProperties, useEffect } from 'react'
import SpinnerLoader from '../spinner-loader/spinner-loader'
import { dashAdjust, circleColor } from './animation';

const SIZE = 100
const DEFAULT_STROKE_WIDTH = 6

export interface CircleLoaderProps {
  brandId?: string
  className?: string
  inheritSize?: boolean
  strokeWidth?: number
  style?: CSSProperties
}

function CircleLoader (props: CircleLoaderProps): JSX.Element {
  const { brandId, className, inheritSize, strokeWidth, style, ...other } = props

  const circleRef = useRef(null)

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.animate(dashAdjust.keyframes, dashAdjust.properties)
      circleRef.current.animate(circleColor.keyframes, circleColor.properties)
    }
  }, [circleRef])

  const radius = SIZE / 2

  // TODO: remove brandId from here. Brand-specific customization should occur via config.
  // A loader component should not be concerned with what brand is using it.
  // Make CircleLoader configurable via prop to show either circle or spinner loader.
  if (brandId === 'lowes') {
    return <SpinnerLoader inheritSize={inheritSize} />
  }

  const svgStyle = {
    width: '1em',
    maxHeight: '90%',
    maxWidth: '90%',
    fontSize: inheritSize ? 'inherit' : '30px',
    ...style
  }

  return (
    <svg
      className={`overflow-visible animate-spin m-auto h-auto stroke-current} ${typeof className === 'string' ? className : ''}`}
      style={svgStyle}
      {...other}
      xmlns='http://www.w3.org/2000/svg'
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      preserveAspectRatio='xMidYMid'
      data-testid='circle-loader'
    >
      <circle
        ref={circleRef}
        style={{stroke: 'currentColor'}}
        cx={radius}
        cy={radius}
        fill='none'
        strokeWidth={strokeWidth}
        r={radius}
        strokeDasharray='164.93361431346415 56.97787143782138'
      />
    </svg>
  )
}

CircleLoader.defaultProps = {
  inheritSize: false,
  strokeWidth: DEFAULT_STROKE_WIDTH,
  style: {},
}

export default React.memo<CircleLoaderProps>(CircleLoader)
