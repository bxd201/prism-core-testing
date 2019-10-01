// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import './PaintScene.scss'
import PaintToolBar from './PaintToolBar'
import cloneDeep from 'lodash/cloneDeep'
import { drawAcrossLine } from './PaintSceneUtils'
import { getPaintAreaPath, repaintImageByPath,
  createPolygon, drawLine, drawCircle,
  edgeDetect, pointInsideCircle, alterRGBByPixel,
  getImageCordinateByPixel, eraseIntersection,
  getActiveColorRGB, getSelectArea, hexToRGB } from './utils'
import { toolNames } from './data'
import ResizeObserver from 'resize-observer-polyfill'
import { getScaledSide } from '../../shared/helpers/ImageUtils'

const baseClass = 'paint__scene__wrapper'
const canvasClass = `${baseClass}__canvas`
const canvasFirstClass = `${baseClass}__canvas-first`
const canvasSecondClass = `${baseClass}__canvas-second`
const portraitOrientation = `${canvasClass}--portrait`
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
const paintArea = 'paintArea'
const removeArea = 'removeArea'

type ComponentProps = {
  imageUrl: string,
  // eslint-disable-next-line react/no-unused-prop-types
  imageRotationAngle: number,
  lpActiveColor: Object,
  referenceDimensions: Object
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
  redoIsEnabled: boolean,
  wrapperHeight: number
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
  wrapperDimensions: Object | null
  canvasDimensions: Object | null
  backgroundImageWidth: number
  backgroundImageHeight: number
  isPortrait: boolean
  resizeObserver: Object

  constructor (props: ComponentProps) {
    super(props)

    this.CFICanvas = React.createRef()
    this.CFICanvas2 = React.createRef()
    this.CFIWrapper = React.createRef()
    this.CFIImage = React.createRef()
    // @todo - marked for review -RS
    // this.canvasOffsetWidth = 0
    // this.canvasOffsetHeight = 0
    this.resizeObserver = null
    this.wrapperDimensions = null
    this.canvasDimensions = null
    this.backgroundImageWidth = props.referenceDimensions.imageWidth
    this.backgroundImageHeight = props.referenceDimensions.imageHeight
    this.isPortrait = props.referenceDimensions.isPortrait

    this.state = {
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
      selectedArea: [{ edgeList: [], selectPath: [] }]
      edgeList: [],
      isSelect: true,
      wrapperHeight: this.props.referenceDimensions.imageHeight
    }

    this.pushToHistory = this.pushToHistory.bind(this)
    this.popFromHistoryToRedoHistory = this.popFromHistoryToRedoHistory.bind(this)
    this.undo = this.undo.bind(this)
    this.redo = this.redo.bind(this)
    this.redrawFromOperation = this.redrawFromOperation.bind(this)
    this.getImageCoordinatesByPixel = this.getImageCoordinatesByPixel.bind(this)
    this.popFromRedoHistoryToHistory = this.popFromRedoHistoryToHistory.bind(this)
    this.initCanvas = this.initCanvas.bind(this)
    this.updateCanvasWithNewDimensions = this.updateCanvasWithNewDimensions.bind(this)
  }
  /*:: initCanvas: () => void */
  initCanvas () {
    this.CFICanvasContext = this.CFICanvas.current.getContext('2d')
    this.CFICanvasContext2 = this.CFICanvas2.current.getContext('2d')
    this.canvasOffsetWidth = parseInt(this.wrapperDimensions.width, 10)
    this.canvasOffsetHeight = parseInt(this.wrapperDimensions.height, 10)

    this.updateCanvasWithNewDimensions()
  }

  /*:: updateCanvasWithNewDimensions: () => void */
  updateCanvasWithNewDimensions () {
    let canvasWidth = 0

    if (this.isPortrait) {
      canvasWidth = this.wrapperDimensions.width / 2
    } else {
      // Landscape
      canvasWidth = this.wrapperDimensions.width
    }

    canvasWidth = Math.floor(canvasWidth)

    const canvasHeight = Math.floor(getScaledSide(this.backgroundImageWidth, this.backgroundImageHeight)(canvasWidth))

    this.CFICanvas.current.width = canvasWidth
    this.CFICanvas.current.height = canvasHeight
    this.CFICanvas2.current.width = canvasWidth
    this.CFICanvas2.current.height = canvasHeight

    this.setBackgroundImage(canvasWidth, canvasHeight)
  }

  /*:: setBackgroundImage: (canvasWidth: number, canvasHeight: number) => void */
  setBackgroundImage (canvasWidth, canvasHeight) {
    this.CFICanvasContext.drawImage(this.CFIImage.current, 0, 0, canvasWidth, canvasHeight)
    this.CFICanvasContext2.clearRect(0, 0, canvasWidth, canvasHeight)
    this.CFICanvasContext2.drawImage(this.CFIImage.current, 0, 0, canvasWidth, canvasHeight)

    this.setState({ wrapperHeight: canvasHeight })
  }

  /*:: setDependentPositions() => void */
  setDependentPositions () {
    // These are used by the drawing cursor to paint the canvas
    this.canvasDimensions = this.CFICanvas.current.getBoundingClientRect()
    this.wrapperDimensions = this.CFIWrapper.current.getBoundingClientRect()
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

  // @todo - We will need to redo the calculations using the offset caused by the margin added to the canvas when isPortrait -RS
  getCanvasOffset = () => {
    const canvasOffset = window.sessionStorage.getItem('canvasOffsetPaintScene')
    return JSON.parse(canvasOffset)
  }

  componentDidMount () {
    this.updateWindowDimensions()
    // @todo Review -RS
    // window.addEventListener('resize', this.updateWindowDimensions)
    // window.addEventListener('scroll', this.setCanvasOffset)
    this.resizeObserver = new ResizeObserver((entries, observer) => {
      if (entries.length) {
        this.setDependentPositions()
        this.updateCanvasWithNewDimensions()
      } else {
        console.log('Scene Container does not exist.')
      }
      console.log(entries, observer)
    })

    this.resizeObserver.observe(this.CFIWrapper.current)
    this.setDependentPositions()
    this.initCanvas()
  }

  componentWillUnmount () {
    // @todo - Review -RS
    // window.removeEventListener('resize', this.updateWindowDimensions)
    // window.removeEventListener('scroll', this.setCanvasOffset)
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.CFIWrapper.current)
    }
  }

  updateWindowDimensions = () => {
    this.setCanvasOffset()
    this.canvasOffset = this.CFICanvas.current.getBoundingClientRect()
    this.canvasOffsetWidth = parseInt(this.canvasOffset.width, 10)
    this.canvasOffsetHeight = parseInt(this.canvasOffset.height, 10)
    this.canvasClientX = parseInt(this.canvasOffset.left, 10)
    this.canvasClientY = parseInt(this.canvasOffset.top, 10)
  }

  setActiveTool = (activeTool: string) => {
    const { imagePathList } = this.state
    if (activeTool === this.state.activeTool) {
      return
    }
    this.clearCanvas()
    repaintImageByPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
    this.setState({ activeTool, selectedArea: [{ edgeList: [], selectPath: [] }] })
  }

  // Should only be used on user even to push
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

  /*:: popFromHistoryToRedoHistory: (stateFragment: Object) => void */
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
    window.addEventListener('mouseup', this.mouseUpHandler)
  }

  dragStartHandler = (e: Object) => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({ isDragging: true })
  }

  mouseUpHandler = (e: Object) => {
    const { drawCoordinates, paintBrushShape, paintBrushWidth, imagePathList, activeTool } = this.state
    if (activeTool === paintBrushTool && drawCoordinates.length > 0) {
      this.clearCanvas()
      this.repaintBrushPathByCorrdinates(drawCoordinates, paintBrushWidth, paintBrushShape, false)
      const newImagePathList = getPaintAreaPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.lpActiveColor)
      this.clearCanvas()
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.setState({ isDragging: false,
        imagePathList: newImagePathList
      })
      this.pushToHistory()
    }

    if (activeTool === eraseTool && drawCoordinates.length > 1) {
      this.repaintBrushPathByCorrdinates(drawCoordinates, paintBrushWidth, paintBrushShape, false)
      const RGB = getActiveColorRGB({ red: 255, blue: 255, green: 255 })
      const erasePath = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight)
      const newImagePathList = eraseIntersection(imagePathList, erasePath, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.clearCanvas()
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.setState({ isDragging: false, imagePathList: newImagePathList })
      this.pushToHistory()
    }
    window.removeEventListener('mouseup', this.mouseUpHandler)
  }

  repaintBrushPathByCorrdinates = (drawCoordinates, paintBrushWidth, paintBrushShape, clip) => {
    for (let i = 0; i < drawCoordinates.length; i++) {
      const currentPoint = drawCoordinates[i]
      const lastPoint = (i === 0) ? drawCoordinates[i] : drawCoordinates[i - 1]
      this.drawPaintBrushPath(this.CFICanvasContext2, currentPoint, lastPoint, paintBrushWidth, paintBrushShape, clip)
    }
  }

  drawPaintBrushPoint = (point: Object, lastPoint: Object) => {
    const { paintBrushWidth, activeTool, eraseBrushWidth, paintBrushShape, eraseBrushShape } = this.state
    const previousPoint = lastPoint || point

    if (activeTool === eraseTool) {
      this.drawPaintBrushPath(this.CFICanvasContext2, point, previousPoint, eraseBrushWidth, eraseBrushShape, true)
    } else {
      this.drawPaintBrushPath(this.CFICanvasContext2, point, previousPoint, paintBrushWidth, paintBrushShape, false)
    }
  }

  drawPaintBrushPath = (context: Object, to: Object, from: Object, width: number, brushShape: string, clip: string) => {
    const { lpActiveColor } = this.props
    const { activeTool } = this.state
    const lpActiveColorRGB = `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    context.fillStyle = (activeTool === eraseTool) ? `rgba(255, 255, 255, 1)` : lpActiveColorRGB
    const radius = Math.round(0.5 * width)

    this.CFICanvasContext2.beginPath()
    if (clip) {
      context.save()
      context.beginPath()
      drawAcrossLine(this.CFICanvasContext2, to, from, (ctx, x, y) => {
        if (brushShape === brushSquareShape) {
          ctx.rect(x - radius, y - radius, width, width)
        } else {
          ctx.arc(x, y, radius, 0, 2 * Math.PI)
        }
      })
      context.clip()
      context.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      context.restore()
    } else {
      drawAcrossLine(this.CFICanvasContext2, to, from, (ctx, x, y) => {
        if (brushShape === brushSquareShape) {
          ctx.rect(x - radius, y - radius, width, width)
        } else {
          ctx.arc(x, y, radius, 0, 2 * Math.PI)
        }
      })
      this.CFICanvasContext2.fill()
    }
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
     * The main idea is maintain selectAreaList, whenever user click area, we repaint canvas based on update
     * selectAreaList and imagePathList
    */
    const { imagePathList, selectedArea } = this.state
    const cursorX = e.nativeEvent.offsetX
    const cursorY = e.nativeEvent.offsetY
    const imageData = this.CFICanvasContext2.getImageData(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)

    const index = (cursorX + cursorY * this.canvasOffsetWidth) * 4
    let edgeListToRender = []
    let isClickInsideImage = false
    for (let i = 0; i < imagePathList.length; i++) {
      if (imagePathList[i].data.includes(index)) {
        isClickInsideImage = true
        break
      }
    }

    if (isClickInsideImage) {
      if (selectedArea.length > 0) {
        let hasAdd = false
        for (let i = 0; i < selectedArea.length; i++) {
          if (selectedArea[i].selectPath.includes(index)) {
            selectedArea.splice(i, 1)
            hasAdd = true
            break
          }
        }
        if (!hasAdd) {
          const imagePath = getSelectArea(imageData, { r: 255, g: 0, b: 0 }, cursorX, cursorY)
          const edge = edgeDetect(this.CFICanvas2, imagePath, [255, 0, 0, 255], this.canvasOffsetWidth, this.canvasOffsetWidth)
          selectedArea.push({
            edgeList: edge,
            selectPath: imagePath
          })
        }
        this.setState({ selectedArea })
      } else {
        const imagePath = getSelectArea(imageData, { r: 255, g: 0, b: 0 }, cursorX, cursorY)
        const edge = edgeDetect(this.CFICanvas2, imagePath, [255, 0, 0, 255], this.canvasOffsetWidth, this.canvasOffsetWidth)
        selectedArea.push({
          edgeList: edge,
          selectPath: imagePath
        })
        this.setState({ selectedArea })
      }
    }

    this.clearCanvas()
    for (let select of selectedArea) {
      edgeListToRender.push({
        color: [255, 255, 255, 255],
        data: select.edgeList
      })
    }
    repaintImageByPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
    if (edgeListToRender.length > 0) {
      repaintImageByPath(edgeListToRender, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
    }
  }

  handlePolygonDefine = (e, isAddArea) => {
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
      let newImagePathList
      createPolygon(polyList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.lpActiveColor.hex, 'source-over')
      if (!isAddArea) {
        const RGB = getActiveColorRGB(hexToRGB(this.props.lpActiveColor.hex))
        const erasePath = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight)
        newImagePathList = eraseIntersection(imagePathList, erasePath, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      } else {
        newImagePathList = getPaintAreaPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.lpActiveColor)
      }
      this.clearCanvas()
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)

      this.setState(
        {
          polyList: [],
          lineStart: [],
          BeginPointList: [],
          imagePathList: newImagePathList
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

  handlePaintArea = (e) => {
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
        this.handlePolygonDefine(e, true)
        break
      case selectArea:
        this.handleSelectArea(e)
        break
      case paintArea:
        this.handlePaintArea(e)
        break
      case removeArea:
        this.handlePolygonDefine(e, false)
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
      <div role='presentation' className={`${baseClass}`} onClick={this.handleClick} onMouseMove={this.mouseMoveHandler} ref={this.CFIWrapper} style={{ height: this.state.wrapperHeight }}>
        <canvas className={`${canvasClass} ${canvasFirstClass} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-first' ref={this.CFICanvas} />
        <canvas style={{ opacity: 0.8 }} className={`${canvasClass} ${canvasSecondClass} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-second' ref={this.CFICanvas2} />
        <img className={`${imageClass}`} ref={this.CFIImage} onLoad={this.initCanvas} onError={this.handleImageErrored} src={imageUrl} alt='' />
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
          />
        </div>
        {
          ((activeTool === paintBrushTool || activeTool === eraseTool) && (position.left > 0 || position.top > 0))
            ? <div
              className={`${paintBrushClass} ${activeTool === paintBrushTool ? `${paintBrushActiveClass} ${paintBrushCircleActiveClass}` : activeTool === eraseTool ? `${eraseBrushActiveClass} ${eraseBrushCircleActiveClass}` : ``}`}
              role='presentation'
              draggable
              onMouseDown={this.mouseDownHandler} onDragStart={this.dragStartHandler}
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
