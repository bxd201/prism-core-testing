// @flow
import React, { PureComponent } from 'react'
import './PaintToolBar.scss'
import { toolBarButtons, selectGroupButtons, selectGroupTooltipData, toolNames, toolNumbers, groupToolNames } from './data'
import BrushTypes from './BrushTypes'
import PaintToolTip from './PaintToolTip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ZoomTool from './ZoomTool'

const baseClass = 'paint-tool-bar'
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
  isDeleteGroup: boolean
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
  constructor (props: ComponentProps) {
    super(props)

    this.state = {
      showToolBar: true,
      showPaintBrushTypes: false,
      showEraseBrushTypes: false,
      showTooltip: false,
      tooltipToolActiveNumber: 0,
      isHidePaint: false,
      zoomSliderHide: -1
    }

    this.getToolBarItemClassName = this.getToolBarItemClassName.bind(this)
    this.generateTools = this.generateTools.bind(this)
    this.hidePaintBrushTypes = this.hidePaintBrushTypes.bind(this)
    this.hideEraseBrushTypes = this.hideEraseBrushTypes.bind(this)
  }

  componentDidUpdate (prevProps: Object, prevState: Object) {
    if (prevProps.paintBrushShape !== this.props.paintBrushShape || prevProps.paintBrushWidth !== this.props.paintBrushWidth) {
      this.hidePaintBrushTypes()
    }
    if (prevProps.eraseBrushShape !== this.props.eraseBrushShape || prevProps.eraseBrushWidth !== this.props.eraseBrushWidth) {
      this.hideEraseBrushTypes()
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
    if (toolName === toolNames.HIDEPAINT && !this.state.showTooltip) {
      this.setState({ isHidePaint: true })
      e.preventDefault()
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
  generateTools (): Array<any> {
    const { tooltipToolActiveNumber, isHidePaint, showTooltip } = this.state
    const { activeTool } = this.props
    const tools = toolBarButtons.map((tool: Object, index: number) => {
      const iconProps = {}
      if (tool.fontAwesomeIcon.flip) {
        iconProps.flip = tool.fontAwesomeIcon.flip
      }
      return <button
        key={tool.id}
        name={tool.name}
        className={`${this.getToolBarItemClassName(tool)}`}
        onClick={(e) => this.buttonClickHandler(e, tool.name)}
        onMouseDown={(e) => this.toolButtonMouseDownHandler(e, tool.name)}
      >
        <FontAwesomeIcon className={`${toolIconClass}`} icon={[tool.fontAwesomeIcon.variant, tool.fontAwesomeIcon.icon]} size='lg' transform={{ rotate: tool.fontAwesomeIcon.rotate }} {...iconProps} />
        {tool.name === toolNames.DEFINEAREA && <FontAwesomeIcon className={`${toolIconClass}`} icon={['fal', 'plus']} size='xs' style={{ right: '12px', top: '21px' }} />}
        {tool.name === toolNames.REMOVEAREA && <FontAwesomeIcon className={`${toolIconClass}`} icon={['fal', 'minus']} size='xs' style={{ right: '12px', top: '21px' }} />}
        <span className={`${toolNameClass} ${(activeTool === tool.name && !showTooltip) || (showTooltip && tooltipToolActiveNumber === tool.id) || (isHidePaint && tool.name === toolNames.HIDEPAINT) ? `${toolNameActiveClass}` : ``}`}>{tool.displayName}</span>
      </button>
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
    if (tooltipToolActiveNumber < toolBarButtons.length) {
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
    const { activeTool } = this.props
    const groupTools = selectGroupButtons.map((tool: Object, index: number) => {
      return <button
        key={tool.id}
        name={tool.name}
        className={`${toolbarButtonClass}`}
        onClick={(e) => this.groupClickHandler(e, tool.name)}
      >
        <FontAwesomeIcon className={`${toolIconClass}`} icon={[tool.fontAwesomeIcon.variant, tool.fontAwesomeIcon.icon]} size='lg' transform={{ rotate: tool.fontAwesomeIcon.rotate }} />
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

  render () {
    const { showToolBar, showPaintBrushTypes, showEraseBrushTypes, showTooltip, tooltipToolActiveNumber, zoomSliderHide } = this.state
    const { activeTool, paintBrushShape, paintBrushWidth, eraseBrushShape, eraseBrushWidth, setBrushShapeSize, applyZoom } = this.props

    return (
      <React.Fragment>
        <div className={`${groupToolClass} ${(showToolBar && !showTooltip && activeTool === toolNames.SELECTAREA) || (showTooltip && tooltipToolActiveNumber > 0 && tooltipToolActiveNumber === toolNumbers.SELECTAREA) ? `${groupToolShowClass}` : `${groupToolHideClass}`}`}>
          { this.generateSelectGroupTools() }
          {showTooltip && tooltipToolActiveNumber > 0 && tooltipToolActiveNumber === toolNumbers.SELECTAREA && <PaintToolTip
            isSelectGroup
            tooltipToolActiveName={selectGroupTooltipData[0].displayName}
            tooltipToolActiveNumber={toolNumbers.SELECTAREA}
            tooltipContent={selectGroupTooltipData[0].tooltipContent}
            toolsCount={toolBarButtons.length}
            closeTooltip={this.closeTooltip}
            backButtonClickHandler={this.backButtonClickHandler}
            nextButtonClickHandler={this.nextButtonClickHandler}
          />}
        </div>
        <div className={`${wrapperClass}`}>
          <div className={`${containerClass} ${(!showToolBar) ? `${containerHideClass}` : ``}`}>
            { this.generateTools() }
            <div
              onMouseLeave={this.hidePaintBrushTypes}
              className={`${brushTypesClass} ${(!showTooltip && (activeTool === toolNames.PAINTBRUSH && showPaintBrushTypes)) ? `${brushTypesShowClass}` : `${brushTypesHideClass}`} ${brushTypesPaintClass} ${showToolBar ? `${brushTypesShowByOpacityClass}` : `${brushTypesHideByOpacityClass}`} `}
            >
              <BrushTypes hidePaintBrushTypes={this.hidePaintBrushTypes} activeWidth={paintBrushWidth} activeShape={paintBrushShape} setBrushShapeSize={setBrushShapeSize} />
            </div>
            <div
              onMouseLeave={this.hideEraseBrushTypes}
              className={`${brushTypesClass} ${(!showTooltip && (activeTool === toolNames.ERASE && showEraseBrushTypes)) ? `${brushTypesShowClass}` : `${brushTypesHideClass}`} ${brushTypesEraseClass} ${showToolBar ? `${brushTypesShowByOpacityClass}` : `${brushTypesHideByOpacityClass}`} `}
            >
              <BrushTypes hideEraseBrushTypes={this.hideEraseBrushTypes} activeWidth={eraseBrushWidth} activeShape={eraseBrushShape} setBrushShapeSize={setBrushShapeSize} />
              {(activeTool === toolNames.ERASE) && <button className={`${clearAllButtonClass}`} onClick={this.clearAllClickHandler}>CLEAR ALL</button>}
            </div>
            {showTooltip && <div className={`${paintTooltipClass} ${paintTooltipActiveClass}`}>
              <PaintToolTip
                tooltipToolActiveName={toolBarButtons[tooltipToolActiveNumber - 1].displayName}
                tooltipToolActiveNumber={tooltipToolActiveNumber}
                tooltipContent={toolBarButtons[tooltipToolActiveNumber - 1].tooltipContent}
                toolsCount={toolBarButtons.length}
                closeTooltip={this.closeTooltip}
                backButtonClickHandler={this.backButtonClickHandler}
                nextButtonClickHandler={this.nextButtonClickHandler} />
            </div>}
            <div className={`${zoomToolClass} ${activeTool === toolNames.ZOOM && !showTooltip && zoomSliderHide === -1 ? `${zoomToolShowClass}` : activeTool !== toolNames.ZOOM ? `${zoomToolHideClass}` : ``} ${activeTool === toolNames.ZOOM && zoomSliderHide === 0 && !showTooltip ? `${zoomToolShowByOpacityClass}` : activeTool === toolNames.ZOOM && zoomSliderHide === 1 && !showTooltip ? `${zoomToolHideByOpacityClass}` : ``}`}>
              <ZoomTool applyZoom={applyZoom} />
            </div>
          </div>
          <div className={`${toolbarToggleClass}`}>
            <button onClick={this.toggleButtonClickHandler} className={`${toolbarToggleButtonClass} ${showToolBar ? `${toolbarToggleButtonToolbarShownClass}` : `${toolbarToggleButtonToolbarHiddenClass}`}`} />
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export {
  toolbarButtonClass, toolbarToggleButtonClass, brushTypesClass
}
export default PaintToolBar
