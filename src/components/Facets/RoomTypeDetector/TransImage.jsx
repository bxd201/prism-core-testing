// @flow
import React from 'react'

import './TransImage.scss'

type Props = {
  className?: string,
  src: string,
  alt: string
}

const TransImage = ({ src, alt, className = '' }: Props) => {
  return (
    <div className={`TransImage ${className}`}>
      <img className='TransImage__fill' src={src} alt={alt} />
    </div>
  )
}

export default TransImage
