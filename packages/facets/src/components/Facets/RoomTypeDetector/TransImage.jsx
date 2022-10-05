// @flow
import React, { useMemo } from 'react'
import './TransImage.scss'

type Props = {
  className?: string,
  color?: string,
  src: string,
  alt: string
}

const TransImage = ({ src, alt, className = '', color }: Props) => {
  const style = useMemo(() => {
    if (color) {
      return {
        background: color
      }
    }

    return null
  })
  return (
    <div className={`TransImage ${className}`} style={style}>
      <img className='TransImage__fill' src={src} alt={alt} />
    </div>
  )
}

export default TransImage
