// @flow
import React, { PureComponent } from 'react'
import './ZoomTool.scss'
import throttle from 'lodash/throttle'

const baseClass = 'zoom-tool'
const wrapperClass = `${baseClass}__wrapper`
const zoomSliderClass = `${baseClass}__zoom-slider`
const zoomSliderCircleClass = `${baseClass}__zoom-slider-circle`

type ComponentProps = {
  applyZoom: Function,
}

type ComponentState = {
  leftPosition: number,
  isMouseDown: boolean
}
export class ZoomTool extends PureComponent<ComponentProps, ComponentState> {
  zoomSlider: RefObject
  zoomSliderCircle: RefObject
  zoomSliderCircleMouseX: number

  constructor (props: ComponentProps) {
    super(props)
    this.state = {
      leftPosition: 0,
      isMouseDown: false
    }
    this.zoomSlider = React.createRef()
    this.zoomSliderCircle = React.createRef()
    this.zoomSliderCircleMouseX = 0
    this.mouseDownHandler = this.mouseDownHandler.bind(this)
    this.dragStartHandler = this.dragStartHandler.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleDragStop = this.handleDragStop.bind(this)
  }

  /*:: mouseDownHandler: (e: Object) => void */
  mouseDownHandler (e: Object) {
    const sliderCircleClientOffset = this.zoomSliderCircle.current.getBoundingClientRect()
    this.zoomSliderCircleMouseX = e.clientX - sliderCircleClientOffset.left
    this.setState({ isMouseDown: true })
  }
  /*:: dragStartHandler: (e: Object) => void */
  dragStartHandler (e: Object) {
    e.stopPropagation()
    e.preventDefault()
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleDragStop)
  }
  /*:: handleMouseMove: (e: Object) => void */
  handleMouseMove (e: Object) {
    this.setLeftPosition(e)
  }

  setLeftPosition = throttle((e: Object) => {
    const { applyZoom } = this.props
    const mouseX = e.clientX - this.zoomSliderCircleMouseX
    const zoomSliderClientOffset = this.zoomSlider.current.getBoundingClientRect()
    const zoomSliderCircleClientOffset = this.zoomSliderCircle.current.getBoundingClientRect()
    const zoomSliderX = zoomSliderClientOffset.left
    const zoomSliderWidth = zoomSliderClientOffset.width
    const zoomSliderCircleWidth = zoomSliderCircleClientOffset.width
    const endPosition = zoomSliderWidth - zoomSliderCircleWidth
    const leftPosition = Math.max(0, Math.min(mouseX - zoomSliderX, endPosition))

    const zoomFactor = (leftPosition / endPosition) * 5 + 1
    if (zoomFactor > 0) applyZoom(zoomFactor)
    this.setState({
      leftPosition: leftPosition
    })
  }, 10)
  /*:: handleDragStop: (e: Object) => void */
  handleDragStop (e: Object) {
    this.setState({ isMouseDown: false })
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleDragStop)
  }

  render () {
    const { leftPosition } = this.state

    return (
      <div className={`${wrapperClass}`}>
        <span>ZOOM OUT</span>
        <div className={`${zoomSliderClass}`} ref={this.zoomSlider}>
          <div draggable role='presentation' ref={this.zoomSliderCircle} style={{ left: `${leftPosition}px` }} onMouseDown={this.mouseDownHandler} onDragStart={this.dragStartHandler} className={`${zoomSliderCircleClass}`} />
        </div>
        <span>ZOOM IN</span>
      </div>
    )
  }
}

export {
  wrapperClass, zoomSliderClass
}
export default ZoomTool
