// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import './PaintScene.scss'
import uniqueId from 'lodash/uniqueId'
import PaintToolBar from './PaintToolBar'
import remove from 'lodash/remove'

import { drawAcrossLine } from './PaintSceneUtils'
import { getPaintAreaPath, repaintImageByPath,
  createPolygon, drawLine, drawHollowCircle,
  edgeDetect, pointInsideCircle, alterRGBByPixel,
  getImageCordinateByPixel, eraseIntersection,
  getActiveColorRGB, getSelectArea, hexToRGB,
  checkIntersection, drawImagePixelByPath,
  copyImageList, getColorAtPixel, colorMatch,
  repaintCircleLine, getImageCordinateByPixelPaintBrush } from './utils'
import { toolNames, groupToolNames } from './data'
import { getScaledPortraitHeight, getScaledLandscapeHeight } from '../../shared/helpers/ImageUtils'
import throttle from 'lodash/throttle'
import { redo, undo } from './UndoRedoUtil'
import WebWorker from './workers/paintScene.worker'

const baseClass = 'paint__scene__wrapper'
const canvasClass = `${baseClass}__canvas`
const canvasSecondClass = `${baseClass}__canvas-second`
const canvasThirdClass = `${baseClass}__canvas-third`
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
const canvasShowByZindex = `${canvasClass}--show-by-zindex`
const canvasHideByZindex = `${canvasClass}--hide-by-zindex`
const canvasVisibleByVisibility = `${canvasClass}--visible-by-visibility`
const canvasHiddenByVisibility = `${canvasClass}--hidden-by-visibility`
const animationLoader = `${baseClass}--animation`
const brushLargeWidth = 38
const brushMediumWidth = 30
const brushSmallWidth = 22
const brushTinyWidth = 14

const brushRoundShape = 'round'
const brushSquareShape = 'square'

type ComponentProps = {
  imageUrl: string,
  // eslint-disable-next-line react/no-unused-prop-types
  imageRotationAngle: number,
  lpActiveColor: Object,
  referenceDimensions: Object,
  // eslint-disable-next-line react/no-unused-prop-types
  width: number
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
  redoPathList: Array<Object>,
  undoIsEnabled: boolean,
  redoIsEnabled: boolean,
  wrapperHeight: number,
  showOriginalCanvas: boolean,
  canvasZoom: number,
  canvasMouseDown: boolean,
  isInfoToolActive: boolean,
  imagePathList: Array<Object>,
  groupSelectList: Array<Object>,
  selectedArea: Array<Object>,
  paintCursor: string,
  isUngroup: boolean,
  isAddGroup: boolean,
  isDeleteGroup: boolean,
  groupAreaList: Array<Object>,
  lineStart: Array<number>,
  polyList: Array<Array<number>>,
  BeginPointList: Array<number>,
  initialCanvasWidth: number,
  initialCanvasHeight: number
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
  CFICanvasContextPaint: any
  canvasOffsetWidth: number
  canvasOffsetHeight: number
  canvasClientX: number
  canvasClientY: number
  CFICanvas: RefObject
  CFICanvas2: RefObject
  CFICanvasPaint: RefObject
  CFIWrapper: RefObject
  CFIImage: RefObject
  wrapperDimensions: Object
  canvasDimensions: Object
  backgroundImageWidth: number
  backgroundImageHeight: number
  isPortrait: boolean
  originalIsPortrait: boolean
  canvasPanStart: Object
  lastPanPoint: Object
  canvasOriginalDimensions: Object
  wrapperOriginalDimensions: Object
  worker: Object

  constructor (props: ComponentProps) {
    super(props)

    this.CFICanvas = React.createRef()
    this.CFICanvas2 = React.createRef()
    this.CFICanvasPaint = React.createRef()
    this.CFIWrapper = React.createRef()
    this.CFIImage = React.createRef()
    // @todo - marked for review -RS
    // this.canvasOffsetWidth = 0
    // this.canvasOffsetHeight = 0
    this.wrapperDimensions = {}
    this.canvasDimensions = {}
    this.canvasOriginalDimensions = {}
    this.wrapperOriginalDimensions = {}
    this.backgroundImageWidth = props.referenceDimensions.imageWidth
    this.backgroundImageHeight = props.referenceDimensions.imageHeight
    this.isPortrait = props.referenceDimensions.isPortrait
    this.originalIsPortrait = props.referenceDimensions.originalIsPortrait
    this.canvasPanStart = { x: 0.5, y: 0.5 }
    this.lastPanPoint = { x: 0, y: 0 }
    this.pause = false
    this.worker = null

    this.state = {
      imageStatus: 'loading',
      activeTool: toolNames.PAINTAREA,
      position: { left: 0, top: 0, isHidden: false },
      paintBrushWidth: brushLargeWidth,
      isDragging: false,
      drawCoordinates: [],
      paintBrushShape: brushRoundShape,
      eraseBrushShape: brushRoundShape,
      eraseBrushWidth: brushLargeWidth,
      redoHistory: [],
      pixelDataHistory: [],
      pixelDataRedoHistory: [],
      undoIsEnabled: false,
      redoIsEnabled: false,
      lineStart: [],
      BeginPointList: [],
      polyList: [],
      imagePathList: [],
      redoPathList: [],
      showOriginalCanvas: false,
      canvasZoom: 1,
      canvasMouseDown: false,
      selectedArea: [],
      groupAreaList: [],
      groupSelectList: [],
      wrapperHeight: this.props.referenceDimensions.imageHeight,
      isUngroup: false,
      isAddGroup: false,
      isDeleteGroup: false,
      paintCursor: `${canvasClass}--${toolNames.PAINTAREA}`,
      isInfoToolActive: false,
      initialCanvasWidth: 0,
      initialCanvasHeight: 0
    }

    this.undo = this.undo.bind(this)
    this.redo = this.redo.bind(this)
    this.redrawCanvas = this.redrawCanvas.bind(this)
    this.getImageCoordinatesByPixel = this.getImageCoordinatesByPixel.bind(this)
    this.initCanvas = this.initCanvas.bind(this)
    this.initCanvasWithDimensions = this.initCanvasWithDimensions.bind(this)
    this.shouldCanvasResize = this.shouldCanvasResize.bind(this)
    this.calcCanvasNewDimensions = this.calcCanvasNewDimensions.bind(this)
    this.scaleCanvases = this.scaleCanvases.bind(this)
  }

  /*:: shouldCanvasResize: (prevWidth: number, newWidth: number) => number */
  shouldCanvasResize (prevWidth: number, newWidth: number) {
    if (newWidth !== prevWidth) {
      return newWidth
    }

    return 0
  }

  componentDidUpdate (prevProps: Object, prevState: Object) {
    const newWidth = this.shouldCanvasResize(prevProps.width, this.props.width)
    if (newWidth) {
      this.scaleCanvases(newWidth)
    }

    const { imagePathList, groupSelectList, selectedArea } = this.state
    let edgeListToRender = []
    let copyImagePathList = copyImageList(imagePathList)
    const islpActiveColorAvailable = (prevProps.hasOwnProperty('lpActiveColor') && this.props.hasOwnProperty('lpActiveColor')) && this.props.lpActiveColor !== null
    const islpActiveColorHexAvailable = (islpActiveColorAvailable) && prevProps.lpActiveColor.hasOwnProperty('hex') && this.props.lpActiveColor.hasOwnProperty('hex')
    if (islpActiveColorHexAvailable && prevProps.lpActiveColor.hex !== this.props.lpActiveColor.hex) {
      const ctx = this.CFICanvas2.current.getContext('2d')
      const RGB = getActiveColorRGB(hexToRGB(this.props.lpActiveColor.hex))
      for (let i = 0; i < this.state.groupSelectList.length; i++) {
        this.clearCanvas()
        drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, RGB, this.state.groupSelectList[i].selectPath)
        const newPath = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight)
        copyImagePathList.push({
          color: RGB,
          data: newPath,
          isEnabled: true,
          linkedOperation: null,
          siblingOperations: null })
        this.clearCanvas()
      }

      for (let i = 0; i < this.state.selectedArea.length; i++) {
        this.clearCanvas()
        drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, RGB, this.state.selectedArea[i].selectPath)
        const newPath = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight)
        copyImagePathList.push({
          color: RGB,
          data: newPath,
          isEnabled: true,
          linkedOperation: null,
          siblingOperations: null })
        this.clearCanvas()
      }

      for (let groupSelect of groupSelectList) {
        edgeListToRender.push({
          color: [255, 255, 255, 255],
          data: groupSelect.edgeList,
          isEnabled: true,
          linkedOperation: null,
          siblingOperations: null
        })
      }

      for (let select of selectedArea) {
        edgeListToRender.push({
          color: [255, 255, 255, 255],
          data: select.edgeList,
          isEnabled: true,
          linkedOperation: null,
          siblingOperations: null
        })
      }
      repaintImageByPath(copyImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      if (edgeListToRender.length > 0) {
        repaintImageByPath(edgeListToRender, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      }

      // eslint-disable-next-line
      this.setState({ imagePathList: copyImagePathList })
    }
  }

  /*:: initCanvas: () => void */
  initCanvas () {
    this.CFICanvasContext = this.CFICanvas.current.getContext('2d')
    this.CFICanvasContext2 = this.CFICanvas2.current.getContext('2d')
    this.CFICanvasContextPaint = this.CFICanvasPaint.current.getContext('2d')
    this.canvasOffsetWidth = parseInt(this.wrapperDimensions.width, 10)
    this.canvasOffsetHeight = parseInt(this.wrapperDimensions.height, 10)
    this.initCanvasWithDimensions()
  }
  /*:: calcCanvasNewDimensions(newWidth: number) => Object */
  calcCanvasNewDimensions (newWidth: number) {
    let canvasWidth = 0
    const wrapperWidth = newWidth || this.wrapperDimensions.width

    if (this.isPortrait) {
      canvasWidth = wrapperWidth / 2
    } else {
      // Landscape
      canvasWidth = wrapperWidth
    }
    // Rounding via bitwise or since this could be called A LOT
    canvasWidth = canvasWidth | 1

    let canvasHeight = 0

    if (this.isPortrait) {
      if (this.originalIsPortrait) {
        canvasHeight = Math.floor(getScaledPortraitHeight(this.backgroundImageWidth, this.backgroundImageHeight)(canvasWidth))
      } else {
        canvasHeight = Math.floor(getScaledPortraitHeight(this.backgroundImageHeight, this.backgroundImageWidth)(canvasWidth))
      }
    } else {
      if (this.originalIsPortrait) {
        canvasHeight = Math.floor(getScaledLandscapeHeight(this.backgroundImageWidth, this.backgroundImageHeight)(canvasWidth))
      } else {
        // Swap width and height for photos that are originally landscape
        canvasHeight = Math.floor(getScaledLandscapeHeight(this.backgroundImageHeight, this.backgroundImageWidth)(canvasWidth))
      }
    }
    // @todo - Think about adding scale factors here in return payload
    return {
      canvasWidth,
      canvasHeight
    }
  }

  /*:: initCanvasWithNewDimensions: (newWidth?: number) => void */
  initCanvasWithDimensions (newWidth?: number) {
    const { canvasWidth, canvasHeight } = this.calcCanvasNewDimensions(newWidth)

    this.CFICanvas.current.width = canvasWidth
    this.CFICanvas.current.height = canvasHeight
    this.CFICanvas2.current.width = canvasWidth
    this.CFICanvas2.current.height = canvasHeight
    this.CFICanvasPaint.current.width = canvasWidth
    this.CFICanvasPaint.current.height = canvasHeight
    this.canvasOffsetWidth = canvasWidth
    this.canvasOffsetHeight = canvasHeight
    this.canvasOriginalDimensions = { width: canvasWidth, height: canvasHeight }
    this.wrapperOriginalDimensions = { width: this.CFIWrapper.current.getBoundingClientRect().width, height: canvasHeight }
    this.setBackgroundImage(canvasWidth, canvasHeight)
  }

  /*:: scaleCanvases: (newWidth: number) => void */
  scaleCanvases (newWidth: number) {
    const { canvasWidth, canvasHeight } = this.calcCanvasNewDimensions(newWidth)

    this.CFICanvas.current.style.width = `${canvasWidth}px`
    this.CFICanvas.current.style.height = `${canvasHeight}px`
    this.CFICanvas2.current.style.width = `${canvasWidth}px`
    this.CFICanvas2.current.style.height = `${canvasHeight}px`
    this.CFICanvasPaint.current.style.width = `${canvasWidth}px`
    this.CFICanvasPaint.current.style.height = `${canvasHeight}px`

    this.CFIWrapper.current.style.height = `${canvasHeight}px`
  }

  /*:: setBackgroundImage: (canvasWidth: number, canvasHeight: number) => void */
  setBackgroundImage (canvasWidth: number, canvasHeight: number) {
    this.CFICanvasContext.drawImage(this.CFIImage.current, 0, 0, canvasWidth, canvasHeight)
    this.CFICanvasContext2.clearRect(0, 0, canvasWidth, canvasHeight)
    this.CFICanvasContext2.drawImage(this.CFIImage.current, 0, 0, canvasWidth, canvasHeight)
    this.CFICanvasContextPaint.clearRect(0, 0, canvasWidth, canvasHeight)
    this.setState({ wrapperHeight: canvasHeight })
  }

  /*:: setDependentPositions: () => void */
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
    this.setDependentPositions()
    this.initCanvas()
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
    this.setState({
      paintCursor: `${canvasClass}--${activeTool}`
    })
    if (activeTool === '') {
      this.setState({
        isInfoToolActive: false,
        paintCursor: `${canvasClass}--${this.state.activeTool}`
      })
      return
    }
    if (activeTool === this.state.activeTool) {
      return
    }
    if (activeTool === toolNames.INFO) {
      this.setState({ isInfoToolActive: true })
      return
    }
    this.clearCanvas()
    repaintImageByPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
    this.setState({ activeTool, selectedArea: [] })
  }

  /*:: undo: () => void */
  undo () {
    const stateFragment = undo(this.state)
    this.setState(stateFragment, () => {
      this.redrawCanvas(stateFragment.imagePathList)
    })
  }

  /*:: redo: () => void */
  redo () {
    const stateFragment = redo(this.state)
    this.setState(stateFragment, () => {
      this.redrawCanvas(stateFragment.imagePathList)
    })
  }

  /*:: redrawFromOperation: (imagePathList: Object[]) => void */
  redrawCanvas (imagePathList: Object[]) {
    this.clearCanvas()
    repaintImageByPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
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
    e.persist()
    const { activeTool, canvasMouseDown } = this.state
    if (activeTool !== toolNames.PAINTBRUSH && activeTool !== toolNames.ERASE && activeTool !== toolNames.ZOOM) return
    if (activeTool === toolNames.ZOOM && canvasMouseDown) {
      this.onPanMove(e)
      return
    }
    this.throttledMouseMove(e)
  }

  throttledMouseMove = throttle((e: Object) => {
    const { clientX, clientY } = e
    const { activeTool, paintBrushWidth, isDragging, drawCoordinates, eraseBrushWidth, paintBrushShape } = this.state
    const { lpActiveColor } = this.props
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const canvasWrapperOffset = this.getCanvasWrapperOffset()
    const paintBrushHalfWidth = (activeTool === toolNames.PAINTBRUSH) ? paintBrushWidth / 2 : eraseBrushWidth / 2
    const leftOffset = clientX - canvasWrapperOffset.x - paintBrushHalfWidth
    const topOffset = clientY - canvasWrapperOffset.y - paintBrushHalfWidth
    const position = { left: leftOffset, top: topOffset, isHidden: this.state.position.isHidden }
    this.setState({ position })

    if ((lpActiveColor && activeTool === toolNames.PAINTBRUSH) || activeTool === toolNames.ERASE) {
      const lpActiveColorRGB = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 1)` : `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`

      const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
      if (isDragging) {
        const currentPoint = {
          x: (clientX - canvasClientOffset.left) * scale,
          y: (clientY - canvasClientOffset.top) * scale
        }
        const drawCoordinatesCloned = copyImageList(drawCoordinates)
        drawCoordinatesCloned.push(currentPoint)
        const drawCoordinatesLength = drawCoordinates.length
        const lastPoint = { x: drawCoordinates[drawCoordinatesLength - 1].x, y: drawCoordinates[drawCoordinatesLength - 1].y }
        if ((activeTool === toolNames.PAINTBRUSH) || (activeTool === toolNames.ERASE)) {
          this.drawPaintBrushPoint(currentPoint, drawCoordinates[drawCoordinatesLength - 1])
        } else {
          this.CFICanvasContextPaint.beginPath()
          if (activeTool === toolNames.PAINTBRUSH) {
            this.drawPaintBrushPathUsingLine(this.CFICanvasContextPaint, currentPoint, lastPoint, paintBrushWidth, paintBrushShape, false, lpActiveColorRGB)
          }
        }
        this.setState({ drawCoordinates: drawCoordinatesCloned })
      }
    }
  }, 10)

  mouseDownHandler = (e: Object) => {
    window.addEventListener('mouseup', this.mouseUpHandler)
    const { isDragging, paintBrushWidth, paintBrushShape, activeTool } = this.state
    const { lpActiveColor } = this.props
    if (!lpActiveColor && activeTool === toolNames.PAINTBRUSH) return
    const lpActiveColorRGB = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 1)` : `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    const { clientX, clientY } = e
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const drawCoordinates = []
    const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
    const currentPoint = {
      x: (clientX - canvasClientOffset.left) * scale,
      y: (clientY - canvasClientOffset.top) * scale
    }
    const lastPoint = { x: currentPoint.x - 1, y: currentPoint.y }
    drawCoordinates.push(currentPoint)
    this.CFICanvasContextPaint.beginPath()
    if (isDragging === false) {
      if ((activeTool === toolNames.PAINTBRUSH) || (activeTool === toolNames.ERASE)) {
        this.drawPaintBrushPoint(currentPoint)
      } else {
        if (activeTool === toolNames.PAINTBRUSH) {
          this.drawPaintBrushPathUsingLine(this.CFICanvasContextPaint, currentPoint, lastPoint, paintBrushWidth, paintBrushShape, false, lpActiveColorRGB)
        }
      }
    }
    this.setState({ drawCoordinates })
  }

  dragStartHandler = (e: Object) => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({ isDragging: true })
  }

  breakGroupIfhasIntersection = () => {
    const { groupAreaList, groupSelectList } = this.state
    let idsToUngroup = []
    let newGroupSelectList = []
    const drawPath = getImageCordinateByPixelPaintBrush(this.CFICanvasPaint, this.canvasOffsetWidth, this.canvasOffsetHeight)
    for (let i = 0; i < groupAreaList.length; i++) {
      const intersect = checkIntersection(groupAreaList[i].selectPath, drawPath)
      if (intersect.length > 0) {
        groupAreaList.splice(i, 1)
        i--
      }
    }
    if (idsToUngroup.length !== 0) {
      newGroupSelectList = groupSelectList.filter(item => {
        return (idsToUngroup.indexOf(item.id) === -1)
      })
    }
    return { newGroupSelectList: newGroupSelectList, newGroupAreaList: groupAreaList }
  }

  mouseUpHandler = (e: Object) => {
    const { drawCoordinates, imagePathList, activeTool } = this.state
    const { lpActiveColor } = this.props
    if (!lpActiveColor) {
      this.setState({
        isDragging: false
      })
    }
    let newImagePathList
    const { newGroupSelectList, newGroupAreaList } = this.breakGroupIfhasIntersection()
    this.clearCanvas()
    if (lpActiveColor && activeTool === toolNames.PAINTBRUSH && drawCoordinates.length > 0) {
      newImagePathList = getPaintAreaPath(imagePathList, this.CFICanvasPaint, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.lpActiveColor, true)
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, false)
    }

    if (activeTool === toolNames.ERASE && drawCoordinates.length > 0) {
      const RGB = getActiveColorRGB({ red: 255, blue: 255, green: 255 })
      const erasePath = getImageCordinateByPixel(this.CFICanvasPaint, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight)
      const tmpImagePathList = eraseIntersection(imagePathList, erasePath)
      newImagePathList = remove(tmpImagePathList, (currImagePath) => {
        return currImagePath.data.length !== 0
      })
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, true)
    }
    this.CFICanvasContextPaint.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)

    this.setState({ isDragging: false,
      imagePathList: newImagePathList,
      groupAreaList: newGroupAreaList,
      groupSelectList: newGroupSelectList,
      redoPathList: [],
      undoIsEnabled: newImagePathList.length > 0,
      redoIsEnabled: false
    })
    window.removeEventListener('mouseup', this.mouseUpHandler)
  }

  repaintBrushPathByCorrdinates = (drawCoordinates: Array<Object>, paintBrushWidth: number, paintBrushShape: string, clip: boolean) => {
    const { lpActiveColor } = this.props
    const { activeTool } = this.state
    const lpActiveColorRGB = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 1)` : `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    this.CFICanvasContext2.beginPath()
    for (let i = 0; i < drawCoordinates.length; i++) {
      const currentPoint = drawCoordinates[i]
      const lastPoint = (i === 0) ? drawCoordinates[i] : drawCoordinates[i - 1]
      if ((activeTool === toolNames.PAINTBRUSH) || (activeTool === toolNames.ERASE)) {
        this.drawPaintBrushPath(this.CFICanvasContext2, currentPoint, lastPoint, paintBrushWidth, paintBrushShape, clip)
      } else {
        if (activeTool === toolNames.PAINTBRUSH) {
          this.drawPaintBrushPathUsingLine(this.CFICanvasContext2, currentPoint, lastPoint, paintBrushWidth, paintBrushShape, clip, lpActiveColorRGB)
        }
      }
    }
  }

  drawPaintBrushPoint = (point: Object, lastPoint: Object) => {
    const { paintBrushWidth, activeTool, eraseBrushWidth, paintBrushShape, eraseBrushShape } = this.state
    const previousPoint = lastPoint || point

    if (activeTool === toolNames.ERASE) {
      this.drawPaintBrushPath(this.CFICanvasContext2, point, previousPoint, eraseBrushWidth, eraseBrushShape, true)
      this.drawPaintBrushPath(this.CFICanvasContextPaint, point, previousPoint, eraseBrushWidth, eraseBrushShape, false)
    } else {
      this.drawPaintBrushPath(this.CFICanvasContextPaint, point, previousPoint, paintBrushWidth, paintBrushShape, false)
    }
  }

  drawPaintBrushPath = (context: Object, to: Object, from: Object, width: number, brushShape: string, clip: boolean) => {
    const { lpActiveColor } = this.props
    const { activeTool } = this.state
    const lpActiveColorRGB = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 1)` : `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    context.fillStyle = lpActiveColorRGB
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
    const radius = Math.round(0.5 * width * scale)
    if (clip) {
      context.save()
      context.globalCompositeOperation = 'destination-out'
      context.beginPath()
      drawAcrossLine(context, to, from, (ctx, x, y) => {
        if (brushShape === brushSquareShape) {
          ctx.rect(x - radius, y - radius, width * scale, width * scale)
        } else {
          ctx.arc(x, y, radius, 0, 2 * Math.PI)
        }
      })
      context.fill()
      // context.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      context.restore()
    } else {
      context.save()
      context.beginPath()
      drawAcrossLine(context, to, from, (ctx, x, y) => {
        if (brushShape === brushSquareShape) {
          ctx.rect(x - radius, y - radius, width * scale, width * scale)
        } else {
          ctx.arc(x, y, radius, 0, 2 * Math.PI)
          ctx.closePath()
        }
      })
      context.fill()
      context.restore()
    }
  }

  clearCanvas = (clearCanvasDrawing: boolean = false) => {
    this.CFICanvasContext2.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    if (clearCanvasDrawing) {
      this.setState({
        imagePathList: [],
        selectedArea: []
      })
    }
  }

  setBrushShapeSize = (brushShape: string, brushWidth: number) => {
    const { activeTool } = this.state
    if (activeTool === toolNames.PAINTBRUSH) {
      this.setState({
        paintBrushShape: brushShape,
        paintBrushWidth: brushWidth
      })
    } else if (activeTool === toolNames.ERASE) {
      this.setState({
        eraseBrushShape: brushShape,
        eraseBrushWidth: brushWidth
      })
    }
  }

  handleSelectArea = (e: Object) => {
    /** This method is for user select or unselect specific area and highlight or dehighlight the paint area border
     * The main idea is maintain selectAreaList, whenever user click area, we repaint canvas based on update
     * selectAreaList and imagePathList
    */
    const { imagePathList, selectedArea, groupAreaList, groupSelectList } = this.state
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
    const { clientX, clientY } = e
    const cursorX = parseInt((clientX - canvasClientOffset.left) * scale)
    const cursorY = parseInt((clientY - canvasClientOffset.top) * scale)
    const imageData = this.CFICanvasContext2.getImageData(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)

    const index = (cursorX + cursorY * this.canvasOffsetWidth) * 4
    let edgeListToRender = []
    let isClickInsideImage = false
    let isClickGroupArea = false
    for (let i = 0; i < imagePathList.length; i++) {
      if (imagePathList[i].data.includes(index)) {
        isClickInsideImage = true
        break
      }
    }

    if (isClickInsideImage) {
      let tmpEdgeArea
      let tmpSelectPath
      let tmpId
      for (let i = 0; i < groupAreaList.length; i++) {
        if (groupAreaList[i].selectPath.includes(index)) {
          tmpSelectPath = groupAreaList[i].selectPath
          tmpEdgeArea = groupAreaList[i].edgeList
          tmpId = groupAreaList[i].id
          isClickGroupArea = true
          break
        }
      }
      if (isClickGroupArea) {
        let hasAdd = false
        for (let i = 0; i < groupSelectList.length; i++) {
          if (groupSelectList[i].selectPath.includes(index)) {
            groupSelectList.splice(i, 1)
            tmpSelectPath = null
            tmpEdgeArea = null
            hasAdd = true
            break
          }
        }
        if (!hasAdd) {
          groupSelectList.push({
            selectPath: tmpSelectPath,
            edgeList: tmpEdgeArea,
            id: tmpId
          })
        }
        this.setState({ groupSelectList })
      }

      if (!isClickGroupArea) {
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
            const edge = edgeDetect(this.CFICanvas2, imagePath, [255, 0, 0, 255], this.canvasOffsetWidth, this.canvasOffsetHeight)
            selectedArea.push({
              edgeList: edge,
              selectPath: imagePath
            })
          }
          this.setState({ selectedArea })
        } else {
          const imagePath = getSelectArea(imageData, { r: 255, g: 0, b: 0 }, cursorX, cursorY)
          const edge = edgeDetect(this.CFICanvas2, imagePath, [255, 0, 0, 255], this.canvasOffsetWidth, this.canvasOffsetHeight)
          selectedArea.push({
            edgeList: edge,
            selectPath: imagePath
          })
          this.setState({ selectedArea })
        }
      }
    }

    this.clearCanvas()

    for (let groupSelect of groupSelectList) {
      edgeListToRender.push({
        color: [255, 255, 255, 255],
        data: groupSelect.edgeList,
        isEnabled: true,
        linkedOperation: null,
        siblingOperations: null
      })
    }

    for (let select of selectedArea) {
      edgeListToRender.push({
        color: [255, 255, 255, 255],
        data: select.edgeList,
        isEnabled: true,
        linkedOperation: null,
        siblingOperations: null
      })
    }

    repaintImageByPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
    if (edgeListToRender.length > 0) {
      repaintImageByPath(edgeListToRender, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
    }
    this.setActiveGroupTool()
  }

  setActiveGroupTool = () => {
    const { selectedArea, groupSelectList } = this.state
    let isDeleteGroup = false
    let isAddGroup = false
    let isUngroup = false
    if (selectedArea.length > 0 || groupSelectList.length > 0) { isDeleteGroup = true }
    if (selectedArea.length > 1 || (selectedArea.length > 0 && groupSelectList.length > 0) || (groupSelectList.length > 1)) { isAddGroup = true }
    if (groupSelectList.length > 0) { isUngroup = true }
    this.setState({ isDeleteGroup: isDeleteGroup, isAddGroup: isAddGroup, isUngroup: isUngroup })
  }

  handlePolygonDefine = (e: Object, isAddArea: boolean) => {
    this.pause = false
    if (!this.props.lpActiveColor) return
    const { BeginPointList, polyList, lineStart, imagePathList } = this.state
    const ctx = this.CFICanvas2.current
    const { clientX, clientY } = e
    // const { canvasZoom } = this.state
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
    const cursorX = (clientX - canvasClientOffset.left) * scale
    const cursorY = (clientY - canvasClientOffset.top) * scale
    const poly = [...polyList]
    poly.push([cursorX, cursorY])
    if (!ctx.getContext) return
    let ctxDraw = this.CFICanvasPaint.current.getContext('2d')
    let isBackToStart = false
    if (BeginPointList.length > 0) {
      isBackToStart = pointInsideCircle(cursorX, cursorY, BeginPointList, 10, scale)
    }
    if (isBackToStart) {
      this.pause = true
      this.clearCanvas()
      let tmpImagePathList
      let newImagePathList
      this.CFICanvasContextPaint.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      createPolygon(polyList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.lpActiveColor.hex, 'source-over')
      if (!isAddArea) {
        const RGB = getActiveColorRGB(hexToRGB(this.props.lpActiveColor.hex))
        const erasePath = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight)
        tmpImagePathList = eraseIntersection(imagePathList, erasePath)
        newImagePathList = remove(tmpImagePathList, (currImagePath) => {
          return currImagePath.data.length !== 0
        })
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
      const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
      const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
      this.CFICanvasContextPaint.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      if (BeginPointList.length > 0) {
        this.circleAnimate(this.circleAnimate, 0, ctxDraw, BeginPointList[0], BeginPointList[1], scale, '#28A745')
      }
      poly.length > 2 && repaintCircleLine(ctxDraw, BeginPointList, poly.slice(1, -1), scale)
      drawHollowCircle(ctxDraw, cursorX, cursorY, scale, '#2cabe2')
      if (lineStart.length > 0) {
        ctxDraw.beginPath()
        const end = [cursorX, cursorY]
        drawLine(ctxDraw, lineStart, end, true, scale)
      } else {
        this.setState({ BeginPointList: [cursorX, cursorY] })
      }
      ctxDraw.restore()
    }
    repaintImageByPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
    this.setState({ lineStart: [cursorX, cursorY], polyList: poly })
  }

  handlePaintArea = throttle((e: Object) => {
    const { imagePathList } = this.state
    if (!this.props.lpActiveColor) return
    let imagePath = []
    const { clientX, clientY } = e
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
    const cursorX = Math.round((clientX - canvasClientOffset.left) * scale)
    const cursorY = Math.round((clientY - canvasClientOffset.top) * scale)
    const imageData = this.CFICanvasContext2.getImageData(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    const imageDataOrigin = this.CFICanvasContext.getImageData(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    let copyImagePathList = copyImageList(imagePathList)
    const RGB = getActiveColorRGB(hexToRGB(this.props.lpActiveColor.hex))
    const ctx = this.CFICanvas2.current.getContext('2d')
    const index = (cursorX + cursorY * this.canvasOffsetWidth) * 4
    let isClickInsideImage = false
    const isPaint = colorMatch(getColorAtPixel(imageData, cursorX, cursorY), { r: RGB[0], g: RGB[1], b: RGB[2], a: RGB[3] }, 100)

    if (!isPaint) {
      for (let i = 0; i < imagePathList.length; i++) {
        if (imagePathList[i].data.includes(index)) {
          isClickInsideImage = true
          break
        }
      }

      if (isClickInsideImage) {
        imagePath = getSelectArea(imageData, RGB, cursorX, cursorY, 100)
      } else {
        imagePath = getSelectArea(imageDataOrigin, RGB, cursorX, cursorY, 94)
      }
      this.clearCanvas()
      drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, RGB, imagePath)
      const newPath = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight)
      copyImagePathList.push({
        id: uniqueId(),
        color: RGB,
        data: newPath,
        isEnabled: true,
        linkedOperation: null,
        siblingOperations: null })
      this.clearCanvas()
      repaintImageByPath(copyImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.setState({ imagePathList: copyImagePathList,
        undoIsEnabled: copyImagePathList.length > 0,
        redoIsEnabled: false })
    }
  }, 10)

  circleAnimate = (fn, t, ...arg) => {
    const helper = (fn, t, ...arg) => {
      if (this.pause) { return }
      let y = Math.sin(t * Math.PI / 180)
      drawHollowCircle(...arg, y)
      window.requestAnimationFrame((t) => helper(fn, t, ...arg))
    }
    helper(fn, t, ...arg)
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
    const { activeTool, isInfoToolActive } = this.state
    if (isInfoToolActive) return
    switch (activeTool) {
      case toolNames.DEFINEAREA:
        this.handlePolygonDefine(e, true)
        break
      case toolNames.SELECTAREA:
        this.handleSelectArea(e)
        break
      case toolNames.PAINTAREA:
        this.handlePaintArea(e)
        break
      case toolNames.REMOVEAREA:
        this.handlePolygonDefine(e, false)
        break
    }
  }

  hidePaint = (e: Object, isMouseDown: boolean) => {
    if (isMouseDown) {
      this.setState({ showOriginalCanvas: true })
    } else {
      this.setState({ showOriginalCanvas: false })
    }
  }

  applyZoom = (zoomNumber: number) => {
    const options = {
      containerWidth: this.wrapperOriginalDimensions.width,
      containerHeight: this.wrapperOriginalDimensions.height,
      canvasWidth: this.canvasOriginalDimensions.width,
      canvasHeight: this.canvasOriginalDimensions.height,
      zoom: zoomNumber,
      panX: this.canvasPanStart.x,
      panY: this.canvasPanStart.y
    }
    const factors = this.canvasDimensionFactors(options)
    this.applyDimensionFactorsToCanvas(factors)
    this.setState({ canvasZoom: zoomNumber })
  }

  onPanStart = (event: Object) => {
    event.stopPropagation()
    event.preventDefault()
    const { activeTool, isInfoToolActive } = this.state
    if (activeTool !== toolNames.ZOOM || isInfoToolActive) return
    window.removeEventListener('mousemove', this.mouseMoveHandler)
    window.removeEventListener('click', this.handleClick)
    window.addEventListener('mousemove', this.onPanMove)
    window.addEventListener('mouseup', this.onPanEnd)
    this.setState({
      canvasMouseDown: true
    })
    this.lastPanPoint = { x: event.pageX, y: event.pageY }
  }

  onPanMove = throttle((event: Object) => {
    const { canvasZoom, canvasMouseDown } = this.state
    if (canvasZoom <= 1 && canvasZoom >= 8) return
    if (!canvasMouseDown) return
    const MIN_PAN = -0.1
    const MAX_PAN = 1.1
    const { body }: Object = document
    const { clientWidth, clientHeight } = body
    const dx = (event.pageX - this.lastPanPoint.x) / clientWidth
    const dy = (event.pageY - this.lastPanPoint.y) / clientHeight
    const panX = this.canvasPanStart.x - dx
    const panY = this.canvasPanStart.y - dy
    this.canvasPanStart = { x: Math.max(MIN_PAN, Math.min(MAX_PAN, panX)), y: Math.max(MIN_PAN, Math.min(MAX_PAN, panY)) }
    this.lastPanPoint = { x: event.pageX, y: event.pageY }

    const options = {
      containerWidth: this.wrapperOriginalDimensions.width,
      containerHeight: this.wrapperOriginalDimensions.height,
      canvasWidth: this.canvasOriginalDimensions.width,
      canvasHeight: this.canvasOriginalDimensions.height,
      zoom: canvasZoom,
      panX: this.canvasPanStart.x,
      panY: this.canvasPanStart.y
    }
    const factors = this.canvasDimensionFactors(options)
    this.applyDimensionFactorsToCanvas(factors)
  }, 10)

  onPanEnd = () => {
    this.setState({
      canvasMouseDown: false
    })
  }

  drawPaintBrushPathUsingLine = (ctx: Object, currentPoint: Object, lastPoint: Object, paintBrushWidth: number, paintBrushShape: string, clip: boolean, color: string) => {
    ctx.save()
    if (paintBrushShape === brushRoundShape) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
    ctx.lineWidth = paintBrushWidth * scale
    ctx.strokeStyle = color
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(currentPoint.x, currentPoint.y)
    if (clip) {
      ctx.clip()
    } else {
      ctx.stroke()
    }
    ctx.restore()
  }

  getPaintBrushActiveClass = () => {
    const { paintBrushWidth, paintBrushShape } = this.state
    let paintBrushActiveClass = ''
    let paintBrushCircleActiveClass = ''
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
    return { paintBrushActiveClass: paintBrushActiveClass, paintBrushCircleActiveClass: paintBrushCircleActiveClass }
  }

  getEraseBrushActiveClass = () => {
    const { eraseBrushWidth, eraseBrushShape } = this.state
    let eraseBrushActiveClass = ''
    let eraseBrushCircleActiveClass = ''
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
    return { eraseBrushActiveClass: eraseBrushActiveClass, eraseBrushCircleActiveClass: eraseBrushCircleActiveClass }
  }

  getCanvasWrapperOffset = () => {
    let canvasWrapperOffset = {}
    if (this.CFIWrapper.current) {
      const wrapperClientOffset = this.CFIWrapper.current.getBoundingClientRect()
      canvasWrapperOffset.x = parseInt(wrapperClientOffset.left, 10)
      canvasWrapperOffset.y = parseInt(wrapperClientOffset.top, 10)
      canvasWrapperOffset.width = parseInt(wrapperClientOffset.width, 10)
      canvasWrapperOffset.height = parseInt(wrapperClientOffset.height, 10)
    }
    return canvasWrapperOffset
  }

  group = () => {
    let newGroupSelectList = []
    let isNewGroupArea = true
    const { selectedArea, groupSelectList, groupAreaList } = this.state
    let newGroupAreaList = [...groupAreaList]
    let groupAreaPath = []
    let groupEdgeList = []
    for (let i = 0; i < selectedArea.length; i++) {
      const targetPath = selectedArea[i].selectPath
      const edgeList = selectedArea[i].edgeList
      groupAreaPath = [...targetPath, ...groupAreaPath]
      groupEdgeList = [...edgeList, ...groupEdgeList]
    }
    for (let j = 0; j < groupSelectList.length; j++) {
      isNewGroupArea = false
      const targetPath = groupSelectList[j].selectPath
      const edgeList = groupSelectList[j].edgeList
      groupAreaPath = [...targetPath, ...groupAreaPath]
      groupEdgeList = [...edgeList, ...groupEdgeList]
    }

    if (groupAreaPath.length > 0) {
      const id = uniqueId()
      if (isNewGroupArea) {
        newGroupAreaList.push({
          edgeList: groupEdgeList,
          selectPath: groupAreaPath,
          id: id
        })
      } else {
        newGroupAreaList = [{
          edgeList: groupEdgeList,
          selectPath: groupAreaPath,
          id: id
        }]
      }
      newGroupSelectList.push({
        edgeList: groupEdgeList,
        selectPath: groupAreaPath,
        id: id
      })
    }
    this.setState({
      groupAreaList: newGroupAreaList,
      groupSelectList: newGroupSelectList,
      selectedArea: [],
      isUngroup: true
    })
  }

  ungroup = () => {
    const { groupSelectList, groupAreaList } = this.state
    const idsToUngroup = groupSelectList.map((item) => {
      return item.id
    })
    const newGroupAreaList = groupAreaList.filter(item => {
      return (idsToUngroup.indexOf(item.id) === -1)
    })
    this.setState({ groupAreaList: newGroupAreaList, groupSelectList: [], isUngroup: false })
  }

  deleteGroup = () => {
    const { imagePathList, groupSelectList, selectedArea, groupAreaList } = this.state
    let groupAreaPath = []
    let selectedAreaPath = []
    const ctx = this.CFICanvas2.current.getContext('2d')
    this.setState({ loading: true })
    for (let i = 0; i < groupSelectList.length; i++) {
      drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, [255, 255, 255, 0], groupSelectList[i].selectPath)
      drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, [255, 255, 255, 0], groupSelectList[i].edgeList)
      groupAreaPath = [...groupAreaPath, ...groupSelectList[i].selectPath]
    }

    for (let i = 0; i < selectedArea.length; i++) {
      drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, [255, 255, 255, 0], selectedArea[i].selectPath)
      drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, [255, 255, 255, 0], selectedArea[i].edgeList)
      selectedAreaPath = [...selectedAreaPath, ...selectedArea[i].selectPath]
    }

    this.worker = new WebWorker()
    this.worker.addEventListener('message', this.workerMessageHandler)
    this.worker.postMessage({ imagePathList: imagePathList,
      groupSelectList: groupSelectList,
      groupAreaList: groupAreaList,
      groupAreaPath: groupAreaPath,
      selectedAreaPath: selectedAreaPath
    })
  }

  workerMessageHandler = (e: Object) => {
    const { newGroupAreaList, newImagePathList } = e.data
    this.worker.removeEventListener('message', this.workerMessageHandler)
    this.worker.terminate()
    this.setState({ imagePathList: newImagePathList, groupSelectList: [], selectedArea: [], groupAreaList: newGroupAreaList, isAddGroup: false, isUngroup: false, loading: false })
  }

  groupHandler = (groupName: string) => {
    switch (groupName) {
      case groupToolNames.DELETEGROUP:
        this.deleteGroup()
        break
      case groupToolNames.GROUP:
        this.group()
        break
      case groupToolNames.UNGROUP:
        this.ungroup()
        break
    }
  }

  canvasDimensionFactors = (options: Object) => {
    const { canvasWidth, canvasHeight, containerWidth, containerHeight, panX, panY, zoom } = options
    let canvasScaleX = canvasWidth / containerWidth
    let canvasScaleY = canvasHeight / containerHeight
    let shouldFitWidth = false
    let shouldFitHeight = false
    let width = 0
    let height = 0

    if (canvasScaleX > canvasScaleY) {
      // image is wider than it is tall
      shouldFitWidth = true
    } else {
      // image is taller than it is wide
      shouldFitHeight = true
    }

    if (shouldFitWidth) {
      width = containerWidth * zoom
      height = width * canvasHeight / canvasWidth
    } else if (shouldFitHeight) {
      height = containerHeight * zoom
      width = height * canvasWidth / canvasHeight
    }

    const widthFactor = width / containerWidth
    const heightFactor = height / containerHeight
    const clampedPanX = (widthFactor < 1) ? 0.5 : panX
    const clampedPanY = (heightFactor < 1) ? 0.5 : panY
    const xFactor = clampedPanX * (1 - widthFactor)
    const yFactor = clampedPanY * (1 - heightFactor)

    return {
      widthFactor, heightFactor, xFactor, yFactor
    }
  }

  applyDimensionFactorsToCanvas = (factors: Object) => {
    this.applyDimensionFactorsByCanvas(factors, this.CFICanvas)
    this.applyDimensionFactorsByCanvas(factors, this.CFICanvas2)
    this.applyDimensionFactorsByCanvas(factors, this.CFICanvasPaint)
  }

  applyDimensionFactorsByCanvas = (factors: Object, canvas: RefObject) => {
    canvas.current.style.width = `${Math.floor(factors.widthFactor * 100)}%`
    canvas.current.style.height = `${Math.floor(factors.heightFactor * 100)}%`
    canvas.current.style.left = `${Math.floor(factors.xFactor * 100)}%`
    canvas.current.style.top = `${Math.floor(factors.yFactor * 100)}%`
  }

  mouseLeaveHandler = () => {
    const { position } = this.state
    this.setState({ position: { ...position, isHidden: true } })
  }

  mouseEnterHandler = () => {
    const { position } = this.state
    this.setState({ position: { ...position, isHidden: false } })
  }

  render () {
    const { imageUrl, lpActiveColor } = this.props
    const { activeTool, position, paintBrushShape, paintBrushWidth, eraseBrushShape, eraseBrushWidth, undoIsEnabled, redoIsEnabled, showOriginalCanvas, isAddGroup, isDeleteGroup, isUngroup, paintCursor, isInfoToolActive, loading } = this.state
    const lpActiveColorRGB = (lpActiveColor) ? `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})` : ``
    const backgroundColorBrush = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 0.7)` : lpActiveColorRGB
    const { paintBrushActiveClass, paintBrushCircleActiveClass } = this.getPaintBrushActiveClass()
    const { eraseBrushActiveClass, eraseBrushCircleActiveClass } = this.getEraseBrushActiveClass()

    return (
      <div role='presentation' className={baseClass} onClick={this.handleClick} onMouseMove={this.mouseMoveHandler} ref={this.CFIWrapper} style={{ height: this.state.wrapperHeight }} onMouseLeave={this.mouseLeaveHandler} onMouseEnter={this.mouseEnterHandler}>
        <div className={`${animationLoader} ${loading ? `${animationLoader}--load` : ''}`} />
        <canvas className={`${canvasClass} ${showOriginalCanvas ? `${canvasShowByZindex}` : `${canvasHideByZindex}`} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-first' ref={this.CFICanvas} />
        <canvas style={{ opacity: showOriginalCanvas ? 1 : 0.8 }} className={`${canvasClass} ${paintCursor} ${canvasSecondClass} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-second' ref={this.CFICanvas2} />
        <canvas onMouseDown={this.onPanStart} style={{ opacity: 1 }} className={`${canvasClass} ${paintCursor} ${(activeTool === toolNames.PAINTBRUSH ? canvasSecondClass : canvasThirdClass)} ${(activeTool === toolNames.ERASE) ? canvasHiddenByVisibility : canvasVisibleByVisibility} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-paint' ref={this.CFICanvasPaint} />
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
            hidePaint={this.hidePaint}
            applyZoom={this.applyZoom}
            groupHandler={this.groupHandler}
            isAddGroup={isAddGroup}
            isDeleteGroup={isDeleteGroup}
            isUngroup={isUngroup}
          />
        </div>
        {
          ((activeTool === toolNames.PAINTBRUSH || activeTool === toolNames.ERASE) && (position.isHidden === false) && !isInfoToolActive)
            ? <div
              className={`${paintBrushClass} ${activeTool === toolNames.PAINTBRUSH ? `${paintBrushActiveClass} ${paintBrushCircleActiveClass}` : activeTool === toolNames.ERASE ? `${eraseBrushActiveClass} ${eraseBrushCircleActiveClass}` : ``}`}
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
export {
  baseClass, paintBrushClass, canvasClass
}
export default connect(mapStateToProps, null)(PaintScene)
