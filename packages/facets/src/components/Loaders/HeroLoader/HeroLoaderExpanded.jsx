// @flow
import React from 'react'
// import ColorWallProp from 'src/components/Facets/ColorWall/ColorWallProp/ColorWallProp'
import HeroLoader from './HeroLoader'
import './HeroLoaderExpanded.scss'

export default function HeroLoaderExpanded (props: Props) {
  const { className = '', ...other } = props

  return (
    <div className='HeroLoaderExpanded'>
      {/* <ColorWallProp /> */}
      <HeroLoader className={`${className} hero-loader--centered`} {...other} />
    </div>
  )
}
