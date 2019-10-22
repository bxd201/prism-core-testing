// @flow
import React from 'react'

type ColorFromImageIndicatorProps = {
  currentPixelRGBstring: string,
  top: number,
  bottom: number,
  left: number,
  right: number
}

const ColorFromImageIndicator = (props: ColorFromImageIndicatorProps) => {
  return (
    <div className='scene__image__wrapper__indicator'
      style={{
        backgroundColor: props.currentPixelRGBstring,
        top: props.top,
        bottom: props.bottom,
        left: props.left,
        right: props.right
      }} />
  )
}

export default ColorFromImageIndicator
