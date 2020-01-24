// @flow
import React, { PureComponent } from 'react'
import { fullColorNumber, getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'
import type { CollectionsSummary } from '../../shared/types/Colors'
import cloneDeep from 'lodash/cloneDeep'
import './CollectionSummary.scss'
const baseClass = 'collection__summary'

type Props = {
  data: CollectionsSummary,
  getSummaryData: Function,
  isExpertColor: boolean,
  handlePrev: Function,
  handleNext: Function,
  itemsPerView: number,
  itemNumber: number
}

const KEY_CODE_TAB = 9
const KEY_CODE_ENTER = 13
const KEY_CODE_SPACE = 32

class CollectionSummary extends PureComponent<Props> {
  handleClick = () => {
    const { getSummaryData, data } = this.props
    getSummaryData(data)
  }
  handleKeyDown = (e) => {
    if (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE) {
      e.preventDefault()
      this.handleClick()
    }

    if (!e.shiftKey && e.keyCode === KEY_CODE_TAB && ((this.props.itemNumber) % this.props.itemsPerView === 0)) {
      this.props.handleNext()
    } else if (e.shiftKey && e.keyCode === KEY_CODE_TAB && ((this.props.itemNumber) % this.props.itemsPerView === 1)) {
      this.props.handlePrev()
    }
  }
  render () {
    const { data, isExpertColor } = this.props
    let color = { hex: '', name: '', brandKey: '', colorNumber: '' }
    let img
    let collectionName
    let bottomColorList

    if (isExpertColor) {
      if (!data.colorDefs) return null
      color = cloneDeep(data.colorDefs[0])
      bottomColorList = cloneDeep(data.colorDefs.slice(1))
    } else {
      img = data.img
      collectionName = data.name
      bottomColorList = cloneDeep(data.collections.slice(0, 5))
    }

    return (
      <React.Fragment>
        <div className={`${baseClass}`}>
          <div className={`${baseClass}__wrapper`} role='button' tabIndex='0' onClick={this.handleClick} onKeyDown={this.handleKeyDown}>
            {isExpertColor &&
              <div className={`${baseClass}__top-section`} style={{ backgroundColor: color.hex, color: getContrastYIQ(color.hex) }}>
                <div className={`${baseClass}__content__wrapper`}>
                  <div className={`${baseClass}__content__wrapper__color-number`} >
                    {fullColorNumber(color.brandKey, color.colorNumber)}
                  </div>
                  <div className={`${baseClass}__content__wrapper__color-name`}>
                    {color.name}
                  </div>
                </div>
              </div>
            }
            {
              !isExpertColor &&
              <img className={`${baseClass}__top-section__image`} alt={`${collectionName}. ${data.description}`} src={img} />
            }
            <div className={`${baseClass}__bottom-list`}>
              {bottomColorList.map((color, key) => {
                return <div key={key} style={{ backgroundColor: color.hex }} className={`${baseClass}__bottom-item
              ${isExpertColor ? `${baseClass}__bottom-item--thick-border` : `${baseClass}__bottom-item--thin-border`}`} />
              })}
            </div>
          </div>
          <div>
            {
              !isExpertColor &&
              <div className={`${baseClass}__collection-name`}>
                {collectionName}
              </div>
            }
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default CollectionSummary
