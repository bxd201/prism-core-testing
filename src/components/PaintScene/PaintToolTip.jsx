// @flow
import React from 'react'
import './PaintToolTip.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { injectIntl } from 'react-intl'
import 'src/providers/fontawesome/fontawesome'

type Props = {
  tooltipToolActiveName: string,
  tooltipToolActiveNumber: number,
  tooltipContent: string,
  toolsCount: number,
  closeTooltip: Function,
  backButtonClickHandler: Function,
  nextButtonClickHandler: Function,
  isSelectGroup?: boolean,
  intl: any
}

const baseClass = 'paint-tooltip'
const wrapperClass = `${baseClass}__wrapper`
const containerClass = `${baseClass}__container`
const closeButtonClass = `${baseClass}__close-button`
const headerClass = `${baseClass}__header`
const toolNameClass = `${baseClass}__tool-name`
const tooltipContentClass = `${baseClass}__tooltip-content`
const footerClass = `${baseClass}__footer`
const buttonClass = `${baseClass}__button`
const buttonShowClass = `${buttonClass}--show`
const buttonHideClass = `${buttonClass}--hide`
const buttonLeftClass = `${baseClass}__button-left`
const buttonRightClass = `${baseClass}__button-right`
const toolNumberClass = `${baseClass}__tool-number`
const downPointerClass = `${baseClass}__down-pointer`
const downPointerHidePaintClass = `${downPointerClass}--hide-paint`
const downPointerHintsClass = `${downPointerClass}--hints`
const selectGroup = `${baseClass}__select-group`

const divTranslateFactor = -152

export function PaintToolTip ({ tooltipToolActiveName, closeTooltip, backButtonClickHandler, nextButtonClickHandler, tooltipContent, tooltipToolActiveNumber, toolsCount, isSelectGroup, intl }: Props) {
  let divTranslateValue = 0
  if (!isSelectGroup) {
    divTranslateValue = divTranslateFactor + (tooltipToolActiveNumber <= 8 ? tooltipToolActiveNumber - 1 : 8) * 52
  }

  return (
    <React.Fragment>
      {!isSelectGroup && <div className={`${wrapperClass}`} style={{ transform: `translate(${divTranslateValue}px)` }}>
        <div className={`${containerClass}`}>
          <button className={`${closeButtonClass}`} onClick={() => closeTooltip()}>
            <FontAwesomeIcon title={intl.messages['PAINT_TOOLS.CLOSE']} className={``} icon={['fal', 'times']} size='lg' />
          </button>
          <div className={`${headerClass}`}>
            <FontAwesomeIcon className={``} icon={['fal', 'info-circle']} size='1x' />&nbsp;<span>TOOL TIPS</span>
          </div>
          <div className={`${toolNameClass}`}>{tooltipToolActiveName}</div>
          <div className={`${tooltipContentClass}`}>
            {tooltipContent}
          </div>
          <div className={`${footerClass}`}>
            <button className={`${buttonClass} ${buttonLeftClass} ${tooltipToolActiveNumber === 1 ? `${buttonHideClass}` : `${buttonShowClass}`}`} onClick={() => backButtonClickHandler()}>
              <FontAwesomeIcon title={intl.messages['PAINT_TOOLS.BACK']} icon={['fa', 'chevron-left']} />&nbsp;<span>BACK</span>
            </button>
            <span className={`${toolNumberClass}`}>{tooltipToolActiveNumber} of {toolsCount}</span>
            <button className={`${buttonClass} ${buttonRightClass} ${tooltipToolActiveNumber < toolsCount ? `${buttonShowClass}` : `${buttonHideClass}`}`} onClick={() => nextButtonClickHandler()}>
              <span>NEXT</span>&nbsp;<FontAwesomeIcon title={intl.messages['PAINT_TOOLS.FORWARD']} icon={['fa', 'chevron-right']} />
            </button>
          </div>
        </div>
        <div className={`${downPointerClass} ${tooltipToolActiveNumber === 10 ? `${downPointerHidePaintClass}` : ``} ${tooltipToolActiveNumber === 11 ? `${downPointerHintsClass}` : ``}`} />
      </div>}
      {isSelectGroup && <div className={`${wrapperClass} ${selectGroup}`}>
        <button className={`${closeButtonClass}`} onClick={() => closeTooltip()}>
          <FontAwesomeIcon title={intl.messages['PAINT_TOOLS.CLOSE']} className={``} icon={['fal', 'times']} size='lg' />
        </button>
        <div className={`${headerClass}`}>
          <FontAwesomeIcon title={intl.messages['PAINT_TOOLS.INFO']} className={``} icon={['fal', 'info-circle']} size='1x' />&nbsp;TOOL TIPS
        </div>
        <div className={`${toolNameClass}`}>{tooltipToolActiveName}</div>
        <div className={`${tooltipContentClass}`}>
          {tooltipContent}
        </div>
        <div className={`${downPointerClass}`} />
      </div>}
    </React.Fragment>
  )
}

export {
  toolNameClass, tooltipContentClass, toolNumberClass, headerClass
}
export default injectIntl(PaintToolTip)