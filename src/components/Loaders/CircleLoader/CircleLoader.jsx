// @flow
import React, { useMemo } from 'react'
import CSSVariableApplicator from '../../../helpers/CSSVariableApplicator'
import at from 'lodash/at'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'

import { getColors } from '../functions'
import { varNames } from 'src/shared/withBuild/variableDefs'

import SpinnerLoader from '../../Loaders/SpinnerLoader/SpinnerLoader'
import './CircleLoader.scss'

const SIZE = 100
const RADIUS = SIZE / 2
const PERIMETER = RADIUS * 2 * Math.PI
const DEFAULT_STROKE_WIDTH = 6

type Props = {
  circleProps?: Object,
  className?: string,
  color?: string,
  inheritSize?: boolean,
  strokeWidth?: number
}

function CircleLoader (props: Props) {
  const { color, className, circleProps, inheritSize = false, strokeWidth = DEFAULT_STROKE_WIDTH, ...other } = props
  const { brandId, theme } = React.useContext(ConfigurationContext)
  const finalColor = color || at(theme, 'primary')[0] || null
  const cssVars = useMemo(() => {
    let colors = getColors(color, 20)

    // if a color has been provided...
    if (color) {
      // ... let's create some more obvious stepping so the transitions are more apparent
      colors = [
        colors[0],
        colors[4],
        colors[0],
        colors[2],
        colors[4]
      ]
    }

    return {
      [varNames.loaders.circle.color1]: colors[0],
      [varNames.loaders.circle.color2]: colors[1],
      [varNames.loaders.circle.color3]: colors[2],
      [varNames.loaders.circle.color4]: colors[3],
      [varNames.loaders.circle.color5]: colors[4],
      [varNames.loaders.circle.beginDash]: PERIMETER - (strokeWidth * 2),
      [varNames.loaders.circle.beginGap]: (strokeWidth * 2),
      [varNames.loaders.circle.endDash]: PERIMETER / 2,
      [varNames.loaders.circle.endGap]: PERIMETER / 2
    }
  }, [ finalColor, strokeWidth ])

  return (
    <CSSVariableApplicator variables={cssVars}>
      {brandId === 'lowes'
        ? <SpinnerLoader inheritSize={inheritSize} />
        : <svg className={`prism-loader-circle ${inheritSize ? 'prism-loader-circle--inherit' : ''} ${typeof className === 'string' ? className : ''}`} {...other} xmlns='http://www.w3.org/2000/svg' viewBox={`0 0 ${SIZE} ${SIZE}`} preserveAspectRatio='xMidYMid'>
          <circle className='prism-loader-circle__circle' cx={RADIUS} cy={RADIUS} {...circleProps} fill='none' strokeWidth={strokeWidth} r={RADIUS} strokeDasharray='164.93361431346415 56.97787143782138' transform={`rotate(143.836 ${RADIUS} ${RADIUS})`} />
        </svg>}

    </CSSVariableApplicator>
  )
}

CircleLoader.defaultProps = {
  circleProps: {}
}

export default React.memo<Props>(CircleLoader)
