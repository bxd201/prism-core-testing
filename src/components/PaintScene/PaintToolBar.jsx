// @flow
import React, { PureComponent } from 'react'
import './PaintToolBar.scss'
import { toolBarButtons } from './data'
import BrushTypes from './BrushTypes'

const baseClass = 'paint-tool-bar'
const wrapperClass = `${baseClass}__wrapper`
const containerClass = `${baseClass}__tools-container`
const containerHideClass = `${containerClass}--hide`
const toolbarButtonClass = `${baseClass}__toolbar-button`
const toolbarButtonActiveClass = `${toolbarButtonClass}--active`
const toolbarToggleClass = `${baseClass}__toolbar-toggle`
const toolbarToggleButtonClass = `${baseClass}__toolbar-toggle-button`
const brushTypesClass = `${baseClass}__brush-types`
const brushTypesShowClass = `${brushTypesClass}--show`
const brushTypesHideClass = `${brushTypesClass}--hide`
const brushTypesPaintClass = `${baseClass}__brush-types-paint`
const brushTypesEraseClass = `${baseClass}__brush-types-erase`
const clearAllButtonClass = `${baseClass}__clear-all`

const paintBrushTool = 'paintBrush'
const eraseTool = 'erase'

type ComponentProps = {
  activeTool: string,
  setActiveTool: Function,
  clearCanvas: Function,
  paintBrushShape: string,
  paintBrushWidth: number,
  eraseBrushShape: string,
  eraseBrushWidth: number,
  setBrushShapeSize: Function
}

type ComponentState = {
  showToolBar: boolean,
  showPaintBrushTypes: boolean,
  showEraseBrushTypes: boolean
}

export class PaintToolBar extends PureComponent<ComponentProps, ComponentState> {
  state = {
    showToolBar: true,
    showPaintBrushTypes: false,
    showEraseBrushTypes: false
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
    if (activeTool === paintBrushTool) {
      this.setState((prevState, props) => ({
        showPaintBrushTypes: !prevState.showPaintBrushTypes,
        showEraseBrushTypes: false
      }))
    }
    if (activeTool === eraseTool) {
      this.setState((prevState, props) => ({
        showEraseBrushTypes: !prevState.showEraseBrushTypes,
        showPaintBrushTypes: false
      }))
    }
    setActiveTool(toolName)
  }

  clearAllClickHandler = () => {
    const { clearCanvas } = this.props
    clearCanvas()
  }

  render () {
    const { showToolBar, showPaintBrushTypes, showEraseBrushTypes } = this.state
    const { activeTool, paintBrushShape, paintBrushWidth, eraseBrushShape, eraseBrushWidth, setBrushShapeSize } = this.props

    return (
      <div className={`${wrapperClass}`}>
        <div className={`${containerClass} ${(!showToolBar) ? `${containerHideClass}` : ``}`}>
          {
            toolBarButtons.map((tool: Object, index: number) => {
              return <button
                key={tool.id}
                name={tool.name}
                className={`${toolbarButtonClass} ${(activeTool === tool.name) ? `${toolbarButtonActiveClass}` : ``}`}
                onClick={(e) => this.buttonClickHandler(e, tool.name)}
              >
                {tool.id}
              </button>
            })
          }
          <div
            className={`${brushTypesClass} ${((activeTool === paintBrushTool) && showPaintBrushTypes) ? `${brushTypesShowClass}` : `${brushTypesHideClass}`} ${brushTypesPaintClass}`}
          >
            <BrushTypes activeWidth={paintBrushWidth} activeShape={paintBrushShape} setBrushShapeSize={setBrushShapeSize} />
          </div>
          <div
            className={`${brushTypesClass} ${((activeTool === eraseTool) && showEraseBrushTypes) ? `${brushTypesShowClass}` : `${brushTypesHideClass}`} ${brushTypesEraseClass}`}
          >
            <BrushTypes activeWidth={eraseBrushWidth} activeShape={eraseBrushShape} setBrushShapeSize={setBrushShapeSize} />
            {(activeTool === eraseTool) && <button className={`${clearAllButtonClass}`} onClick={this.clearAllClickHandler}>CLEAR ALL</button>}
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
