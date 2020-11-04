// @flow
import React, { PureComponent } from 'react'
import './PaintToolBar.scss'
import { toolBarButtons, selectGroupButtons, selectGroupTooltipData, toolNames, toolNumbers, groupToolNames, getTooltipShownLocalStorage, addColorsTooltip, addColorsTooltipNumber } from './data'
import BrushTypes from './BrushTypes'
import PaintToolTip from './PaintToolTip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import ZoomTool from './ZoomTool'
import { FormattedMessage, injectIntl } from 'react-intl'
import storageAvailable from '../../shared/utils/browserStorageCheck.util'

const baseClass = 'paint-tool-bar'
const paintToolsClass = `${baseClass}__paint-tools`
const wrapperClass = `${baseClass}__wrapper`
const containerClass = `${baseClass}__tools-container`
const containerHideClass = `${containerClass}--hide`
const toolbarButtonClass = `${baseClass}__toolbar-button`
const toolbarButtonActiveClass = `${toolbarButtonClass}--active`
const toolbarButtonDisabledClass = `${toolbarButtonClass}--disabled`
const toolbarToggleClass = `${baseClass}__toolbar-toggle`
const toolbarToggleButtonClass = `${baseClass}__toolbar-toggle-button`
const toolbarToggleButtonToolbarShownClass = `${toolbarToggleButtonClass}--toolbar-shown`
const toolbarToggleButtonToolbarHiddenClass = `${toolbarToggleButtonClass}--toolbar-hidden`
const brushTypesClass = `${baseClass}__brush-types`
const brushTypesShowClass = `${brushTypesClass}--show`
const brushTypesHideClass = `${brushTypesClass}--hide`
const brushTypesShowByOpacityClass = `${brushTypesClass}--show-by-opacity`
const brushTypesHideByOpacityClass = `${brushTypesClass}--hide-by-opacity`
const brushTypesPaintClass = `${baseClass}__brush-types-paint`
const brushTypesEraseClass = `${baseClass}__brush-types-erase`
const clearAllButtonClass = `${baseClass}__clear-all`
const toolNameClass = `${baseClass}__tool-name`
const toolNameActiveClass = `${toolNameClass}--active`
const toolNameDisabledClass = `${toolNameClass}--disabled`
const paintTooltipClass = `${baseClass}__paint-tooltip`
const paintTooltipActiveClass = `${paintTooltipClass}--active`
const toolIconClass = `${baseClass}__tool-icon`
const toolIconSecondIconClass = `${toolIconClass}__second-icon`
const groupToolClass = `${baseClass}__group-tool`
const groupToolShowClass = `${groupToolClass}--show`
const groupToolHideClass = `${groupToolClass}--hide`
const zoomToolClass = `${baseClass}__zoom-tool`
const zoomToolShowByOpacityClass = `${zoomToolClass}--show-by-opacity`
const zoomToolHideByOpacityClass = `${zoomToolClass}--hide-by-opacity`
const zoomToolShowClass = `${zoomToolClass}--show`
const zoomToolHideClass = `${zoomToolClass}--hide`

type ComponentProps = {
  activeTool: string,
  setActiveTool: Function,
  clearCanvas: Function,
  paintBrushShape: string,
  paintBrushWidth: number,
  eraseBrushShape: string,
  eraseBrushWidth: number,
  setBrushShapeSize: Function,
  groupHandler: Function,
  performUndo: Function,
  performRedo: Function,
  undoIsEnabled: boolean,
  redoIsEnabled: boolean,
  hidePaint: Function,
  applyZoom: Function,
  isUngroup: boolean,
  isAddGroup: boolean,
  isDeleteGroup: boolean,
  isInfoToolActive: boolean,
  intl: any,
  containerWidth: number,
  zoomValue: number
}

type ComponentState = {
  showToolBar: boolean,
  showPaintBrushTypes: boolean,
  showEraseBrushTypes: boolean,
  showTooltip: boolean,
  tooltipToolActiveNumber: number,
  isHidePaint: boolean,
  zoomSliderHide: number
}

export class PaintToolBar extends PureComponent<ComponentProps, ComponentState> {
  groupTooltipDivRef: RefObject
  tooltipDivRef: RefObject

  constructor (props: ComponentProps) {
    super(props)

    this.groupTooltipDivRef = React.createRef()
    this.tooltipDivRef = React.createRef()
    this.state = {
      showToolBar: true,
      showPaintBrushTypes: false,
      showEraseBrushTypes: false,
      showTooltip: false,
      tooltipToolActiveNumber: 1,
      isHidePaint: false,
      zoomSliderHide: -1
    }

    this.getToolBarItemClassName = this.getToolBarItemClassName.bind(this)
    this.generateTools = this.generateTools.bind(this)
    this.hidePaintBrushTypes = this.hidePaintBrushTypes.bind(this)
    this.hideEraseBrushTypes = this.hideEraseBrushTypes.bind(this)
  }

  componentDidMount () {
    if (storageAvailable('localStorage') && getTooltipShownLocalStorage() === null) {
      this.setState({ showTooltip: this.props.isInfoToolActive })
    }
  }

  /*:: getToolBarItemClassName: (tool: Object) => string */
  getToolBarItemClassName (tool: Object): string {
    const { showTooltip, tooltipToolActiveNumber, isHidePaint } = this.state
    const { activeTool, undoIsEnabled, redoIsEnabled } = this.props
    let itemClassName = `${toolbarButtonClass} ${((!showTooltip && activeTool === tool.name && tool.name !== toolNames.UNDO && tool.name !== toolNames.REDO) || (showTooltip && tooltipToolActiveNumber === tool.id) || (isHidePaint && tool.name === toolNames.HIDEPAINT)) ? `${toolbarButtonActiveClass}` : ``}`

    if (tool.name === toolNames.UNDO && !undoIsEnabled && (!showTooltip || (showTooltip && tooltipToolActiveNumber !== toolNumbers.UNDO))) {
      itemClassName += ` ${toolbarButtonDisabledClass}`
    }

    if (tool.name === toolNames.REDO && !redoIsEnabled && (!showTooltip || (showTooltip && tooltipToolActiveNumber !== toolNumbers.REDO))) {
      itemClassName += ` ${toolbarButtonDisabledClass}`
    }

    return itemClassName
  }

  toggleButtonClickHandler = (e: Object) => {
    e.preventDefault()
    e.stopPropagation()
    const { showTooltip } = this.state
    const { activeTool } = this.props
    if (showTooltip) {
      return
    }
    this.setState((prevState, props) => ({ showToolBar: !prevState.showToolBar }), () => {
      if (activeTool === toolNames.ZOOM) {
        if (this.state.showToolBar) {
          this.setState((prevState) => ({ zoomSliderHide: 0 }))
        } else {
          this.setState((prevState) => ({ zoomSliderHide: 1 }))
        }
      }
    })
  }

  buttonClickHandler = (e: Object, toolName: string) => {
    e.preventDefault()
    e.stopPropagation()
    const { setActiveTool, activeTool } = this.props
    const { showTooltip } = this.state

    if (showTooltip) {
      return
    }

    if (toolName === toolNames.INFO) {
      setActiveTool(toolName)
    }

    this.setState({ zoomSliderHide: -1 })

    if (toolName === toolNames.UNDO) {
      if (this.props.undoIsEnabled) {
        this.props.performUndo()
      }
      return
    }

    if (toolName === toolNames.REDO) {
      if (this.props.redoIsEnabled) {
        this.props.performRedo()
      }
      return
    }

    if (toolName === toolNames.INFO) {
      const { activeTool } = this.props
      const activeToolData: Object = toolBarButtons.find((tool: Object) => tool.name === activeTool)
      this.setState({
        showTooltip: true,
        tooltipToolActiveNumber: activeToolData.id
      })
      return
    }

    if (toolName === toolNames.HIDEPAINT) {
      return
    }

    if (activeTool === toolName) {
      if (activeTool === toolNames.PAINTBRUSH) {
        this.setState((prevState, props) => ({
          showPaintBrushTypes: !prevState.showPaintBrushTypes,
          showEraseBrushTypes: false
        }))
      } else if (activeTool === toolNames.ERASE) {
        this.setState((prevState, props) => ({
          showEraseBrushTypes: !prevState.showEraseBrushTypes,
          showPaintBrushTypes: false
        }))
      }
    } else {
      if (toolName === toolNames.PAINTBRUSH) {
        this.setState((prevState, props) => ({
          showPaintBrushTypes: true,
          showEraseBrushTypes: false
        }))
      } else if (toolName === toolNames.ERASE) {
        this.setState((prevState, props) => ({
          showEraseBrushTypes: true,
          showPaintBrushTypes: false
        }))
      }
      setActiveTool(toolName)
    }
  }

  clearAllClickHandler = () => {
    const { clearCanvas } = this.props
    clearCanvas(true)
  }

  toolButtonMouseDownHandler = (e: Object, toolName: string) => {
    e.preventDefault()
    if (toolName === toolNames.HIDEPAINT && !this.state.showTooltip) {
      this.setState({ isHidePaint: true })
      const { hidePaint } = this.props
      hidePaint(e, true)
      window.addEventListener('mouseup', this.toolButtonMouseUpHandler)
      return false
    }
  }

  toolButtonMouseUpHandler = (e: Object) => {
    e.preventDefault()
    this.setState({ isHidePaint: false })
    const { hidePaint } = this.props
    hidePaint(e, false)
    window.removeEventListener('mouseup', this.toolButtonMouseUpHandler)
  }

  /*:: generateTools: () => Array<any> */
  generateTools (paintBrushTypesRender, eraseBrushTypesRender): Array<any> {
    const { tooltipToolActiveNumber, isHidePaint, showTooltip } = this.state
    const { activeTool, intl, undoIsEnabled, redoIsEnabled } = this.props
    const tools = toolBarButtons.map((tool: Object, index: number) => {
      const iconProps = {}
      if (tool.fontAwesomeIcon.flip) {
        iconProps.flip = tool.fontAwesomeIcon.flip
      }

      let renderBrushTypes = <></>

      if ((index + 1) === toolNumbers.PAINTBRUSH) {
        renderBrushTypes = paintBrushTypesRender
      } else if ((index + 1) === toolNumbers.ERASE) {
        renderBrushTypes = eraseBrushTypesRender
      }

      return <React.Fragment key={tool.id}><button
        tabIndex={((showTooltip) || (tool.name === toolNames.UNDO && !undoIsEnabled) || (tool.name === toolNames.REDO && !redoIsEnabled)) ? '-1' : '0'}
        aria-label={`${tool.displayName}`}
        name={tool.name}
        className={`${this.getToolBarItemClassName(tool)}`}
        onClick={(e) => this.buttonClickHandler(e, tool.name)}
        onMouseDown={(e) => this.toolButtonMouseDownHandler(e, tool.name)}
      >
        <FontAwesomeIcon title={intl.formatMessage({ id: `PAINT_TOOLS.${tool.name.toUpperCase()}` })} className={`${toolIconClass}`} icon={[tool.fontAwesomeIcon.variant, tool.fontAwesomeIcon.icon]} size='lg' transform={{ rotate: tool.fontAwesomeIcon.rotate }} {...iconProps} />
        {tool.name === toolNames.DEFINEAREA && <FontAwesomeIcon className={`${toolIconClass} ${toolIconSecondIconClass}`} icon={['fal', 'plus']} size='xs' />}
        {tool.name === toolNames.REMOVEAREA && <FontAwesomeIcon className={`${toolIconClass} ${toolIconSecondIconClass}`} icon={['fal', 'minus']} size='xs' />}
        <span className={`${toolNameClass} ${(activeTool === tool.name && !showTooltip) || (showTooltip && tooltipToolActiveNumber === tool.id) || (isHidePaint && tool.name === toolNames.HIDEPAINT) ? `${toolNameActiveClass}` : ``}`}>{intl.formatMessage({ id: `PAINT_TOOLS.TOOLS_NAME.${tool.name.toUpperCase()}` })}</span>
      </button>{renderBrushTypes}</React.Fragment>
    })

    return tools
  }

  closeTooltip = () => {
    this.setState({ showTooltip: false })
    this.props.setActiveTool('')
  }

  backButtonClickHandler = () => {
    const { tooltipToolActiveNumber } = this.state
    if (tooltipToolActiveNumber > 1) {
      this.setState({ tooltipToolActiveNumber: tooltipToolActiveNumber - 1 })
    }
  }

  groupClickHandler = (e: Object, toolName: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (this.state.showTooltip) return
    this.props.groupHandler(toolName)
  }

  nextButtonClickHandler = () => {
    const { tooltipToolActiveNumber } = this.state
    if (tooltipToolActiveNumber < toolBarButtons.length + 1) {
      this.setState({ tooltipToolActiveNumber: tooltipToolActiveNumber + 1 })
    }
  }

  checkButtonIfDisable = (tool: Object) => {
    const { isUngroup, isAddGroup, isDeleteGroup } = this.props
    if (this.state.showTooltip) return false
    if (tool.name === groupToolNames.DELETEGROUP && isDeleteGroup) { return true }
    if (tool.name === groupToolNames.GROUP && isAddGroup) { return true }
    if (tool.name === groupToolNames.UNGROUP && isUngroup) { return true }
  }

  /*:: generateSelectGroupTools: () => Array<any> */
  generateSelectGroupTools (): Array<any> {
    const { tooltipToolActiveNumber } = this.state
    const { activeTool, intl } = this.props
    const groupTools = selectGroupButtons.map((tool: Object, index: number) => {
      return <button
        key={tool.id}
        tabIndex={(activeTool === toolNames.SELECTAREA) ? '0' : '-1'}
        name={tool.name}
        className={`${toolbarButtonClass}`}
        onClick={(e) => this.groupClickHandler(e, tool.name)}
        onMouseDown={(e) => e.preventDefault()}
      >
        <FontAwesomeIcon title={intl.formatMessage({ id: `PAINT_TOOLS.${tool.name.toUpperCase()}` })} className={`${toolIconClass}`} icon={[tool.fontAwesomeIcon.variant, tool.fontAwesomeIcon.icon]} size='lg' transform={{ rotate: tool.fontAwesomeIcon.rotate }} />
        <span className={`${toolNameClass} ${this.checkButtonIfDisable(tool) ? '' : toolNameDisabledClass} ${activeTool === toolNames.SELECTAREA || tooltipToolActiveNumber === toolNumbers.SELECTAREA ? `${toolNameActiveClass}` : ``}`}>{tool.displayName}</span>
      </button>
    })
    return groupTools
  }

  /*:: hidePaintBrushTypes: () => void */
  hidePaintBrushTypes () {
    this.setState({ showPaintBrushTypes: false })
  }

  /*:: hideEraseBrushTypes: () => void */
  hideEraseBrushTypes () {
    this.setState({ showEraseBrushTypes: false })
  }

  showTooltipContentByZindex = (ref: RefObject) => {
    if (ref.current) {
      ref.current.style.zIndex = 100000
    }
  }

  hideTooltipContentByZindex = (ref: RefObject) => {
    if (ref.current) {
      ref.current.style.zIndex = 1002
    }
  }

  groupTooltipDivMouseEnterHandler = () => {
    this.showTooltipContentByZindex(this.groupTooltipDivRef)
  }

  groupTooltipDivMouseLeaveHandler = () => {
    this.hideTooltipContentByZindex(this.groupTooltipDivRef)
  }

  tooltipDivMouseEnterHandler = () => {
    this.showTooltipContentByZindex(this.tooltipDivRef)
  }

  tooltipDivMouseLeaveHandler = () => {
    this.hideTooltipContentByZindex(this.tooltipDivRef)
  }

  render () {
    const { showToolBar, showPaintBrushTypes, showEraseBrushTypes, showTooltip, tooltipToolActiveNumber, zoomSliderHide } = this.state
    const { activeTool, paintBrushShape, paintBrushWidth, eraseBrushShape, eraseBrushWidth, setBrushShapeSize, applyZoom, intl, containerWidth, zoomValue } = this.props
    const paintBrushTypesRender = (!showTooltip && (activeTool === toolNames.PAINTBRUSH && showPaintBrushTypes)) ? <div
      onMouseLeave={this.hidePaintBrushTypes}
      className={`${brushTypesClass} ${(!showTooltip && (activeTool === toolNames.PAINTBRUSH && showPaintBrushTypes)) ? `${brushTypesShowClass}` : `${brushTypesHideClass}`} ${brushTypesPaintClass} ${showToolBar ? `${brushTypesShowByOpacityClass}` : `${brushTypesHideByOpacityClass}`} `}
    >
      <BrushTypes activeWidth={paintBrushWidth} activeShape={paintBrushShape} setBrushShapeSize={setBrushShapeSize} brushTypeName='paint' />
    </div> : ''

    const eraseBrushTypesRender = (!showTooltip && (activeTool === toolNames.ERASE && showEraseBrushTypes)) ? <div
      onMouseLeave={this.hideEraseBrushTypes}
      className={`${brushTypesClass} ${(!showTooltip && (activeTool === toolNames.ERASE && showEraseBrushTypes)) ? `${brushTypesShowClass}` : `${brushTypesHideClass}`} ${brushTypesEraseClass} ${showToolBar ? `${brushTypesShowByOpacityClass}` : `${brushTypesHideByOpacityClass}`} `}
    >
      <BrushTypes activeWidth={eraseBrushWidth} activeShape={eraseBrushShape} setBrushShapeSize={setBrushShapeSize} brushTypeName='erase' />
      {(activeTool === toolNames.ERASE) && <button className={`${clearAllButtonClass}`} onClick={this.clearAllClickHandler}><FormattedMessage id='CLEAR_ALL' /></button>}
    </div> : ''

    return (
      <>
        <div aria-label={'Tooltips tool wrapper'} className={`${paintToolsClass}`}>
          <div ref={this.groupTooltipDivRef} onMouseEnter={this.groupTooltipDivMouseEnterHandler} onMouseLeave={this.groupTooltipDivMouseLeaveHandler} className={`${groupToolClass} ${(showToolBar && !showTooltip && activeTool === toolNames.SELECTAREA) || (showTooltip && tooltipToolActiveNumber > 0 && tooltipToolActiveNumber === toolNumbers.SELECTAREA) ? `${groupToolShowClass}` : `${groupToolHideClass}`}`}>
            { this.generateSelectGroupTools() }
            {showTooltip && tooltipToolActiveNumber > 0 && tooltipToolActiveNumber === toolNumbers.SELECTAREA && <PaintToolTip
              isSelectGroup
              tooltipToolActiveName={selectGroupTooltipData[0].displayName}
              tooltipToolActiveNumber={toolNumbers.SELECTAREA}
              tooltipContent={intl.formatMessage({ id: 'PAINT_TOOLS.TOOLTIPS.SELECTGROUP' })}
              toolsCount={toolBarButtons.length}
              closeTooltip={this.closeTooltip}
              backButtonClickHandler={this.backButtonClickHandler}
              nextButtonClickHandler={this.nextButtonClickHandler}
              showTooltipContentByZindex={this.showTooltipContentByZindex}
              hideTooltipContentByZindex={this.hideTooltipContentByZindex}
              parentDivRef={this.groupTooltipDivRef}
            />}
          </div>
          <div ref={this.tooltipDivRef} onMouseEnter={this.tooltipDivMouseEnterHandler} onMouseLeave={this.tooltipDivMouseLeaveHandler} className={`${wrapperClass}`}>
            <div aria-label={`${(showToolBar) ? 'Tools container' : 'Tools container hidden'}`} className={`${containerClass} ${(!showToolBar) ? `${containerHideClass}` : ``}`}>
              { this.generateTools(paintBrushTypesRender, eraseBrushTypesRender) }
              {showTooltip && tooltipToolActiveNumber < addColorsTooltipNumber && <div className={`${paintTooltipClass} ${paintTooltipActiveClass}`}>
                <PaintToolTip
                  tooltipToolActiveName={toolBarButtons[tooltipToolActiveNumber - 1].displayName}
                  tooltipToolActiveNumber={tooltipToolActiveNumber}
                  tooltipContent={intl.formatMessage({ id: `PAINT_TOOLS.TOOLTIPS.${toolBarButtons[tooltipToolActiveNumber - 1].name.toUpperCase()}` })}
                  toolsCount={toolBarButtons.length + 1}
                  closeTooltip={this.closeTooltip}
                  backButtonClickHandler={this.backButtonClickHandler}
                  nextButtonClickHandler={this.nextButtonClickHandler}
                  showTooltipContentByZindex={this.showTooltipContentByZindex}
                  hideTooltipContentByZindex={this.hideTooltipContentByZindex}
                  parentDivRef={this.tooltipDivRef} />
              </div>}
              <div className={`${zoomToolClass} ${activeTool === toolNames.ZOOM && !showTooltip && zoomSliderHide === -1 ? `${zoomToolShowClass}` : activeTool !== toolNames.ZOOM ? `${zoomToolHideClass}` : ``} ${activeTool === toolNames.ZOOM && zoomSliderHide === 0 && !showTooltip ? `${zoomToolShowByOpacityClass}` : activeTool === toolNames.ZOOM && zoomSliderHide === 1 && !showTooltip ? `${zoomToolHideByOpacityClass}` : ``}`}>
                <ZoomTool applyZoom={applyZoom} containerWidth={containerWidth} zoomValue={zoomValue} />
              </div>
            </div>
            <div className={`${toolbarToggleClass}`}>
              <button tabIndex={showTooltip ? '-1' : '0'} aria-label='Toggle toolbar' onClick={this.toggleButtonClickHandler} className={`${toolbarToggleButtonClass} ${showToolBar ? `${toolbarToggleButtonToolbarShownClass}` : `${toolbarToggleButtonToolbarHiddenClass}`}`} />
            </div>
          </div>
        </div>
        {showTooltip && tooltipToolActiveNumber === addColorsTooltipNumber && <div className={`${paintTooltipClass} ${paintTooltipActiveClass}`} style={{ left: '0px' }}>
          <PaintToolTip
            tooltipToolActiveName={addColorsTooltip.displayName}
            tooltipToolActiveNumber={tooltipToolActiveNumber}
            tooltipContent={intl.formatMessage({ id: `PAINT_TOOLS.TOOLTIPS.${addColorsTooltip.name.toUpperCase()}` })}
            toolsCount={toolBarButtons.length + 1}
            closeTooltip={this.closeTooltip}
            backButtonClickHandler={this.backButtonClickHandler}
            nextButtonClickHandler={this.nextButtonClickHandler}
            showTooltipContentByZindex={this.showTooltipContentByZindex}
            hideTooltipContentByZindex={this.hideTooltipContentByZindex}
            parentDivRef={this.tooltipDivRef} />
        </div>}
      </>
    )
  }
}

export default injectIntl(PaintToolBar)
