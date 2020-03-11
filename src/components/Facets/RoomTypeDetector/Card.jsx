// @flow
import React, { useMemo } from 'react'
import { mostReadable } from '@ctrl/tinycolor'
import TransImage from './TransImage'

import './Card.scss'

type Props = {
  image?: string,
  imageAlt?: string,
  imageBg?: string,
  title: string,
  titleBg?: string,
  children?: any,
  omitShim?: boolean
}

const Card = (props: Props) => {
  const {
    image,
    imageAlt,
    imageBg,
    title,
    titleBg = '#222',
    children,
    omitShim
  } = props

  const titleColor = useMemo(() => {
    if (titleBg) {
      return mostReadable(titleBg, [ 'white', 'black' ])
    }

    return 'white'
  }, [ titleBg ])

  return (
    <div className='Card'>
      <h3 className='Card__title' style={{ background: titleBg, color: titleColor }}>{title}</h3>
      {image ? (
        <TransImage src={image} alt={imageAlt || title} color={imageBg} />
      ) : null}
      {children
        ? omitShim ? children : (
          <div className='Card__body'>
            {children}
          </div>
        ) : null
      }
    </div>
  )
}

export default Card
