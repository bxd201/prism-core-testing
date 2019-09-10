// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import './PaintScene.scss'
import includes from 'lodash/includes'
import PaintToolBar from './PaintToolBar'
import cloneDeep from 'lodash/cloneDeep'
import { drawAcrossLine } from './PaintSceneUtils'

const baseClass = 'paint__scene__wrapper'
const canvasClass = `${baseClass}__canvas`
const canvasFirstClass = `${baseClass}__canvas-first`
const canvasSecondClass = `${baseClass}__canvas-second`
const imageClass = `${baseClass}__image`
const paintToolsClass = `${baseClass}__paint-tools`
const paintBrushClass = `${baseClass}__paint-brush`
const paintBrushCircleClass = `${paintBrushClass}--circle`
const paintBrushSquareClass = `${paintBrushClass}--square`

type ComponentProps = {
  imageUrl: string,
  imageRotationAngle: number,
  lpActiveColor: Object
}

type ComponentState = {
  imageStatus: string,
  activeTool: string,
  position: Object,
  paintBrushWidth: number,
  isDragging: boolean,
  paintBrushPathCoordinates: Array<Object>,
  paintBrushShape: string,
  paintedRegions: Array<Object>,
  eraseBrushShape: string,
  eraseBrushWidth: number
}

export class PaintScene extends PureComponent<ComponentProps, ComponentState> {
  canvasOffset: any
  imageDataData: any
  CFICanvasContext: any
  CFICanvasContext2: any
  canvasOffsetWidth: number
  canvasOffsetHeight: number
  canvasClientX: number
  canvasClientY: number
  CFICanvas: RefObject
  CFICanvas2: RefObject
  CFIWrapper: RefObject
  CFIImage: RefObject

  state = {
    imageStatus: 'loading',
    activeTool: 'paintArea',
    position: { left: 0, top: 0 },
    paintBrushWidth: 38,
    isDragging: false,
    paintBrushPathCoordinates: [],
    paintBrushShape: 'round',
    paintedRegions: [],
    eraseBrushShape: 'round',
    eraseBrushWidth: 38
  }

  constructor (props: ComponentProps) {
    super(props)
    this.CFICanvas = React.createRef()
    this.CFICanvas2 = React.createRef()
    this.CFIWrapper = React.createRef()
    this.CFIImage = React.createRef()
    this.canvasOffsetWidth = 0
    this.canvasOffsetHeight = 0
  }

  handleImageLoaded =() => {
    this.initCanvas()
  }

  handleImageErrored = () => {
    this.setState({ imageStatus: 'failed' })
  }

  setCanvasOffset = () => {
    let canvasOffset = {}
    if (this.CFICanvas.current) {
      const canvasClientOffset = this.CFICanvas.current.getBoundingClientRect()
      canvasOffset.x = parseInt(canvasClientOffset.left, 10)
      canvasOffset.y = parseInt(canvasClientOffset.top, 10)
      window.sessionStorage.setItem('canvasOffsetPaintScene', JSON.stringify(canvasOffset))
    }
  }

  getCanvasOffset = () => {
    const canvasOffset = window.sessionStorage.getItem('canvasOffsetPaintScene')
    return JSON.parse(canvasOffset)
  }

  componentDidMount () {
    this.updateWindowDimensions()
    window.addEventListener('resize', this.updateWindowDimensions)
    window.addEventListener('scroll', this.setCanvasOffset)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateWindowDimensions)
    window.removeEventListener('scroll', this.setCanvasOffset)
  }

  updateWindowDimensions = () => {
    this.setCanvasOffset()
    this.canvasOffset = this.CFICanvas.current.getBoundingClientRect()
    this.canvasOffsetWidth = parseInt(this.canvasOffset.width, 10)
    this.canvasOffsetHeight = parseInt(this.canvasOffset.height, 10)
    this.canvasClientX = parseInt(this.canvasOffset.left, 10)
    this.canvasClientY = parseInt(this.canvasOffset.top, 10)
  };

  initCanvas = () => {
    this.setCanvasOffset()
    this.CFICanvasContext = this.CFICanvas.current.getContext('2d')
    this.CFICanvasContext2 = this.CFICanvas2.current.getContext('2d')
    this.canvasOffset = this.CFICanvas.current.getBoundingClientRect()
    this.canvasOffsetWidth = parseInt(this.canvasOffset.width, 10)
    this.canvasOffsetHeight = parseInt(this.canvasOffset.height, 10)
    this.CFICanvas.current.height = this.canvasOffsetHeight
    this.CFICanvas.current.width = this.canvasOffsetWidth
    this.CFICanvas2.current.height = this.canvasOffsetHeight
    this.CFICanvas2.current.width = this.canvasOffsetWidth
    const { imageRotationAngle } = this.props
    if (imageRotationAngle) {
      this.CFICanvasContext.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.CFICanvasContext.save()
      this.CFICanvasContext.translate(this.canvasOffsetWidth / 2, this.canvasOffsetHeight / 2)
      this.CFICanvasContext.rotate(imageRotationAngle * Math.PI / 180)
      if (includes([90, -90, 270, -270], imageRotationAngle)) {
        this.CFICanvasContext.drawImage(this.CFIImage.current, -this.canvasOffsetWidth / 2, -this.canvasOffsetHeight, this.canvasOffsetWidth, this.canvasOffsetHeight * 2)
      } else {
        this.CFICanvasContext.drawImage(this.CFIImage.current, -this.canvasOffsetWidth / 2, -this.canvasOffsetHeight / 2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      }
      this.CFICanvasContext.restore()
    } else {
      this.CFICanvasContext.drawImage(this.CFIImage.current, 0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.CFICanvasContext2.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.CFICanvasContext2.drawImage(this.CFIImage.current, 0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    }
    const imageData = this.CFICanvasContext.getImageData(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    this.imageDataData = imageData.data
  }

  setActiveTool = (activeTool: string) => {
    this.setState({
      activeTool
    })
  }

  mouseMoveHandler = (e: Object) => {
    e.stopPropagation()
    const { clientX, clientY } = e
    const { activeTool, paintBrushWidth, isDragging, paintBrushPathCoordinates } = this.state
    const canvasOffset = this.getCanvasOffset()

    if (activeTool === 'paintBrush' || activeTool === 'erase') {
      const paintBrushCircleHalfWidth = paintBrushWidth / 2
      const leftOffset = clientX - canvasOffset.x - paintBrushCircleHalfWidth
      const topOffset = clientY - canvasOffset.y - paintBrushCircleHalfWidth
      const position = { left: leftOffset, top: topOffset }
      this.setState({ position })

      if (isDragging) {
        const currentPoint = { x: clientX - canvasOffset.x, y: clientY - canvasOffset.y }
        const paintBrushPathCoordinatesCloned = cloneDeep(paintBrushPathCoordinates)
        paintBrushPathCoordinatesCloned.push(currentPoint)
        const paintBrushPathCoordinatesLength = paintBrushPathCoordinates.length
        this.drawPaintBrushPoint(currentPoint, paintBrushPathCoordinates[paintBrushPathCoordinatesLength - 1])
        this.setState({ paintBrushPathCoordinates: paintBrushPathCoordinatesCloned })
      }
    }
  }

  mouseDownHandler = (e: Object) => {
    const { isDragging } = this.state
    const { clientX, clientY } = e
    const canvasOffset = this.getCanvasOffset()
    const paintBrushPathCoordinates = []
    const currentPoint = { x: clientX - canvasOffset.x, y: clientY - canvasOffset.y }
    paintBrushPathCoordinates.push(currentPoint)
    if (isDragging === false) {
      this.drawPaintBrushPoint(currentPoint)
    }
    this.setState({ paintBrushPathCoordinates })
  }

  dragStartHandler = (e: Object) => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({ isDragging: true })
  }

  mouseUpHandler = (e: Object) => {
    e.stopPropagation()
    const { clientX, clientY } = e
    const canvasOffset = this.getCanvasOffset()
    const { isDragging, paintBrushWidth, paintedRegions, paintBrushPathCoordinates } = this.state

    if (isDragging) {
      this.setState({ isDragging: false })
    } else {
      const paintBrushCircleHalfWidth = paintBrushWidth / 2
      const leftOffset = clientX - canvasOffset.x - paintBrushCircleHalfWidth
      const topOffset = clientY - canvasOffset.y - paintBrushCircleHalfWidth
      const position = { left: leftOffset, top: topOffset }
      this.setState({ position })
    }
    const paintedRegionsCloned = cloneDeep(paintedRegions)
    paintedRegionsCloned.push(paintBrushPathCoordinates)
    this.setState({
      paintBrushPathCoordinates: [],
      paintedRegions: paintedRegionsCloned
    })
  }

  drawPaintBrushPoint = (point: Object, lastPoint: Object) => {
    const { paintBrushWidth, activeTool } = this.state
    const previousPoint = lastPoint || point

    if (activeTool === 'erase') {
      this.drawPaintBrushPath(this.CFICanvasContext2, point, previousPoint, paintBrushWidth, 'destination-out')
    } else {
      this.drawPaintBrushPath(this.CFICanvasContext2, point, previousPoint, paintBrushWidth, 'source-over')
    }
  }

  drawPaintBrushPath = (context: Object, to: Object, from: Object, width: number, operation: string) => {
    const { lpActiveColor } = this.props
    const { paintBrushShape, activeTool } = this.state
    const lpActiveColorRGB = `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    context.globalCompositeOperation = operation
    context.fillStyle = (activeTool === 'erase') ? `rgba(255, 255, 255, 1)` : lpActiveColorRGB
    const radius = Math.round(0.5 * width)

    this.CFICanvasContext2.beginPath()
    drawAcrossLine(this.CFICanvasContext2, to, from, (ctx, x, y) => {
      if (paintBrushShape === 'square') {
        ctx.rect(x - radius, y - radius, width, width)
      } else {
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
      }
    })
    this.CFICanvasContext2.fill()
  }

  clearCanvas = () => {
    this.CFICanvasContext2.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
  }

  setBrushShapeSize = (brushShape: string, brushWidth: number) => {
    const { activeTool } = this.state
    if (activeTool === 'paintBrush') {
      this.setState({
        paintBrushShape: brushShape,
        paintBrushWidth: brushWidth
      })
    } else if (activeTool === 'erase') {
      this.setState({
        eraseBrushShape: brushShape,
        eraseBrushWidth: brushWidth
      })
    }
  }

  render () {
    const { imageUrl, lpActiveColor } = this.props
    const { activeTool, position, paintBrushShape, paintBrushWidth, eraseBrushShape, eraseBrushWidth } = this.state
    const lpActiveColorRGB = `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    const backgroundColorBrush = (activeTool === 'erase') ? `rgba(255, 255, 255, 0.7)` : lpActiveColorRGB

    return (
      <div role='presentation' className={`${baseClass}`} onMouseMove={this.mouseMoveHandler} ref={this.CFIWrapper}>
        <canvas className={`${canvasClass} ${canvasFirstClass}`} name='paint-scene-canvas-first' ref={this.CFICanvas} />
        <canvas style={{ opacity: 0.8 }} className={`${canvasClass} ${canvasSecondClass}`} name='paint-scene-canvas-second' ref={this.CFICanvas2} />
        <img className={`${imageClass}`} ref={this.CFIImage} onLoad={this.handleImageLoaded} onError={this.handleImageErrored} src={imageUrl} alt='' />
        <div className={`${paintToolsClass}`}>
          <PaintToolBar
            activeTool={activeTool}
            setActiveTool={this.setActiveTool}
            clearCanvas={this.clearCanvas}
            paintBrushShape={paintBrushShape}
            paintBrushWidth={paintBrushWidth}
            eraseBrushShape={eraseBrushShape}
            eraseBrushWidth={eraseBrushWidth}
            setBrushShapeSize={this.setBrushShapeSize}
          />
        </div>
        {((activeTool === 'paintBrush' || activeTool === 'erase') && (position.left > 0 || position.top > 0)) ? <div className={`${paintBrushClass} ${(paintBrushShape === 'square') ? paintBrushSquareClass : paintBrushCircleClass}`}
          role='presentation'
          draggable
          onMouseUp={this.mouseUpHandler} onMouseDown={this.mouseDownHandler} onDragStart={this.dragStartHandler}
          style={{
            backgroundColor: backgroundColorBrush,
            top: position.top,
            left: position.left
          }} /> : ''}
      </div>
    )
  }
}

const mapStateToProps = (state: Object, props: Object) => {
  const { lp } = state
  return {
    lpActiveColor: lp.activeColor
  }
}

export default connect(mapStateToProps, null)(PaintScene)
