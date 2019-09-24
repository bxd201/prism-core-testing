// @flow
/**
 * expert color details component
 * loads when you click on the expert color swatch
 */

import React from 'react'
import {
  fullColorNumber,
  getContrastYIQ
} from '../../../src/shared/helpers/ColorUtils'
import type { Color } from '../../shared/types/Colors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { connect } from 'react-redux'
import { add } from '../../store/actions/live-palette'
import some from 'lodash/some'
import './ExpertColorDetails.scss'

type Props = {
    expertColors: Color[],
    addColors: Color
}
const baseClass = 'prism-expert-color-details'
const icons = 'toggle-check-icons'

export function ExpertColorDetails (props: Props) {
  const { expertColors, addColors } = props
  const topSectionColor = expertColors.colorDefs[0]
  const bottomCollor = expertColors.colorDefs.slice(1)
  const renderColorWall = (color, props, key) => {
    const isColorAdded = some(addColors, color)
    return (
      <div
        className={`${baseClass}__content__wrapper`}
        key={key}
        style={{
          backgroundColor: color.hex,
          color: getContrastYIQ(color.hex)
        }}
      >
        <div className={`${baseClass}__content__wrapper__color-number`}>
          {fullColorNumber(color.brandKey, color.colorNumber)}
        </div>
        <div className={`${baseClass}__content__wrapper__color-name`}>
          {color.name}
        </div>
        {
          isColorAdded &&
          <button onClick={() => handleClick(color, props)}>
            <FontAwesomeIcon
              style={{ color: getContrastYIQ(color.hex) }}
              className={`${baseClass}__content__wrapper__${icons}`}
              icon={faCheckCircle}
            />
          </button>
        }
        {
          !isColorAdded &&
            <button onClick={() => handleClick(color, props)}>
              <FontAwesomeIcon
                style={{ color: getContrastYIQ(color.hex) }}
                className={`${baseClass}__content__wrapper__${icons}`}
                icon={faPlusCircle}
              />
            </button>
        }
      </div>)
  }
  return (
    <div className={`${baseClass}`}>
      <div className={`${baseClass}__header`}>
        <div className={`${baseClass}__header__title`}>
          Seleted from {expertColors.name}
        </div>
        {/*
            <button className={`${baseClass}__header__link`}>
                TODO:noah.hall
                requires each collection summary to have a URI
              VIEW FULL COLLECTION
            </button>
        */}
      </div>
      <div className={`${baseClass}__top__section`}>
        {
          renderColorWall(topSectionColor, props)
        }
      </div>
      <div className={`${baseClass}__bottom__section`}>
        {
          bottomCollor.map((color, key) => {
            return renderColorWall(color, props, key)
          })
        }
      </div>
    </div>
  )
}

const handleClick = (color: Color, props: Object) => {
  const { addToLivePalette } = props
  addToLivePalette(color)
}

const mapStateToProps = (state, props) => {
  const { lp } = state
  return {
    addColors: lp.colors
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    addToLivePalette: (color) => {
      dispatch(add(color))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpertColorDetails)
