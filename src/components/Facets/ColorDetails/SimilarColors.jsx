// @flow
import React from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import type { Color, ColorMap } from 'src/shared/types/Colors.js.flow'
import * as GA from 'src/analytics/GoogleAnalytics'
import 'src/scss/convenience/visually-hidden.scss'

type Props = { color: Color, onColorChanged: Color => void }
const SimilarColors = ({ color, onColorChanged }: Props) => {
  const colorMap: ColorMap = useSelector(store => store.colors.items.colorMap)

  return (
    <>
      <h5 className='visually-hidden'><FormattedMessage id='SIMILAR_COLORS' /></h5>
      <ul className='color-info__similar-colors'>
        {color.similarColors.map(colorId => colorMap[colorId]).map((color: Color) => {
          return (color &&
            <li key={color.colorNumber} className='color-info__similar-color'>
              <button
                className='color-info__similar-color-info'
                style={{ backgroundColor: color.hex }}
                onClick={() => {
                  onColorChanged(color)
                  GA.event({ category: 'Color Detail / Similar Color', action: 'View Similar Color', label: color.name })
                }}
                aria-label={`${color.brandKey} ${color.colorNumber} ${color.name}`}
              />
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default SimilarColors
