// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'

import type { Color, ColorMap } from '../../../../shared/types/Colors.js.flow'

import SimilarColorSwatch from './SimilarColorSwatch'

import 'src/scss/convenience/visually-hidden.scss'

type Props = {
  colors: ColorMap,
  color: Color
}

function SimilarColors ({ colors, color }: Props) {
  const similarColors = color.similarColors

  return (
    <React.Fragment>
      <h5 className='visually-hidden'><FormattedMessage id='SIMILAR_COLORS' /></h5>
      <ul className={`color-info__similar-colors`}>
        {similarColors.map((colorId: string) => {
          const color = colors[colorId]
          if (color) {
            return <SimilarColorSwatch key={colorId} color={color} />
          }
        }).filter(color => !!color)}
      </ul>
    </React.Fragment>
  )
}

export default SimilarColors
