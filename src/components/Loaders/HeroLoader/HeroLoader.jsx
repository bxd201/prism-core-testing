// @flow
import React from 'react'
import CSSVariableApplicator from '../../../helpers/CSSVariableApplicator'
import memoizee from 'memoizee'
import at from 'lodash/at'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'

import { getColors } from '../functions'
import { varNames } from 'src/shared/variableDefs'

import './HeroLoader.scss'

const getCssVars = memoizee((color?: string): Object => {
  const colors = getColors(color)

  return {
    [varNames.loaders.hero.color1]: colors[0],
    [varNames.loaders.hero.color2]: colors[1],
    [varNames.loaders.hero.color3]: colors[2],
    [varNames.loaders.hero.color4]: colors[3],
    [varNames.loaders.hero.color5]: colors[4]
  }
}, { primitive: true, length: 1 })

type Props = {
  color?: string,
  className?: string,
  size?: 'sm' | 'lg'
}

function HeroLoader (props: Props) {
  const { color, className, size, ...other } = props
  const { theme } = React.useContext(ConfigurationContext)
  const finalColor = color || at(theme, 'primary')[0] || null

  return (
    <CSSVariableApplicator variables={getCssVars(finalColor)}>
      <div className={`hero-loader ${size ? `hero-loader--${size}` : ''} ${className || ''}`} {...other}>
        <div className='hero-loader__wrapper'>
          <div className='hero-loader__bar-spinner'>
            <div className='hero-loader__bar hero-loader__bar--1' />
            <div className='hero-loader__bar hero-loader__bar--2' />
            <div className='hero-loader__bar hero-loader__bar--3' />
            <div className='hero-loader__bar hero-loader__bar--4' />
            <div className='hero-loader__bar hero-loader__bar--5' />
          </div>
        </div>
      </div>
    </CSSVariableApplicator>
  )
}

export default React.memo<Props>(HeroLoader)
