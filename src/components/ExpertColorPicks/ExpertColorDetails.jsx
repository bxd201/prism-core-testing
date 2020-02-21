// @flow
/**
 * expert color details component
 * loads when you click on the expert color swatch
 */
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fullColorNumber, getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'
import type { Color } from '../../shared/types/Colors.js.flow'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { add } from '../../store/actions/live-palette'
import some from 'lodash/some'
import './ExpertColorDetails.scss'
import { FormattedMessage } from 'react-intl'

type Props = { expertColors: Color[] }
const baseClass = 'prism-expert-color-details'

export default function ExpertColorDetails ({ expertColors }: Props) {
  const dispatch = useDispatch()
  const colorsCurrentlyInLivePalette = useSelector(state => state.lp.colors)

  const renderColorWall = (color, key) => {
    return (
      <div
        className={`${baseClass}__content__wrapper`}
        key={key}
        style={{ backgroundColor: color.hex, color: getContrastYIQ(color.hex) }}
      >
        <div className={`${baseClass}__content__wrapper__color-number`}>
          {fullColorNumber(color.brandKey, color.colorNumber)}
        </div>
        <div className={`${baseClass}__content__wrapper__color-name`}>
          {color.name}
        </div>
        <button aria-label={`Add ${color.name} to palette`} className={`${baseClass}__content__wrapper__toggle-check-icons`} tabIndex={some(colorsCurrentlyInLivePalette, color) ? -1 : 0} onClick={() => dispatch(add(color))} onMouseDown={(e) => e.preventDefault()}>
          <FontAwesomeIcon
            style={{ color: getContrastYIQ(color.hex) }}
            icon={some(colorsCurrentlyInLivePalette, color) ? ['fa', 'check-circle'] : ['fal', 'plus-circle']}
          />
        </button>
      </div>)
  }

  return (
    <div className={`${baseClass}`}>
      <div className={`${baseClass}__header`}>
        <div className={`${baseClass}__header__title`}>
          <FormattedMessage id='SELECTED_FROM' /> {expertColors.name}
        </div>
      </div>
      <div className={`${baseClass}__top__section`}>
        { renderColorWall(expertColors.colorDefs[0]) }
      </div>
      <div className={`${baseClass}__bottom__section`}>
        { expertColors.colorDefs.slice(1).map((color, key) => renderColorWall(color, key)) }
      </div>
    </div>
  )
}
