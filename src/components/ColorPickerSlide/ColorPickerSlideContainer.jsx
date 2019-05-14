// @flow
import React from 'react'
import type { Color } from '../../../src/shared/types/Colors'
import { fullColorNumber } from '../../../src/shared/helpers/ColorUtils'
import { ExpertColor } from './ExpertColor'
import { connect } from 'react-redux'
import { add } from '../../store/actions/live-palette'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faPlusCircle } from '@fortawesome/pro-solid-svg-icons'
import some from 'lodash/some'

const baseClass = 'prism-color-palette-suggester'

type Props = {
    isShowSlider: boolean,
    addColors: Color
}

export function PaletteSuggester (props: Props) {
  const { isShowSlider, addColors } = props
  const displayArea = 'container__color-display-area'
  const content = 'container__color-display-content'
  const icons = 'container__toggle-check-icons'

  return (
    <div className={`${baseClass}__wrapper`}>
      { ExpertColor.map((color, id) => {
        const isColorAdded = some(addColors, color)
        return (
          <div className={`${baseClass}__container`} key={id}>
            <button className={`${baseClass}__container__button`} onClick={() => handleClick(isColorAdded, isShowSlider, color, props)}>
              <div className={`${baseClass}__${displayArea}
                  ${isColorAdded ? `${baseClass}__${displayArea}--active` : `${baseClass}__${displayArea}--unactive`}
                  ${isShowSlider ? `${baseClass}__${displayArea}--show` : `${baseClass}__${displayArea}--hide`}`
              } style={{ backgroundColor: color.hex }}>
                { isColorAdded && isShowSlider && <FontAwesomeIcon className={`${baseClass}__${icons}`} icon={faCheckCircle} /> }
                { !isColorAdded && isShowSlider && <FontAwesomeIcon className={`${baseClass}__${icons}`} icon={faPlusCircle} /> }
              </div>
            </button>
            { isShowSlider &&
              <div className={`${baseClass}__${content}`}>
                <div className={`${baseClass}__${content}__color-number`} >
                  {fullColorNumber(color.brandKey, color.colorNumber)}
                </div>
                <div className={`${baseClass}__${content}__color-name`}>
                  {color.name}
                </div>
              </div>
            }
          </div>
        )
      })
      }
    </div>
  )
}

const handleClick = (isColorAdded: boolean, isShowSlider: boolean, color: Color, props: object) => {
  const { addToLivePalette, handleSlideShow } = props
  if (!isColorAdded && isShowSlider) {
    addToLivePalette(color)
  } else if (!isShowSlider) {
    handleSlideShow()
  }
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

export default connect(mapStateToProps, mapDispatchToProps)(PaletteSuggester)
