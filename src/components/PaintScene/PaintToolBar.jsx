// @flow
import React, { PureComponent } from 'react'
import './PaintToolBar.scss'
import { toolBarButtons, toolNames } from './data'
import BrushTypes from './BrushTypes'

const baseClass = 'paint-tool-bar'
const wrapperClass = `${baseClass}__wrapper`
const containerClass = `${baseClass}__tools-container`
const containerHideClass = `${containerClass}--hide`
const toolbarButtonClass = `${baseClass}__toolbar-button`
const toolbarButtonActiveClass = `${toolbarButtonClass}--active`
const toolbarButtonDisabledClass = `${toolbarButtonClass}--disabled`
const toolbarToggleClass = `${baseClass}__toolbar-toggle`
const toolbarToggleButtonClass = `${baseClass}__toolbar-toggle-button`
const brushTypesClass = `${baseClass}__brush-types`
const brushTypesShowClass = `${brushTypesClass}--show`
const brushTypesHideClass = `${brushTypesClass}--hide`
const brushTypesPaintClass = `${baseClass}__brush-types-paint`
const brushTypesEraseClass = `${baseClass}__brush-types-erase`
const clearAllButtonClass = `${baseClass}__clear-all`

type ComponentProps = {
  activeTool: string,
  setActiveTool: Function,
  clearCanvas: Function,
  paintBrushShape: string,
  paintBrushWidth: number,
  eraseBrushShape: string,
  eraseBrushWidth: number,
  setBrushShapeSize: Function,
  performUndo: Function,
  performRedo: Function,
  undoIsEnabled: boolean,
  redoIsEnabled: boolean
}

type ComponentState = {
  showToolBar: boolean,
  showPaintBrushTypes: boolean,
  showEraseBrushTypes: boolean
}

export class PaintToolBar extends PureComponent<ComponentProps, ComponentState> {
  constructor (props: ComponentProps) {
    super(props)

    this.state = {
      showToolBar: true,
      showPaintBrushTypes: false,
      showEraseBrushTypes: false
    }

    this.getToolBarItemClassName = this.getToolBarItemClassName.bind(this)
    this.generateTools = this.generateTools.bind(this)
  }

  /*:: getToolBarItemClassName: (tool: Object) => string */
  getToolBarItemClassName (tool: Object): string {
    let itemClassName = `${toolbarButtonClass} ${(this.props.activeTool === tool.name) ? `${toolbarButtonActiveClass}` : ``}`

    if (tool.name === toolNames.UNDO && !this.props.undoIsEnabled) {
      itemClassName += ` ${toolbarButtonDisabledClass}`
    }

    if (tool.name === toolNames.REDO && !this.props.redoIsEnabled) {
      itemClassName += ` ${toolbarButtonDisabledClass}`
    }

    return itemClassName
  }

  toggleButtonClickHandler = (e: Object) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState((prevState, props) => ({ showToolBar: !prevState.showToolBar }))
  }

  buttonClickHandler = (e: Object, toolName: string) => {
    e.preventDefault()
    e.stopPropagation()
    const { setActiveTool, activeTool } = this.props
    if (activeTool === toolNames.PAINTBRUSH) {
      this.setState((prevState, props) => ({
        showPaintBrushTypes: !prevState.showPaintBrushTypes,
        showEraseBrushTypes: false
      }))
    }
    if (activeTool === toolNames.ERASE) {
      this.setState((prevState, props) => ({
        showEraseBrushTypes: !prevState.showEraseBrushTypes,
        showPaintBrushTypes: false
      }))
    }

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

    setActiveTool(toolName)
  }

  clearAllClickHandler = () => {
    const { clearCanvas } = this.props
    clearCanvas()
  }

  /*:: generateTools: () => Array<any> */
  generateTools (): Array<any> {
    const tools = toolBarButtons.map((tool: Object, index: number) => {
      return <button
        key={tool.id}
        name={tool.name}
        className={this.getToolBarItemClassName(tool)}
        onClick={(e) => this.buttonClickHandler(e, tool.name)}
      >
        {tool.id}
      </button>
    })

    return tools
  }

  render () {
    const { showToolBar, showPaintBrushTypes, showEraseBrushTypes } = this.state
    const { activeTool, paintBrushShape, paintBrushWidth, eraseBrushShape, eraseBrushWidth, setBrushShapeSize } = this.props

    return (
      <div className={`${wrapperClass}`}>
        <div className={`${containerClass} ${(!showToolBar) ? `${containerHideClass}` : ``}`}>
          { this.generateTools() }
          <div
            className={`${brushTypesClass} ${((activeTool === toolNames.PAINTBRUSH) && showPaintBrushTypes) ? `${brushTypesShowClass}` : `${brushTypesHideClass}`} ${brushTypesPaintClass}`}
          >
            <BrushTypes activeWidth={paintBrushWidth} activeShape={paintBrushShape} setBrushShapeSize={setBrushShapeSize} />
          </div>
          <div
            className={`${brushTypesClass} ${((activeTool === toolNames.ERASE) && showEraseBrushTypes) ? `${brushTypesShowClass}` : `${brushTypesHideClass}`} ${brushTypesEraseClass}`}
          >
            <BrushTypes activeWidth={eraseBrushWidth} activeShape={eraseBrushShape} setBrushShapeSize={setBrushShapeSize} />
            {(activeTool === toolNames.ERASE) && <button className={`${clearAllButtonClass}`} onClick={this.clearAllClickHandler}>CLEAR ALL</button>}
          </div>
        </div>
        <div className={`${toolbarToggleClass}`}>
          <button onClick={this.toggleButtonClickHandler} className={`${toolbarToggleButtonClass}`}>B</button>
        </div>
      </div>
    )
  }
}

export default PaintToolBar
