// @flow
import React from 'react'
import CSSVariableApplicator from '../../../helpers/CSSVariableApplicator'
import memoizee from 'memoizee'
import at from 'lodash/at'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'

import { getColors } from '../functions'
import { varNames } from 'variables'

import './CircleLoader.scss'

const R = 35
const PERIMETER = R * 2 * Math.PI
const STROKE_WIDTH = 5

const getCssVars = memoizee((color?: string): Object => {
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
    [varNames.loaders.circle.beginDash]: PERIMETER - (STROKE_WIDTH * 2),
    [varNames.loaders.circle.beginGap]: (STROKE_WIDTH * 2),
    [varNames.loaders.circle.endDash]: PERIMETER / 2,
    [varNames.loaders.circle.endGap]: PERIMETER / 2
  }
}, { primitive: true, length: 1 })

type Props = {
  circleProps?: Object,
  className?: string,
  color?: string
}

function CircleLoader (props: Props) {
  const { color, className, circleProps, ...other } = props
  const { theme } = React.useContext(ConfigurationContext)
  const finalColor = color || at(theme, 'primary')[0] || null

  return (
    <CSSVariableApplicator variables={getCssVars(finalColor)}>
      <svg className={`prism-loader-circle ${typeof className === 'string' ? className : ''}`} {...other} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid'>
        <circle className='prism-loader-circle__circle' cx='50' cy='50' {...circleProps} fill='none' strokeWidth={STROKE_WIDTH} r={R} strokeDasharray='164.93361431346415 56.97787143782138' transform='rotate(143.836 50 50)' />
      </svg>
    </CSSVariableApplicator>
  )
}

CircleLoader.defaultProps = {
  circleProps: {}
}

export default React.memo<Props>(CircleLoader)
