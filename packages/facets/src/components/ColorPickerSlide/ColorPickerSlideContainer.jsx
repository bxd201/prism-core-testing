// @flow
import React from 'react'
import type { Color } from '../../../src/shared/types/Colors.js.flow'
import { fullColorNumber } from '../../../src/shared/helpers/ColorUtils'
import { connect } from 'react-redux'
import { add } from '../../store/actions/live-palette'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import some from 'lodash/some'
import { Link } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'
import { KEY_CODES } from 'src/constants/globals'

const baseClass = 'prism-color-palette-suggester'
const paletteSuggesterDetails = 'slide-palette-details'

const colorCollectionsPath = '/color-collections'

type Props = {
    isShowSlider: boolean,
    addColors: Color,
    expertColor: Color[],
    isMobile: boolean,
    associatedColorCollection: Object
}

function PaletteSuggester (props: Props) {
  const { isShowSlider, addColors, expertColor, isMobile, associatedColorCollection } = props
  const displayArea = 'container__color-display-area'
  const content = 'container__color-display-content'
  const icons = 'container__toggle-check-icons'
  const intl = useIntl()

  return (
    <React.Fragment>
      {!isMobile && <div className={`${baseClass}__wrapper`}>
        <div className={`${baseClass}__header`}><FormattedMessage id='EXPERT_COLOR_PICKS' /></div>
        { expertColor.map((color, id) => {
          const isColorAdded = some(addColors, color)
          return (
            <div className={`${baseClass}__container`} key={id}>
              <button tabIndex={`${(!isColorAdded && isShowSlider) ? '0' : '-1'}`} aria-label={`${intl.formatMessage({ id: 'ADD_COLOR_TO_PALETTE' }, { colorName: color.name })}`} className={`${baseClass}__container__button ${baseClass}__container__button--focus`} onMouseDown={(e) => e.preventDefault()} onClick={() => handleClick(isColorAdded, isShowSlider, color, props)}>
                <div className={`${baseClass}__${displayArea}
                    ${isColorAdded ? `${baseClass}__${displayArea}--active` : `${baseClass}__${displayArea}--unactive`}
                    ${isShowSlider ? `${baseClass}__${displayArea}--show` : `${baseClass}__${displayArea}--hide`}`
                } style={{ backgroundColor: color.hex }}>
                  { isColorAdded && <FontAwesomeIcon className={`${baseClass}__${icons} ${isShowSlider ? `${baseClass}__${icons}--show` : `${baseClass}__${icons}--hide`}`} icon={['fa', 'check-circle']} size='2x' /> }
                  { !isColorAdded && <FontAwesomeIcon className={`${baseClass}__${icons} ${baseClass}__${icons} ${isShowSlider ? `${baseClass}__${icons}--show` : `${baseClass}__${icons}--hide`}`} icon={['fal', 'plus-circle']} size='2x' onMouseDown={(e) => e.preventDefault()} onClick={() => handleClick(isColorAdded, true, color, props)} onKeyDown={(e) => (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE) && e.stopPropagation() && handleClick(isColorAdded, true, color, props) && e.preventDefault()} /> }
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
      }
      {isMobile &&
      <div className={`${paletteSuggesterDetails}__wrapper`}>
        <div className={`${paletteSuggesterDetails}__wrapper__left`}>
          <ul>
            { expertColor.map((color, id) => {
              return (
                <li className={`${paletteSuggesterDetails}__container`} key={`${color.colorNumber}-${id}`}>
                  <div className={`${paletteSuggesterDetails}__container__color`} style={{ backgroundColor: color.hex }}>&nbsp;</div>
                  <div className={`${paletteSuggesterDetails}__container__color-details`}>
                    <div className={`${paletteSuggesterDetails}__container__color-number`}>
                      {fullColorNumber(color.brandKey, color.colorNumber)}
                    </div>
                    <div className={`${paletteSuggesterDetails}__container__color-name`}>
                      {color.name}
                    </div>
                  </div>
                </li>
              )
            })
            }
          </ul>
        </div>
        <div className={`${paletteSuggesterDetails}__wrapper__right`}>
          <div>
            <div className={`${paletteSuggesterDetails}__wrapper__right__title`}><FormattedMessage id='SELECTED_FROM' /> {associatedColorCollection.name}</div>
            <Link className={`${paletteSuggesterDetails}__wrapper__right__link`} to={{ pathname: colorCollectionsPath, state: { collectionSummary: associatedColorCollection } }}>
              <FormattedMessage id='VIEW_FULL_COLLECTION' />
            </Link>
          </div>
        </div>
      </div>
      }
    </React.Fragment>
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
