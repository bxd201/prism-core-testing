// @flow
import React, { useMemo } from 'react'
import { CircleLoader, SpinnerLoader } from '../../ToolkitLoaders'
import CSSVariableApplicator from '../../../helpers/CSSVariableApplicator'
import at from 'lodash/at'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'

import { getColors } from '../functions'
import { varNames } from 'src/shared/withBuild/variableDefs'

import './HeroLoader.scss'

type Props = {
  color?: string,
  className?: string,
  size?: 'sm' | 'lg'
}

function HeroLoader (props: Props) {
  const { color, className, size, ...other } = props
  const { brandId, theme } = React.useContext(ConfigurationContext)
  const finalColor = color || at(theme, 'primary')[0] || null

  const cssVars = useMemo(() => {
    const colors = getColors(finalColor)

    return {
      [varNames.loaders.hero.color1]: colors[0],
      [varNames.loaders.hero.color2]: colors[1],
      [varNames.loaders.hero.color3]: colors[2],
      [varNames.loaders.hero.color4]: colors[3],
      [varNames.loaders.hero.color5]: colors[4]
    }
  }, [ finalColor ])

  return (
    <CSSVariableApplicator variables={cssVars}>
      <div className={`hero-loader ${size ? `hero-loader--${size}` : ''} ${className || ''}`} {...other}>
        {brandId === 'lowes'
          ? <SpinnerLoader />
          : <>
            <CircleLoader wrapperClassname='hero-loader__circle-loader' inheritSize />
            <div className='hero-loader__wrapper'>
              <div className='hero-loader__bar-spinner'>
                <div className='hero-loader__bar hero-loader__bar--1' />
                <div className='hero-loader__bar hero-loader__bar--2' />
                <div className='hero-loader__bar hero-loader__bar--3' />
                <div className='hero-loader__bar hero-loader__bar--4' />
                <div className='hero-loader__bar hero-loader__bar--5' />
              </div>
            </div>
          </>}
      </div>
    </CSSVariableApplicator>
  )
}

export default React.memo<Props>(HeroLoader)
