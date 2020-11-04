// @flow
import React, { PureComponent } from 'react'
import './ZoomTool.scss'
import throttle from 'lodash/throttle'
import { FormattedMessage } from 'react-intl'
const baseClass = 'zoom-tool'
const wrapperClass = `${baseClass}__wrapper`
const zoomSliderClass = `${baseClass}__zoom-slider`
const zoomSliderCircleClass = `${baseClass}__zoom-slider-circle`

type ComponentProps = {
  applyZoom: Function,
  containerWidth: number,
  zoomValue: number
}

type ComponentState = {
  leftPosition: number,
  isMouseDown: boolean
}

const getNormalizedValue = (value: number, min: number, max: number) => (value - min) / (max - min)

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
    this.calculatePos = this.calculatePos.bind(this)
  }

  componentDidUpdate () {
    const { width: sliderWidth } = this.zoomSlider.current.getBoundingClientRect()
    const { width: circleWidth } = this.zoomSliderCircle.current.getBoundingClientRect()
    const normalizedZoom = getNormalizedValue(this.props.zoomValue, 1, 6)

    if (sliderWidth !== this.state.sliderWidth) {
      let leftPosition = (normalizedZoom * sliderWidth)
      if (normalizedZoom === 1) {
        leftPosition -= circleWidth // The circle width should approx the slider padding
      }
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        leftPosition,
        sliderWidth
      })
    }
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

  calculatePos (clientX?: number, zoomSlider: Ref) {
    // @todo need to add a mode that calculates based on zoom and width ignoring clientx for resize
    const mouseX = clientX - this.zoomSliderCircleMouseX
    const zoomSliderClientOffset = zoomSlider.current.getBoundingClientRect()
    const zoomSliderCircleClientOffset = this.zoomSliderCircle.current.getBoundingClientRect()
    const zoomSliderX = zoomSliderClientOffset.left
    const zoomSliderWidth = zoomSliderClientOffset.width
    const zoomSliderCircleWidth = zoomSliderCircleClientOffset.width
    const endPosition = zoomSliderWidth - zoomSliderCircleWidth
    const leftPosition = Math.max(0, Math.min(mouseX - zoomSliderX, endPosition))

    return {
      leftPosition,
      endPosition,
      sliderWidth: zoomSliderWidth
    }
  }

  /*:: handleMouseMove: (e: Object) => void */
  handleMouseMove (e: Object) {
    this.setLeftPosition(e.clientX, this)
  }

  setLeftPosition = throttle((clientX: number) => {
    const { applyZoom, containerWidth } = this.props
    const { leftPosition, endPosition, sliderWidth } = this.calculatePos(clientX, this.zoomSlider)

    const zoomFactor = (leftPosition / endPosition) * 5 + 1
    if (zoomFactor > 0) {
      applyZoom(zoomFactor, containerWidth)
    }
    this.setState({
      leftPosition,
      clientX,
      sliderWidth
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
        <span><FormattedMessage id='ZOOM_OUT' /></span>
        <div aria-label='zoom slider' className={`${zoomSliderClass}`} ref={this.zoomSlider}>
          <div draggable role='presentation' ref={this.zoomSliderCircle} style={{ left: `${leftPosition}px` }} onMouseDown={this.mouseDownHandler} onDragStart={this.dragStartHandler} className={`${zoomSliderCircleClass}`} />
        </div>
        <span><FormattedMessage id='ZOOM_IN' /></span>
      </div>
    )
  }
}

export {
  wrapperClass, zoomSliderClass
}
export default ZoomTool
