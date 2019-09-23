// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import './PaintScene.scss'
import includes from 'lodash/includes'
import PaintToolBar from './PaintToolBar'
import cloneDeep from 'lodash/cloneDeep'
import { drawAcrossLine } from './PaintSceneUtils'
import { getPaintAreaPath, repaintImageByPath,
  createPolygon, drawLine, drawCircle,
  edgeDetect, pointInsideCircle, alterRGBByPixel } from './utils'
import { toolNames } from './data'

const baseClass = 'paint__scene__wrapper'
const canvasClass = `${baseClass}__canvas`
const canvasFirstClass = `${baseClass}__canvas-first`
const canvasSecondClass = `${baseClass}__canvas-second`
const imageClass = `${baseClass}__image`
const paintToolsClass = `${baseClass}__paint-tools`
const paintBrushClass = `${baseClass}__paint-brush`
const paintBrushLargeClass = `${paintBrushClass}--large`
const paintBrushMediumClass = `${paintBrushClass}--medium`
const paintBrushSmallClass = `${paintBrushClass}--small`
const paintBrushTinyClass = `${paintBrushClass}--tiny`
const paintBrushLargeCircleClass = `${paintBrushClass}--large-circle`
const paintBrushMediumCircleClass = `${paintBrushClass}--medium-circle`
const paintBrushSmallCircleClass = `${paintBrushClass}--small-circle`
const paintBrushTinyCircleClass = `${paintBrushClass}--tiny-circle`

const brushLargeWidth = 38
const brushMediumWidth = 30
const brushSmallWidth = 22
const brushTinyWidth = 14

const brushRoundShape = 'round'
const brushSquareShape = 'square'
const defineArea = 'defineArea'
const selectArea = 'selectArea'
const paintAreaTool = 'paintArea'
const paintBrushTool = 'paintBrush'
const eraseTool = 'erase'

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
  drawCoordinates: Array<Object>,
  paintBrushShape: string,
  eraseBrushShape: string,
  eraseBrushWidth: number,
  drawHistory: Array<Array<Object>>,
  drawCoordinates: Array<Object>,
  pixelDataHistory: Array<Object>,
  pixelDataRedoHistory: Array<Object>,
  undoIsEnabled: boolean,
  redoIsEnabled: boolean

}

type DrawOperation = {
  colors: number[],
  data: number[],
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
    activeTool: paintAreaTool,
    position: { left: 0, top: 0 },
    paintBrushWidth: brushLargeWidth,
    isDragging: false,
    drawCoordinates: [],
    paintBrushShape: brushRoundShape,
    eraseBrushShape: brushRoundShape,
    eraseBrushWidth: brushLargeWidth,
    drawHistory: [],
    redoHistory: [],
    pixelDataHistory: [],
    pixelDataRedoHistory: [],
    undoIsEnabled: false,
    redoIsEnabled: false,
    lineStart: [],
    BeginPointList: [],
    polyList: [],
    imagePathList: [],
    selectAreaList: [],
    edgeList: [],
    isSelect: true
  }

  constructor (props: ComponentProps) {
    super(props)

    this.CFICanvas = React.createRef()
    this.CFICanvas2 = React.createRef()
    this.CFIWrapper = React.createRef()
    this.CFIImage = React.createRef()
    this.canvasOffsetWidth = 0
    this.canvasOffsetHeight = 0

    this.pushToHistory = this.pushToHistory.bind(this)
    this.popFromHistoryToRedoHistory = this.popFromHistoryToRedoHistory.bind(this)
    this.undo = this.undo.bind(this)
    this.redo = this.redo.bind(this)
    this.redrawFromOperation = this.redrawFromOperation.bind(this)
    this.getImageCoordinatesByPixel = this.getImageCoordinatesByPixel.bind(this)
    this.popFromRedoHistoryToHistory = this.popFromRedoHistoryToHistory.bind(this)
  }

  handleImageLoaded = () => {
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
    if (activeTool === this.state.activeTool) {
      return
    }
    this.setState({ activeTool })
  }

  // Should only be used to on user even to push
  /*:: pushToHistory: (redoOperation: Object) => void */
  pushToHistory (redoOperation: Object) {
    const shouldPushFlag = this.state.drawCoordinates.length > 0 || redoOperation
    const itemForHistory = redoOperation || this.getImageCoordinatesByPixel()
    const newPixelDataHistory = shouldPushFlag ? [...this.state.pixelDataHistory, itemForHistory] : this.state.pixelDataHistory

    let newState = {
      pixelDataHistory: newPixelDataHistory,
      pixelDataRedoHistory: [],
      undoIsEnabled: true,
      redoIsEnabled: false
    }

    this.setState(newState)
  }

  /*:: popFromRedoHistoryToHistory: (stateFragment: Object) => void */
  popFromRedoHistoryToHistory (stateFragment: Object) {
    if (this.state.pixelDataRedoHistory.length) {
      const operationToAddToHistory = this.state.pixelDataRedoHistory.slice(-1)[0]
      const newPixelDataRedoHistory = this.state.pixelDataRedoHistory.slice(0, this.state.pixelDataRedoHistory.length - 1)
      const newPixelDataHistory = this.state.pixelDataHistory.length ? [...this.state.pixelDataHistory, operationToAddToHistory] : [operationToAddToHistory]

      let newState = {
        pixelDataHistory: newPixelDataHistory,
        pixelDataRedoHistory: newPixelDataRedoHistory,
        undoIsEnabled: newPixelDataHistory.length > 0,
        redoIsEnabled: newPixelDataRedoHistory.length > 0
      }

      if (stateFragment) {
        newState = Object.assign(newState, stateFragment)
      }

      this.setState(newState)
    }
  }

  /*:: popFromHistoryToRedoHistory: (statefragment: Object) => void */
  popFromHistoryToRedoHistory (stateFragment: Object) {
    if (this.state.pixelDataHistory.length) {
      // Pixel redo
      const newPixelRedoHistory = this.state.pixelDataHistory.slice(-1)[0]
      const pixelDataHistory = this.state.pixelDataHistory.slice(0, this.state.pixelDataHistory.length - 1)
      const pixelDataRedoHistory = this.state.pixelDataRedoHistory.length ? [...this.state.pixelDataRedoHistory, newPixelRedoHistory] : [newPixelRedoHistory]

      let newState = {
        pixelDataHistory,
        pixelDataRedoHistory,
        drawCoordinates: [],
        undoIsEnabled: pixelDataHistory.length > 0,
        redoIsEnabled: pixelDataRedoHistory.length > 0
      }

      if (stateFragment) {
        newState = Object.assign(newState, stateFragment)
      }

      this.setState(newState)
    }
  }

  // @todo set activetool based on action
  /*:: undo: () => void */
  undo () {
    // @todo finish implementation
    const stateFragment = { activeTool: toolNames.UNDO }
    if (this.state.pixelDataHistory.length > 1) {
      const redrawOperation = this.state.pixelDataHistory.slice(-2, -1)[0]
      this.redrawFromOperation(redrawOperation)
      this.popFromHistoryToRedoHistory(stateFragment)
    } else if (this.state.pixelDataHistory.length === 1) {
      this.clearCanvas()
      this.popFromHistoryToRedoHistory(stateFragment)
    }
  }

  /*:: redo: () => void */
  redo () {
    // @todo finish implementation...add back to undo stack and what ever else...handle multiple redo operatiosn belwo only covers a single redo cycle
    if (this.state.pixelDataRedoHistory.length) {
      const redoOperation = this.state.pixelDataRedoHistory.slice(-1)[0]
      this.redrawFromOperation(redoOperation)
      this.popFromRedoHistoryToHistory({ activeTool: toolNames.REDO })
    }
  }

  /*:: redrawFromOperation: (historicOperation: DrawOperation) => void */
  redrawFromOperation (historicOperation: DrawOperation) {
    // @todo finish implementation
    // Clear canvas and draw from history sequences
    this.clearCanvas()
  }

  /*:: getImageCoordinatesByPixel: () => DrawOperation */
  getImageCoordinatesByPixel (): DrawOperation {
    // @todo implement,  this will wrap @jialai's lib
    const operation = {
      colors: [],
      data: []
    }

    return operation
  }

  mouseMoveHandler = (e: Object) => {
    e.stopPropagation()
    const { clientX, clientY } = e
    const { activeTool, paintBrushWidth, isDragging, drawCoordinates, eraseBrushWidth } = this.state
    const canvasOffset = this.getCanvasOffset()

    if (activeTool === paintBrushTool || activeTool === eraseTool) {
      const paintBrushHalfWidth = (activeTool === paintBrushTool) ? paintBrushWidth / 2 : eraseBrushWidth / 2
      const leftOffset = clientX - canvasOffset.x - paintBrushHalfWidth
      const topOffset = clientY - canvasOffset.y - paintBrushHalfWidth
      const position = { left: leftOffset, top: topOffset }
      this.setState({ position })

      if (isDragging) {
        const currentPoint = { x: clientX - canvasOffset.x, y: clientY - canvasOffset.y }
        const drawCoordinatesCloned = cloneDeep(drawCoordinates)
        drawCoordinatesCloned.push(currentPoint)
        const drawCoordinatesLength = drawCoordinates.length
        this.drawPaintBrushPoint(currentPoint, drawCoordinates[drawCoordinatesLength - 1])
        this.setState({ drawCoordinates: drawCoordinatesCloned })
      }
    }
  }

  mouseDownHandler = (e: Object) => {
    const { isDragging } = this.state
    const { clientX, clientY } = e
    const canvasOffset = this.getCanvasOffset()
    const drawCoordinates = []
    const currentPoint = { x: clientX - canvasOffset.x, y: clientY - canvasOffset.y }
    drawCoordinates.push(currentPoint)
    if (isDragging === false) {
      this.drawPaintBrushPoint(currentPoint)
    }
    this.setState({ drawCoordinates })
  }

  dragStartHandler = (e: Object) => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({ isDragging: true })
  }

  mouseUpHandler = (e: Object) => {
    const { drawCoordinates, paintBrushShape, paintBrushWidth, imagePathList, activeTool } = this.state
    if (activeTool === paintBrushTool && drawCoordinates.length > 1) {
      this.clearCanvas()
      this.repaintBrushPathByCorrdinates(drawCoordinates, paintBrushWidth, paintBrushShape)
      const newImagePathList = getPaintAreaPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.lpActiveColor)
      const newSelectAreaList = new Array(newImagePathList.length).fill(false)
      this.clearCanvas()
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.setState({ isDragging: false,
        imagePathList: newImagePathList,
        selectAreaList: newSelectAreaList
      })
      this.pushToHistory()
    }
  }

  repaintBrushPathByCorrdinates = (drawCoordinates, paintBrushWidth, paintBrushShape) => {
    for (let i = 1; i < drawCoordinates.length; i++) {
      this.drawPaintBrushPath(this.CFICanvasContext2, drawCoordinates[i], drawCoordinates[i - 1], paintBrushWidth, paintBrushShape, 'source-over')
    }
  }

  drawPaintBrushPoint = (point: Object, lastPoint: Object) => {
    const { paintBrushWidth, activeTool, eraseBrushWidth, paintBrushShape, eraseBrushShape } = this.state
    const previousPoint = lastPoint || point

    if (activeTool === eraseTool) {
      this.drawPaintBrushPath(this.CFICanvasContext2, point, previousPoint, eraseBrushWidth, eraseBrushShape, 'destination-out')
    } else {
      this.drawPaintBrushPath(this.CFICanvasContext2, point, previousPoint, paintBrushWidth, paintBrushShape, 'source-over')
    }
  }

  drawPaintBrushPath = (context: Object, to: Object, from: Object, width: number, brushShape: string, operation: string) => {
    const { lpActiveColor } = this.props
    const { activeTool } = this.state
    const lpActiveColorRGB = `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    context.globalCompositeOperation = operation
    context.fillStyle = (activeTool === eraseTool) ? `rgba(255, 255, 255, 1)` : lpActiveColorRGB
    const radius = Math.round(0.5 * width)

    this.CFICanvasContext2.beginPath()
    drawAcrossLine(this.CFICanvasContext2, to, from, (ctx, x, y) => {
      if (brushShape === brushSquareShape) {
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
    if (activeTool === paintBrushTool) {
      this.setState({
        paintBrushShape: brushShape,
        paintBrushWidth: brushWidth
      })
    } else if (activeTool === eraseTool) {
      this.setState({
        eraseBrushShape: brushShape,
        eraseBrushWidth: brushWidth
      })
    }
  }

  handleSelectArea = (e) => {
    /** This method is for user select or unselect specific area and highlight or dehighlight the paint area border
     * The main idea is maintain edgeList and selectAreaList, whenever user click area, we repaint canvas based on update
     * edgeList and imagePathList
     * selectAreaList is the list contains current paint area select info. it would be initial when new paint area created
     * By default all paint area select state would be false
    */
    const { imagePathList, selectAreaList, edgeList } = this.state
    let targetEdgeDetect = []
    let targetColor = []
    const selectAreaMap = {}
    const cursorX = e.nativeEvent.offsetX
    const cursorY = e.nativeEvent.offsetY
    const index = (cursorX + cursorY * this.canvasOffsetWidth) * 4

    /** collect click info */
    for (let i = 0; i < imagePathList.length; i++) {
      if (imagePathList[i].data.includes(index)) {
        targetEdgeDetect = [...imagePathList[i].data]
        targetColor = [...imagePathList[i].color]
        const updateList = [...selectAreaList]
        updateList[i] = !updateList[i]
        const key = targetEdgeDetect[0].toString() + 'id'
        selectAreaMap[key] = updateList[i]
        this.setState({ selectAreaList: updateList })
        break
      }
    }
    /** if user click corrdinate (x,y) is inside any of paint area */
    if (targetEdgeDetect.length > 0) {
      /** Because of image bit8 index is unique of paint canvas, so we can create a unique ID for build hashmap
       * we can use pixel index as key to build hashMap between edge path and pixel index */
      const matchId = targetEdgeDetect[0].toString() + 'id'
      /** add edge border of specific paint area when select state is true */
      if (selectAreaMap[matchId]) {
        const edgeMap = {}
        const edge = edgeDetect(this.CFICanvas2, targetEdgeDetect, targetColor, this.canvasOffsetWidth, this.canvasOffsetWidth)
        edgeMap[matchId] = edge
        edgeList.push(edgeMap)
        this.setState({ edgeList: edgeList })
      } else {
        /** update edgeList when select state is false to repaint whole canvas */
        let copyEdgeList = cloneDeep(edgeList)
        for (let i = 0; i < copyEdgeList.length; i++) {
          const selectId = Object.keys(copyEdgeList[i])[0]
          if (selectId === matchId) {
            copyEdgeList.splice(i, 1)
          }
        }
        let edgeListToRender = []
        for (let value of copyEdgeList) {
          const data = Object.keys(value).map((key) => value[key])
          edgeListToRender.push({
            color: [255, 255, 255, 255],
            data: data[0]
          })
        }
        this.setState({ edgeList: copyEdgeList })
        this.clearCanvas()
        repaintImageByPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
        if (edgeListToRender.length > 0) {
          repaintImageByPath(edgeListToRender, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
        }
      }
    }
  }

  handleDefineArea = (e) => {
    const ctx = this.CFICanvas2.current
    const cursorX = e.nativeEvent.offsetX
    const cursorY = e.nativeEvent.offsetY
    if (!ctx.getContext) return
    let ctxDraw = ctx.getContext('2d')
    const { BeginPointList, polyList, lineStart, imagePathList } = this.state
    let isBackToStart = false
    if (BeginPointList.length > 0) {
      isBackToStart = pointInsideCircle(cursorX, cursorY, BeginPointList, 10)
    }
    if (isBackToStart) {
      this.clearCanvas()
      createPolygon(polyList, ctxDraw, this.props.lpActiveColor.hex)
      const newImagePathList = getPaintAreaPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.lpActiveColor)
      const newSelectAreaList = new Array(newImagePathList.length).fill(false)
      this.clearCanvas()
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)

      this.setState(
        {
          polyList: [],
          lineStart: [],
          BeginPointList: [],
          imagePathList: newImagePathList,
          selectAreaList: newSelectAreaList
        }
      )
      return
    } else {
      drawCircle(ctxDraw, cursorX, cursorY)
      // toDo: Animation of StartPoint
      if (lineStart.length > 0) {
        ctxDraw.beginPath()
        const end = [cursorX, cursorY]
        drawLine(ctxDraw, lineStart, end, true)
      } else {
        this.setState({ BeginPointList: [cursorX, cursorY] })
      }
      ctxDraw.restore()
    }
    const poly = [...polyList]
    poly.push([cursorX, cursorY])
    this.setState({ lineStart: [cursorX, cursorY], polyList: poly })
  }

  defineArea = () => {
    this.setState({ edgeList: [] })
  }

  save = () => {
    /** This function will create mask */
    let destinationCanvas = document.createElement('canvas')
    destinationCanvas.width = this.canvasOffsetWidth
    destinationCanvas.height = this.canvasOffsetHeight

    let destCtx = destinationCanvas.getContext('2d')
    /** create a rectangle with the desired color */
    destCtx.fillStyle = '#000'
    destCtx.fillRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    /** draw the original canvas onto the destination canvas */
    alterRGBByPixel(this.CFICanvas2, [255, 255, 255], this.canvasOffsetWidth, this.canvasOffsetHeight)
    destCtx.drawImage(this.CFICanvas2.current, 0, 0)
    alterRGBByPixel(this.CFICanvas2, [255, 255, 0], this.canvasOffsetWidth, this.canvasOffsetHeight)
    return destinationCanvas.toDataURL()
  }

  handleClick = (e: Object) => {
    const { activeTool } = this.state
    switch (activeTool) {
      case defineArea:
        this.handleDefineArea(e)
        break
      case selectArea:
        this.handleSelectArea(e)
        break
    }
  }

  render () {
    const { imageUrl, lpActiveColor } = this.props
    const { activeTool, position, paintBrushShape, paintBrushWidth, eraseBrushShape, eraseBrushWidth, undoIsEnabled, redoIsEnabled } = this.state
    const lpActiveColorRGB = `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    const backgroundColorBrush = (activeTool === eraseTool) ? `rgba(255, 255, 255, 0.7)` : lpActiveColorRGB
    let paintBrushActiveClass = ''
    let paintBrushCircleActiveClass = ''
    let eraseBrushActiveClass = ''
    let eraseBrushCircleActiveClass = ''

    if (paintBrushWidth === brushLargeWidth) {
      paintBrushActiveClass = paintBrushLargeClass
      if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushLargeCircleClass
    } else if (paintBrushWidth === brushMediumWidth) {
      paintBrushActiveClass = paintBrushMediumClass
      if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushMediumCircleClass
    } else if (paintBrushWidth === brushSmallWidth) {
      paintBrushActiveClass = paintBrushSmallClass
      if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushSmallCircleClass
    } else if (paintBrushWidth === brushTinyWidth) {
      paintBrushActiveClass = paintBrushTinyClass
      if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushTinyCircleClass
    }

    if (eraseBrushWidth === brushLargeWidth) {
      eraseBrushActiveClass = paintBrushLargeClass
      if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushLargeCircleClass
    } else if (eraseBrushWidth === brushMediumWidth) {
      eraseBrushActiveClass = paintBrushMediumClass
      if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushMediumCircleClass
    } else if (eraseBrushWidth === brushSmallWidth) {
      eraseBrushActiveClass = paintBrushSmallClass
      if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushSmallCircleClass
    } else if (eraseBrushWidth === brushTinyWidth) {
      eraseBrushActiveClass = paintBrushTinyClass
      if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushTinyCircleClass
    }

    return (
      <div role='presentation' className={`${baseClass}`} onClick={this.handleClick} onMouseMove={this.mouseMoveHandler} ref={this.CFIWrapper}>
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
            performRedo={this.redo}
            performUndo={this.undo}
            undoIsEnabled={undoIsEnabled}
            redoIsEnabled={redoIsEnabled}
            defineArea={this.defineArea}
            selectArea={this.selectArea}
          />
        </div>
        {
          ((activeTool === paintBrushTool || activeTool === eraseTool) && (position.left > 0 || position.top > 0))
            ? <div
              className={`${paintBrushClass} ${activeTool === paintBrushTool ? `${paintBrushActiveClass} ${paintBrushCircleActiveClass}` : activeTool === eraseTool ? `${eraseBrushActiveClass} ${eraseBrushCircleActiveClass}` : ``}`}
              role='presentation'
              draggable
              onMouseUp={this.mouseUpHandler} onMouseDown={this.mouseDownHandler} onDragStart={this.dragStartHandler}
              style={{ backgroundColor: backgroundColorBrush, top: position.top, left: position.left }}
            /> : ''
        }
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
