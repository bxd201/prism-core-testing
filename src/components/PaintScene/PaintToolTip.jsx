// @flow
import React from 'react'
import './PaintToolTip.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage, injectIntl } from 'react-intl'
import 'src/providers/fontawesome/fontawesome'
import { divTranslateFactor, divTranslateMultiplier, downPointerDivTranslateFactor, downPointerDivTranslateMultiplie } from './data'

type Props = {
  tooltipToolActiveName: string,
  tooltipToolActiveNumber: number,
  tooltipContent: string,
  toolsCount: number,
  closeTooltip: Function,
  backButtonClickHandler: Function,
  nextButtonClickHandler: Function,
  isSelectGroup?: boolean,
  intl: any,
  showTooltipContentByZindex: Function,
  hideTooltipContentByZindex: Function,
  parentDivRef: RefObject
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
const downPointerGroupToolClass = `${downPointerClass}__group-tool`
const downPointerHidePaintClass = `${downPointerClass}--hide-paint`
const downPointerHintsClass = `${downPointerClass}--hints`
const selectGroup = `${baseClass}__select-group`

export function PaintToolTip ({ tooltipToolActiveName, closeTooltip, backButtonClickHandler, nextButtonClickHandler, tooltipContent, tooltipToolActiveNumber, toolsCount, isSelectGroup, intl, showTooltipContentByZindex, hideTooltipContentByZindex, parentDivRef }: Props) {
  const divTranslateValue = divTranslateFactor + (tooltipToolActiveNumber <= 8 ? tooltipToolActiveNumber - 1 : 8) * divTranslateMultiplier
  const downPointerTranslateValue = downPointerDivTranslateFactor + (tooltipToolActiveNumber * downPointerDivTranslateMultiplie)

  const wrapperStyle = (window.outerWidth > 767) ? { transform: `translate(${divTranslateValue}px)` } : { transform: `translate(0px)` }
  const downPointerStyle = (window.outerWidth > 767) ? { transform: `translate(0px)` } : { transform: `translate(${downPointerTranslateValue}px)` }

  return (
    <React.Fragment>
      {!isSelectGroup && <div onMouseEnter={() => showTooltipContentByZindex(parentDivRef)} onMouseLeave={() => hideTooltipContentByZindex(parentDivRef)} className={`${wrapperClass}`} style={wrapperStyle}>
        <div className={`${containerClass}`}>
          <button className={`${closeButtonClass}`} onClick={() => closeTooltip()}>
            <FontAwesomeIcon title={intl.messages['PAINT_TOOLS.CLOSE']} className={``} icon={['fal', 'times']} size='lg' />
          </button>
          <div className={`${headerClass}`}>
            <FontAwesomeIcon className={``} icon={['fal', 'info-circle']} size='1x' />&nbsp;<span><FormattedMessage id='TOOL_TIPS' /></span>
          </div>
          <div className={`${toolNameClass}`}>{tooltipToolActiveName}</div>
          <div className={`${tooltipContentClass}`}>
            {tooltipContent}
          </div>
          <div className={`${footerClass}`}>
            <button className={`${buttonClass} ${buttonLeftClass} ${tooltipToolActiveNumber === 1 ? `${buttonHideClass}` : `${buttonShowClass}`}`} onClick={() => backButtonClickHandler()}>
              <FontAwesomeIcon title={intl.messages['PAINT_TOOLS.BACK']} icon={['fa', 'chevron-left']} />&nbsp;<span><FormattedMessage id='BACK' /></span>
            </button>
            <span className={`${toolNumberClass}`}>{tooltipToolActiveNumber} of {toolsCount}</span>
            <button className={`${buttonClass} ${buttonRightClass} ${tooltipToolActiveNumber < toolsCount ? `${buttonShowClass}` : `${buttonHideClass}`}`} onClick={() => nextButtonClickHandler()}>
              <span><FormattedMessage id='NEXT' /></span>&nbsp;<FontAwesomeIcon title={intl.messages['PAINT_TOOLS.FORWARD']} icon={['fa', 'chevron-right']} />
            </button>
          </div>
        </div>
        <div className={`${downPointerClass} ${tooltipToolActiveNumber === 10 ? `${downPointerHidePaintClass}` : ``} ${tooltipToolActiveNumber === 11 ? `${downPointerHintsClass}` : ``}`} style={downPointerStyle} />
      </div>}
      {isSelectGroup && <div onMouseEnter={() => showTooltipContentByZindex(parentDivRef)} onMouseLeave={() => hideTooltipContentByZindex(parentDivRef)} className={`${wrapperClass} ${selectGroup}`}>
        <button className={`${closeButtonClass}`} onClick={() => closeTooltip()}>
          <FontAwesomeIcon title={intl.messages['PAINT_TOOLS.CLOSE']} className={``} icon={['fal', 'times']} size='lg' />
        </button>
        <div className={`${headerClass}`}>
          <FontAwesomeIcon title={intl.messages['PAINT_TOOLS.INFO']} className={``} icon={['fal', 'info-circle']} size='1x' />&nbsp;<FormattedMessage id='TOOL_TIPS' />
        </div>
        <div className={`${toolNameClass}`}>{tooltipToolActiveName}</div>
        <div className={`${tooltipContentClass}`}>
          {tooltipContent}
        </div>
        <div className={`${downPointerClass} ${downPointerGroupToolClass}`} />
      </div>}
    </React.Fragment>
  )
}

export {
  toolNameClass, tooltipContentClass, toolNumberClass, headerClass
}
export default injectIntl(PaintToolTip)
