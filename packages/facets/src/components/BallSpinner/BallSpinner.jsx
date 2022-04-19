// @flow
import React from 'react'

type BallSpinnerProps = {
  closeGap?: boolean
}
function BallSpinner (props: BallSpinnerProps) {
  const { closeGap } = props

  return <div className='w-11 h-11'>
    <svg className='animate-spin w-full h-full stroke-0'
      viewBox='0 0 100 100'
      y='0'
      x='0'
      xmlns='http://www.w3.org/2000/svg'
      width='50px'
      height='50px'>
      <g className='tw-origin-center tw-scale-50'>
        <circle fill='#edc433' r='9' cy='16' cx='50' />
        <circle fill='#dd6a00' r='9' cy='25.5' cx='26.2' />
        <circle fill='#a94038' r='9' cy='49' cx='16' />
        { closeGap ? <circle fill='#ffffff' r='9' cy='72.8' cx='25.5' /> : null }
        <circle fill='#c9bfb3' r='9' cy='83' cx='49' />
        <circle fill='#7c6587' r='9' cy='73.5' cx='72.8' />
        <circle fill='#4d90a5' r='9' cy='50' cx='83' />
        <circle fill='#82b87a' r='9' cy='26.2' cx='73.5' />
      </g>
    </svg>
  </div>
}

export default BallSpinner
