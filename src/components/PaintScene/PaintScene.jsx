// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import './PaintScene.scss'
import uniqueId from 'lodash/uniqueId'
import PaintToolBar from './PaintToolBar'
import remove from 'lodash/remove'

import { drawAcrossLine } from './PaintSceneUtils'
import { getPaintAreaPath, repaintImageByPath,
  createPolygon, drawLine, drawCircle,
  edgeDetect, pointInsideCircle, alterRGBByPixel,
  getImageCordinateByPixel, eraseIntersection,
  getActiveColorRGB, getSelectArea, hexToRGB,
  checkIntersection, drawImagePixelByPath,
  copyImageList, getColorAtPixel, colorMatch } from './utils'
import { toolNames } from './data'
import { getScaledPortraitHeight, getScaledLandscapeHeight } from '../../shared/helpers/ImageUtils'
import throttle from 'lodash/throttle'

const baseClass = 'paint__scene__wrapper'
const canvasClass = `${baseClass}__canvas`
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
const canvasShowByZindex = `${canvasClass}--show-by-zindex`
const canvasHideByZindex = `${canvasClass}--hide-by-zindex`

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
const deleteGroup = 'deleteGroup'
const group = 'group'
const ungroup = 'ungroup'

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
  drawHistory: Array<Array<Object>>,
  drawCoordinates: Array<Object>,
  pixelDataHistory: Array<Object>,
  pixelDataRedoHistory: Array<Object>,
  undoIsEnabled: boolean,
  redoIsEnabled: boolean,
  wrapperHeight: number,
  showOriginalCanvas: boolean,
  canvasZoom: number,
  canvasMouseDown: boolean,
  zoomRange: number
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
  originalIsPortrait: boolean
  canvasPanStart: Object
  lastPanPoint: Object

  constructor (props: ComponentProps) {
    super(props)

    this.CFICanvas = React.createRef()
    this.CFICanvas2 = React.createRef()
    this.CFIWrapper = React.createRef()
    this.CFIImage = React.createRef()
    // @todo - marked for review -RS
    // this.canvasOffsetWidth = 0
    // this.canvasOffsetHeight = 0
    this.wrapperDimensions = null
    this.canvasDimensions = null
    this.backgroundImageWidth = props.referenceDimensions.imageWidth
    this.backgroundImageHeight = props.referenceDimensions.imageHeight
    this.isPortrait = props.referenceDimensions.isPortrait
    this.originalIsPortrait = props.referenceDimensions.originalIsPortrait
    this.canvasPanStart = { x: 0.5, y: 0.5 }
    this.lastPanPoint = { x: 0, y: 0 }

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
      showOriginalCanvas: false,
      canvasZoom: 1,
      canvasMouseDown: false,
      zoomRange: 0,
      selectedArea: [],
      groupAreaList: [],
      groupSelectList: [],
      wrapperHeight: this.props.referenceDimensions.imageHeight,
      isUngroup: false,
      isAddGroup: false,
      isDeleteGroup: false,
      paintCursor: `${canvasClass}--${paintArea}`
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

  componentDidUpdate (prevProps, prevState) {
    const { imagePathList, groupSelectList, selectedArea } = this.state
    let edgeListToRender = []
    let copyImagePathList = copyImageList(imagePathList)
    if (prevProps.lpActiveColor.hex !== this.props.lpActiveColor.hex) {
      const ctx = this.CFICanvas2.current.getContext('2d')
      const RGB = getActiveColorRGB(hexToRGB(this.props.lpActiveColor.hex))
      for (let i = 0; i < this.state.groupSelectList.length; i++) {
        this.clearCanvas()
        drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, RGB, this.state.groupSelectList[i].selectPath)
        const newPath = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight)
        copyImagePathList.push({ color: RGB, data: newPath })
        this.clearCanvas()
      }

      for (let i = 0; i < this.state.selectedArea.length; i++) {
        this.clearCanvas()
        drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, RGB, this.state.selectedArea[i].selectPath)
        const newPath = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight)
        copyImagePathList.push({ color: RGB, data: newPath })
        this.clearCanvas()
      }

      for (let groupSelect of groupSelectList) {
        edgeListToRender.push({
          color: [255, 255, 255, 255],
          data: groupSelect.edgeList
        })
      }

      for (let select of selectedArea) {
        edgeListToRender.push({
          color: [255, 255, 255, 255],
          data: select.edgeList
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

    this.CFICanvas.current.width = canvasWidth
    this.CFICanvas.current.height = canvasHeight
    this.CFICanvas2.current.width = canvasWidth
    this.CFICanvas2.current.height = canvasHeight
    this.canvasOriginalDimensions = { width: canvasWidth, height: canvasHeight }
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

    this.setDependentPositions()
    this.initCanvas()
  }

  componentWillUnmount () {
    // @todo - Review -RS
    // window.removeEventListener('resize', this.updateWindowDimensions)
    // window.removeEventListener('scroll', this.setCanvasOffset)
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
    this.setState({ activeTool, selectedArea: [], paintCursor: `${canvasClass}--${activeTool}` })
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
    e.persist()
    const { activeTool, canvasMouseDown } = this.state
    if (activeTool === toolNames.ZOOM && canvasMouseDown) {
      this.onPanMove(e)
      return
    }
    this.throttledMouseMove(e)
  }

  throttledMouseMove = throttle((e: Object) => {
    const { clientX, clientY } = e
    const { activeTool, paintBrushWidth, isDragging, drawCoordinates, eraseBrushWidth, paintBrushShape, canvasZoom } = this.state
    const { lpActiveColor } = this.props
    const lpActiveColorRGB = (activeTool === eraseTool) ? `rgba(255, 255, 255, 1)` : `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const canvasWrapperOffset = this.getCanvasWrapperOffset()

    if ((lpActiveColor && activeTool === paintBrushTool) || activeTool === eraseTool) {
      const paintBrushHalfWidth = (activeTool === paintBrushTool) ? paintBrushWidth / 2 : eraseBrushWidth / 2
      const leftOffset = clientX - canvasWrapperOffset.x - paintBrushHalfWidth
      const topOffset = clientY - canvasWrapperOffset.y - paintBrushHalfWidth
      const position = { left: leftOffset, top: topOffset }
      this.setState({ position })

      if (isDragging) {
        const currentPoint = {
          x: (clientX - canvasClientOffset.left) / (canvasClientOffset.right - canvasClientOffset.left) * canvasClientOffset.width / canvasZoom,
          y: (clientY - canvasClientOffset.top) / (canvasClientOffset.bottom - canvasClientOffset.top) * canvasClientOffset.height / canvasZoom
        }
        const drawCoordinatesCloned = copyImageList(drawCoordinates)
        drawCoordinatesCloned.push(currentPoint)
        const drawCoordinatesLength = drawCoordinates.length
        const lastPoint = { x: drawCoordinates[drawCoordinatesLength - 1].x, y: drawCoordinates[drawCoordinatesLength - 1].y }
        if ((activeTool === paintBrushTool && paintBrushShape === brushSquareShape) || (activeTool === eraseTool)) {
          this.drawPaintBrushPoint(currentPoint, drawCoordinates[drawCoordinatesLength - 1])
        } else {
          this.CFICanvasContext2.beginPath()
          if (activeTool === paintBrushTool) {
            this.drawPaintBrushPathUsingLine(this.CFICanvasContext2, currentPoint, lastPoint, paintBrushWidth, paintBrushShape, false, lpActiveColorRGB)
          }
        }
        this.setState({ drawCoordinates: drawCoordinatesCloned })
      }
    }
  }, 10)

  mouseDownHandler = (e: Object) => {
    const { isDragging, paintBrushWidth, paintBrushShape, activeTool, canvasZoom } = this.state
    const { lpActiveColor } = this.props
    const lpActiveColorRGB = (activeTool === eraseTool) ? `rgba(255, 255, 255, 1)` : `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    if (!lpActiveColor) return
    const { clientX, clientY } = e
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const drawCoordinates = []
    const currentPoint = {
      x: (clientX - canvasClientOffset.left) / (canvasClientOffset.right - canvasClientOffset.left) * canvasClientOffset.width / canvasZoom,
      y: (clientY - canvasClientOffset.top) / (canvasClientOffset.bottom - canvasClientOffset.top) * canvasClientOffset.height / canvasZoom
    }
    const lastPoint = { x: currentPoint.x - 1, y: currentPoint.y }
    drawCoordinates.push(currentPoint)
    if (isDragging === false) {
      if ((activeTool === paintBrushTool && paintBrushShape === brushSquareShape) || (activeTool === eraseTool)) {
        this.drawPaintBrushPoint(currentPoint)
      } else {
        this.CFICanvasContext2.beginPath()
        if (activeTool === paintBrushTool) {
          this.drawPaintBrushPathUsingLine(this.CFICanvasContext2, currentPoint, lastPoint, paintBrushWidth, paintBrushShape, false, lpActiveColorRGB)
        }
      }
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
    const { drawCoordinates, paintBrushShape, paintBrushWidth, imagePathList, activeTool, eraseBrushShape, eraseBrushWidth, groupAreaList, groupSelectList } = this.state
    const { lpActiveColor } = this.props
    if (lpActiveColor && activeTool === paintBrushTool && drawCoordinates.length > 0) {
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

    if (activeTool === eraseTool && drawCoordinates.length > 0) {
      this.repaintBrushPathByCorrdinates(drawCoordinates, eraseBrushWidth, eraseBrushShape, false)
      const RGB = getActiveColorRGB({ red: 255, blue: 255, green: 255 })
      const erasePath = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight)
      const tmpImagePathList = eraseIntersection(imagePathList, erasePath)
      let idsToUngroup = []
      let newGroupSelectList = []
      for (let i = 0; i < groupAreaList.length; i++) {
        const intersect = checkIntersection(groupAreaList[i].selectPath, erasePath)
        if (intersect.length > 0) {
          idsToUngroup.push(groupAreaList[i].id)
          groupAreaList.splice(i, 1)
          i--
        }
      }
      if (idsToUngroup.length !== 0) {
        newGroupSelectList = groupSelectList.filter(item => {
          return (idsToUngroup.indexOf(item.id) === -1)
        })
      }
      this.clearCanvas()
      const newImagePathList = remove(tmpImagePathList, (currImagePath) => {
        return currImagePath.data.length !== 0
      })
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.setState({ isDragging: false, imagePathList: newImagePathList, groupAreaList, groupSelectList: newGroupSelectList })
      this.pushToHistory()
    }
    window.removeEventListener('mouseup', this.mouseUpHandler)
  }

  repaintBrushPathByCorrdinates = (drawCoordinates, paintBrushWidth, paintBrushShape, clip) => {
    const { lpActiveColor } = this.props
    const { activeTool } = this.state
    const lpActiveColorRGB = `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    this.CFICanvasContext2.beginPath()
    for (let i = 0; i < drawCoordinates.length; i++) {
      const currentPoint = drawCoordinates[i]
      const lastPoint = (i === 0) ? drawCoordinates[i] : drawCoordinates[i - 1]
      if (paintBrushShape === brushRoundShape && activeTool === paintBrushTool) {
        this.drawPaintBrushPathUsingLine(this.CFICanvasContext2, currentPoint, lastPoint, paintBrushWidth, paintBrushShape, clip, lpActiveColorRGB)
      } else {
        this.drawPaintBrushPath(this.CFICanvasContext2, currentPoint, lastPoint, paintBrushWidth, paintBrushShape, clip)
      }
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
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
    const radius = Math.round(0.5 * width * scale)

    if (clip) {
      context.save()
      context.beginPath()
      drawAcrossLine(this.CFICanvasContext2, to, from, (ctx, x, y) => {
        if (brushShape === brushSquareShape) {
          ctx.rect(x - radius, y - radius, width * scale, width * scale)
        } else {
          ctx.arc(x, y, radius, 0, 2 * Math.PI)
        }
      })
      context.clip()
      context.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      context.restore()
    } else {
      this.CFICanvasContext2.beginPath()
      drawAcrossLine(this.CFICanvasContext2, to, from, (ctx, x, y) => {
        if (brushShape === brushSquareShape) {
          ctx.rect(x - radius, y - radius, width * scale, width * scale)
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
    const { imagePathList, selectedArea, groupAreaList, groupSelectList, canvasZoom } = this.state
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const { clientX, clientY } = e
    const cursorX = parseInt((clientX - canvasClientOffset.left) / (canvasClientOffset.right - canvasClientOffset.left) * canvasClientOffset.width / canvasZoom)
    const cursorY = parseInt((clientY - canvasClientOffset.top) / (canvasClientOffset.bottom - canvasClientOffset.top) * canvasClientOffset.height / canvasZoom)
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
    }

    this.clearCanvas()

    for (let groupSelect of groupSelectList) {
      edgeListToRender.push({
        color: [255, 255, 255, 255],
        data: groupSelect.edgeList
      })
    }

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

  handlePolygonDefine = (e, isAddArea) => {
    const ctx = this.CFICanvas2.current
    const { clientX, clientY } = e
    const { canvasZoom } = this.state
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const cursorX = (clientX - canvasClientOffset.left) / (canvasClientOffset.right - canvasClientOffset.left) * canvasClientOffset.width / canvasZoom
    const cursorY = (clientY - canvasClientOffset.top) / (canvasClientOffset.bottom - canvasClientOffset.top) * canvasClientOffset.height / canvasZoom
    if (!ctx.getContext) return
    let ctxDraw = ctx.getContext('2d')
    const { BeginPointList, polyList, lineStart, imagePathList } = this.state
    let isBackToStart = false
    if (BeginPointList.length > 0) {
      isBackToStart = pointInsideCircle(cursorX, cursorY, BeginPointList, 10)
    }
    if (isBackToStart) {
      this.clearCanvas()
      let tmpImagePathList
      let newImagePathList
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
      drawCircle(ctxDraw, cursorX, cursorY, scale)
      // toDo: Animation of StartPoint
      if (lineStart.length > 0) {
        ctxDraw.beginPath()
        const end = [cursorX, cursorY]
        drawLine(ctxDraw, lineStart, end, true, scale)
      } else {
        this.setState({ BeginPointList: [cursorX, cursorY] })
      }
      ctxDraw.restore()
    }
    const poly = [...polyList]
    poly.push([cursorX, cursorY])
    this.setState({ lineStart: [cursorX, cursorY], polyList: poly })
  }

  handlePaintArea = throttle((e) => {
    const { imagePathList } = this.state
    let imagePath = []
    const cursorX = e.nativeEvent.offsetX
    const cursorY = e.nativeEvent.offsetY
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
      copyImagePathList.push({ color: RGB, data: newPath })
      this.clearCanvas()
      repaintImageByPath(copyImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.setState({ imagePathList: copyImagePathList })
    }
  }, 10)

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

  hidePaint = (e: Object, isMouseDown: boolean) => {
    if (isMouseDown) {
      this.setState({ showOriginalCanvas: true })
    } else {
      this.setState({ showOriginalCanvas: false })
    }
  }

  applyZoom = (zoomNumber: number) => {
    const { canvasZoom, zoomRange } = this.state
    let zoom = (zoomNumber > zoomRange) ? canvasZoom / 0.8 : canvasZoom * 0.8
    if (zoom < 1 || zoom >= 8) zoom = canvasZoom

    const wrapperClientOffset = this.getCanvasWrapperOffset()
    const options = {
      containerWidth: wrapperClientOffset.width,
      containerHeight: wrapperClientOffset.height,
      canvasWidth: this.canvasOriginalDimensions.width,
      canvasHeight: this.canvasOriginalDimensions.height,
      zoom: zoom,
      panX: this.canvasPanStart.x,
      panY: this.canvasPanStart.y
    }
    const factors = this.canvasDimensionFactors(options)
    this.applyDimensionFactorsToCanvas(factors)
    this.setState({ canvasZoom: zoom, zoomRange: zoomNumber })
  }

  onPanStart = (event: Object) => {
    event.stopPropagation()
    event.preventDefault()
    const { activeTool } = this.state
    if (activeTool !== toolNames.ZOOM) return
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
    const dx = (event.pageX - this.lastPanPoint.x) / document.body.clientWidth
    const dy = (event.pageY - this.lastPanPoint.y) / document.body.clientHeight
    const panX = this.canvasPanStart.x - dx
    const panY = this.canvasPanStart.y - dy
    this.canvasPanStart = { x: Math.max(MIN_PAN, Math.min(MAX_PAN, panX)), y: Math.max(MIN_PAN, Math.min(MAX_PAN, panY)) }
    this.lastPanPoint = { x: event.pageX, y: event.pageY }

    const wrapperClientOffset = this.getCanvasWrapperOffset()
    const options = {
      containerWidth: wrapperClientOffset.width,
      containerHeight: wrapperClientOffset.height,
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

  drawPaintBrushPathUsingLine = (ctx: Object, currentPoint: Object, lastPoint: Object, paintBrushWidth: number, paintBrushShape: number, clip: boolean, color: string) => {
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

    setTimeout(() => {
      const newImageList = eraseIntersection(imagePathList, groupAreaPath)
      const updatePathList = eraseIntersection(newImageList, selectedAreaPath)

      const idsToUngroup = groupSelectList.map((item) => {
        return item.id
      })

      const newGroupAreaList = groupAreaList.filter(item => {
        return (idsToUngroup.indexOf(item.id) === -1)
      })

      const newImagePathList = remove(updatePathList, (currImagePath) => {
        return currImagePath.length !== 0
      })
      this.setState({ imagePathList: newImagePathList, groupSelectList: [], selectedArea: [], groupAreaList: newGroupAreaList, isAddGroup: false, isUngroup: false })
    }, 0)
  }

  groupHandler = (groupName) => {
    switch (groupName) {
      case deleteGroup:
        this.deleteGroup()
        break
      case group:
        this.group()
        break
      case ungroup:
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
    let width
    let height

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
    this.CFICanvas.current.style.width = `${Math.floor(factors.widthFactor * 100)}%`
    this.CFICanvas.current.style.height = `${Math.floor(factors.heightFactor * 100)}%`
    this.CFICanvas.current.style.left = `${Math.floor(factors.xFactor * 100)}%`
    this.CFICanvas.current.style.top = `${Math.floor(factors.yFactor * 100)}%`
    this.CFICanvas2.current.style.width = `${Math.floor(factors.widthFactor * 100)}%`
    this.CFICanvas2.current.style.height = `${Math.floor(factors.heightFactor * 100)}%`
    this.CFICanvas2.current.style.left = `${Math.floor(factors.xFactor * 100)}%`
    this.CFICanvas2.current.style.top = `${Math.floor(factors.yFactor * 100)}%`
  }

  render () {
    const { imageUrl, lpActiveColor } = this.props
    const { activeTool, position, paintBrushShape, paintBrushWidth, eraseBrushShape, eraseBrushWidth, undoIsEnabled, redoIsEnabled, showOriginalCanvas, zoomRange, isAddGroup, isDeleteGroup, isUngroup, paintCursor } = this.state
    const lpActiveColorRGB = (lpActiveColor) ? `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})` : ``
    const backgroundColorBrush = (activeTool === eraseTool) ? `rgba(255, 255, 255, 0.7)` : lpActiveColorRGB
    const { paintBrushActiveClass, paintBrushCircleActiveClass } = this.getPaintBrushActiveClass()
    const { eraseBrushActiveClass, eraseBrushCircleActiveClass } = this.getEraseBrushActiveClass()
    return (
      <div role='presentation' className={`${baseClass}`} onClick={this.handleClick} onMouseMove={this.mouseMoveHandler} ref={this.CFIWrapper} style={{ height: this.state.wrapperHeight }}>
        <canvas className={`${canvasClass} ${showOriginalCanvas ? `${canvasShowByZindex}` : `${canvasHideByZindex}`} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-first' ref={this.CFICanvas} />
        <canvas onMouseDown={this.onPanStart} style={{ opacity: 0.8 }} className={`${canvasClass} ${paintCursor} ${canvasSecondClass} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-second' ref={this.CFICanvas2} />
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
            zoomRange={zoomRange}
            groupHandler={this.groupHandler}
            isAddGroup={isAddGroup}
            isDeleteGroup={isDeleteGroup}
            isUngroup={isUngroup}
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
