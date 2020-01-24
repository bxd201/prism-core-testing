// @flow
import React from 'react'
import type { Color } from '../../../src/shared/types/Colors'
import { fullColorNumber } from '../../../src/shared/helpers/ColorUtils'
import { connect } from 'react-redux'
import { add } from '../../store/actions/live-palette'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import some from 'lodash/some'

const baseClass = 'prism-color-palette-suggester'
const KEY_CODE_ENTER = 13
const KEY_CODE_SPACE = 32

type Props = {
    isShowSlider: boolean,
    addColors: Color,
    expertColor: Color[]
}

function PaletteSuggester (props: Props) {
  const { isShowSlider, addColors, expertColor } = props
  const displayArea = 'container__color-display-area'
  const content = 'container__color-display-content'
  const icons = 'container__toggle-check-icons'

  return (
    <div className={`${baseClass}__wrapper`}>
      <div className={`${baseClass}__header`}>Expert Color Picks</div>
      { expertColor.map((color, id) => {
        const isColorAdded = some(addColors, color)
        return (
          <div className={`${baseClass}__container`} key={id}>
            <button tabIndex={`${(!isColorAdded && isShowSlider) ? `0` : `-1`}`} aria-label={`add ${color.name} to palette`} className={`${baseClass}__container__button ${baseClass}__container__button--focus`} onMouseDown={(e) => e.preventDefault()} onClick={() => handleClick(isColorAdded, isShowSlider, color, props)}>
              <div className={`${baseClass}__${displayArea}
                  ${isColorAdded ? `${baseClass}__${displayArea}--active` : `${baseClass}__${displayArea}--unactive`}
                  ${isShowSlider ? `${baseClass}__${displayArea}--show` : `${baseClass}__${displayArea}--hide`}`
              } style={{ backgroundColor: color.hex }}>
                { isColorAdded && <FontAwesomeIcon className={`${baseClass}__${icons} ${isShowSlider ? `${baseClass}__${icons}--show` : `${baseClass}__${icons}--hide`}`} icon={['fa', 'check-circle']} size='2x' /> }
                { !isColorAdded && <FontAwesomeIcon className={`${baseClass}__${icons} ${baseClass}__${icons} ${isShowSlider ? `${baseClass}__${icons}--show` : `${baseClass}__${icons}--hide`}`} icon={['fal', 'plus-circle']} size='2x' onMouseDown={(e) => e.preventDefault()} onClick={() => handleClick(isColorAdded, true, color, props)} onKeyDown={(e) => (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE) && e.stopPropagation() && handleClick(isColorAdded, true, color, props) && e.preventDefault()} /> }
              </div>
            </button>
            <div className={`${baseClass}__${content}`}>
              <div className={`${baseClass}__${content}__color-number`} >
                {fullColorNumber(color.brandKey, color.colorNumber)}
              </div>
              <div className={`${baseClass}__${content}__color-name`}>
                {color.name}
              </div>
            </div>
          </div>
        )
      })
      }
    </div>
  )
}

const handleClick = (isColorAdded: boolean, isShowSlider: boolean, color: Color, props: Object) => {
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

export {
  PaletteSuggester
}
export default connect(mapStateToProps, mapDispatchToProps)(PaletteSuggester)
