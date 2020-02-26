// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import './PaintScene.scss'
import uniqueId from 'lodash/uniqueId'
import PaintToolBar from './PaintToolBar'
import remove from 'lodash/remove'
import { injectIntl } from 'react-intl'

import {
  createImageDataAndAlphaPixelMapFromImageData,
  drawAcrossLine,
  getColorsFromImagePathList, getLABFromColor
} from './PaintSceneUtils'
import { getPaintAreaPath, repaintImageByPath,
  createPolygon, drawLine, edgeDetect,
  pointInsideCircle, alterRGBByPixel,
  getImageCordinateByPixel, eraseIntersection,
  getActiveColorRGB, getSelectArea, hexToRGB,
  checkIntersection, drawImagePixelByPath,
  copyImageList, getColorAtPixel, colorMatch,
  repaintCircleLine, getImageCordinateByPixelPaintBrush,
  createImagePathItem,
  filterErasePath,
  updateDeleteAreaList } from './utils'
import { toolNames, groupToolNames, brushLargeSize, brushMediumSize, brushSmallSize, brushTinySize, brushRoundShape, brushSquareShape, setTooltipShownLocalStorage, getTooltipShownLocalStorage } from './data'
import { getScaledPortraitHeight, getScaledLandscapeHeight } from '../../shared/helpers/ImageUtils'
import throttle from 'lodash/throttle'
import { checkUndoIsEnabled, redo, undo } from './UndoRedoUtil'
import MergeCanvas from '../MergeCanvas/MergeCanvas'
import { saveMasks, selectSavedScene, startSavingMasks } from '../../store/actions/persistScene'
import PaintSceneFooter from './PaintSceneFooter'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import SaveMasks from './SaveMasks'
import { createCustomSceneMetadata, createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
import MergeColors from '../MergeCanvas/MergeColors'
import storageAvailable from '../../shared/utils/browserStorageCheck.util'
import DynamicModal, { DynamicModalButtonType } from '../DynamicModal/DynamicModal'
import { checkCanMergeColors, shouldPromptToReplacePalette } from '../LivePalette/livePaletteUtility'
import { LP_MAX_COLORS_ALLOWED } from '../../constants/configurations'
import { mergeLpColors, replaceLpColors } from '../../store/actions/live-palette'
import { RouteContext } from '../../contexts/RouteContext/RouteContext'
import { clearSceneWorkspace } from '../../store/actions/paintScene'

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
const animationPin = `${baseClass}--animation-pin`
const nonAnimationPin = `${baseClass}--non-animation-pin`
const disableTextSelect = `${baseClass}--disable-text-select`
const disableClick = `${baseClass}--disable-click`
const showCursor = `${baseClass}--show-cursor`
const hideCursor = `${baseClass}--hide-cursor`

type ComponentProps = {
  imageUrl: string,
  lpActiveColor: Object,
  referenceDimensions: Object,
  width: number,
  intl: any,
  saveMasks: Function,
  savingMasks: boolean,
  startSavingMasks: Function,
  workspace: Object,
  lpColors: Object[],
  mergeLpColors: Function,
  replaceLpColors: Function,
  selectSavedScene: Function,
  clearSceneWorkspace: Function
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
  initialCanvasHeight: number,
  mergeCanvasKey: string,
  canvasImageUrls: string[],
  canvasHeight: number,
  canvasHeight: number,
  loadingMasks: boolean,
  canvasHasBeenInitialized: boolean,
  hideSelectPaletteModal: boolean,
  uniqueSceneId: string
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

    const initialImageWidth = props.workspace ? props.workspace.width : props.referenceDimensions.imageWidth
    const initialImageHeight = props.workspace ? props.workspace.height : this.props.referenceDimensions.imageHeight
    const isPortrait = props.workspace ? props.workspace.height > props.workspace.width : props.referenceDimensions.isPortrait
    // eslint-disable-next-line no-unused-vars
    const { lpColors } = props

    this.CFICanvas = React.createRef()
    this.CFICanvas2 = React.createRef()
    this.CFICanvasPaint = React.createRef()
    this.CFICanvas4 = React.createRef()
    this.CFIWrapper = React.createRef()
    this.CFIImage = React.createRef()
    this.CFIImage2 = React.createRef()
    this.mergeCanvasRef = React.createRef()
    this.mergeCanvasRefModal = React.createRef()
    this.wrapperDimensions = {}
    this.canvasDimensions = {}
    this.canvasOriginalDimensions = {}
    this.wrapperOriginalDimensions = {}
    this.backgroundImageWidth = initialImageWidth
    this.backgroundImageHeight = initialImageHeight
    this.isPortrait = isPortrait
    this.originalIsPortrait = props.workspace ? (props.workspace.height > props.workspace.width) : props.referenceDimensions.originalIsPortrait
    this.canvasPanStart = { x: 0.5, y: 0.5 }
    this.lastPanPoint = { x: 0, y: 0 }
    this.pause = false
    this.worker = null

    this.state = {
      imageStatus: 'loading',
      activeTool: toolNames.PAINTAREA,
      position: { left: 0, top: 0, isHidden: false },
      paintBrushWidth: brushLargeSize,
      isDragging: false,
      drawCoordinates: [],
      paintBrushShape: brushRoundShape,
      eraseBrushShape: brushRoundShape,
      eraseBrushWidth: brushLargeSize,
      redoHistory: [],
      pixelDataHistory: [],
      pixelDataRedoHistory: [],
      undoIsEnabled: false,
      redoIsEnabled: false,
      lineStart: [],
      BeginPointList: [],
      polyList: [],
      presentPolyList: [],
      imagePathList: [],
      redoPathList: [],
      showOriginalCanvas: false,
      canvasZoom: 1,
      canvasMouseDown: false,
      selectedArea: [],
      groupAreaList: [],
      groupSelectList: [],
      clearUndoList: [],
      wrapperHeight: initialImageHeight,
      isUngroup: false,
      isAddGroup: false,
      isDeleteGroup: false,
      paintCursor: `${canvasClass}--${toolNames.INFO}`,
      isInfoToolActive: true,
      initialCanvasWidth: 0,
      initialCanvasHeight: 0,
      mergeCanvasKey: '1',
      canvasImageUrls: [],
      groupIds: [],
      deleteAreaList: [],
      showAnimatePin: false,
      showNonAnimatePin: false,
      pinX: 0,
      pinY: 0,
      currPinX: 0,
      currPinY: 0,
      canvasWidth: initialImageWidth,
      canvasHeight: initialImageHeight,
      loadingMasks: !!props.workspace && !!props.workspace.layers && !!props.workspace.layers.length,
      canvasHasBeenInitialized: false,
      showSelectPaletteModal: false,
      checkIsPaintSceneUpdate: false,
      uniqueSceneId: createUniqueSceneId()
    }

    this.undo = this.undo.bind(this)
    this.redo = this.redo.bind(this)
    this.redrawCanvas = this.redrawCanvas.bind(this)
    this.initCanvas = this.initCanvas.bind(this)
    this.initCanvasWithDimensions = this.initCanvasWithDimensions.bind(this)
    this.shouldCanvasResize = this.shouldCanvasResize.bind(this)
    this.calcCanvasNewDimensions = this.calcCanvasNewDimensions.bind(this)
    this.scaleCanvases = this.scaleCanvases.bind(this)
    this.getLayers = this.getLayers.bind(this)
    this.renderMergeCanvas = this.renderMergeCanvas.bind(this)
    this.exportImagePaths = this.exportImagePaths.bind(this)
    this.processMasks = this.processMasks.bind(this)
    this.initCanvas2 = this.initCanvas2.bind(this)
    this.importLayers = this.importLayers.bind(this)
    this.getSelectPaletteModalConfig = this.getSelectPaletteModalConfig.bind(this)
    this.loadPalette = this.loadPalette.bind(this)
    this.tryToMergeColors = this.tryToMergeColors.bind(this)
  }

  tryToMergeColors () {
    // eslint-disable-next-line no-new-object
    const { workspace, lpColors } = this.props
    if (workspace) {
      if (checkCanMergeColors(lpColors, workspace.palette, LP_MAX_COLORS_ALLOWED)) {
        this.props.mergeLpColors(workspace.palette)
      } else {
        if (shouldPromptToReplacePalette(lpColors, workspace.palette, LP_MAX_COLORS_ALLOWED)) {
          this.setState({ showSelectPaletteModal: true })
        }
      }
    }
  }

  getSelectPaletteModalConfig () {
    const { intl } = this.props

    const selectPaletteActions = [{ callback: (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.setState({ showSelectPaletteModal: false })
    },
    text: intl.messages['PAINT_SCENE.CANCEL'],
    type: DynamicModalButtonType.primary },
    { callback: (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.loadPalette()
      this.setState({ showSelectPaletteModal: false })
    },
    text: intl.messages['PAINT_SCENE.OK'],
    type: DynamicModalButtonType.primary }]

    return {
      selectPaletteActions,
      selectPaletteTitle: intl.messages['PAINT_SCENE.SELECT_PALETTE_TITLE'],
      selectPaletteDescription: intl.messages['PAINT_SCENE.SELECT_PALETTE_DESC']
    }
  }

  loadPalette () {
    const { workspace: { palette } } = this.props
    this.props.replaceLpColors(palette)
  }

  /*:: shouldCanvasResize: (prevWidth: number, newWidth: number) => number */
  shouldCanvasResize (prevWidth: number, newWidth: number) {
    if (newWidth !== prevWidth) {
      return newWidth
    }

    return 0
  }

  static getDerivedStateFromProps (props, state) {
    if (props.checkIsPaintSceneUpdate !== state.checkIsPaintSceneUpdate) {
      return {
        checkIsPaintSceneUpdate: props.checkIsPaintSceneUpdate
      }
    }
    return null
  }

  componentDidUpdate (prevProps: Object, prevState: Object) {
    if ((this.state.imagePathList.length > 0 && !this.props.workspace) || (this.state.imagePathList.length > 1 && this.props.workspace)) {
      this.context.setIsPaintScenePolluted()
    }
    if (prevState.checkIsPaintSceneUpdate !== this.state.checkIsPaintSceneUpdate && this.state.checkIsPaintSceneUpdate !== false) {
      if (this.state.imagePathList.length > 0) {
        this.context.showWarningModal(this.saveBase64(this.getLayers()))
      } else {
        this.context.loadNewCanvas()
      }
    }
    if (prevState.loading) {
      return
    }
    const newWidth = this.shouldCanvasResize(prevProps.width, this.props.width)
    if (newWidth) {
      this.scaleCanvases(newWidth)
    }
    const { imagePathList, selectedArea, groupSelectList } = this.state
    let copyImagePathList = copyImageList(imagePathList)
    const islpActiveColorAvailable = this.props.lpActiveColor && prevProps.lpActiveColor
    const islpActiveColorHexAvailable = islpActiveColorAvailable && prevProps.lpActiveColor.hex && this.props.lpActiveColor.hex
    const isActive = !!((selectedArea.length > 0 || groupSelectList.length > 0))
    if (islpActiveColorHexAvailable && prevProps.lpActiveColor.hex !== this.props.lpActiveColor.hex && isActive) {
      const ctx = this.CFICanvas2.current.getContext('2d')
      const RGB = getActiveColorRGB(hexToRGB(this.props.lpActiveColor.hex))
      for (let i = 0; i < this.state.groupSelectList.length; i++) {
        this.clearCanvas()
        drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, RGB, this.state.groupSelectList[i].selectPath)
        const [ newPath, pixelIndexAlphaMap ] = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight, true)
        copyImagePathList.push({
          type: 'paint',
          id: uniqueId(),
          color: RGB,
          colorRef: { ...this.props.lpActiveColor },
          data: newPath,
          pixelIndexAlphaMap: pixelIndexAlphaMap,
          isEnabled: true,
          linkedOperation: null,
          siblingOperations: null })
        this.clearCanvas()
      }

      for (let i = 0; i < this.state.selectedArea.length; i++) {
        this.clearCanvas()
        drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, RGB, this.state.selectedArea[i].selectPath)
        const [ newPath, pixelIndexAlphaMap ] = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight, true)
        copyImagePathList.push({
          type: 'paint',
          id: uniqueId(),
          color: RGB,
          colorRef: { ...this.props.lpActiveColor },
          data: newPath,
          pixelIndexAlphaMap: pixelIndexAlphaMap,
          isEnabled: true,
          linkedOperation: null,
          siblingOperations: null })
        this.clearCanvas()
      }

      repaintImageByPath(copyImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      // eslint-disable-next-line
      this.setState({ imagePathList: copyImagePathList })
    }
  }

  /*:: initCanvas: () => void */
  initCanvas () {
    this.CFICanvasContext = this.CFICanvas.current.getContext('2d')
    this.CFICanvasContext2 = this.CFICanvas2.current.getContext('2d')
    this.CFICanvasContextPaint = this.CFICanvasPaint.current.getContext('2d')
    this.CFICanvasContext4 = this.CFICanvas4.current.getContext('2d')
    this.canvasOffsetWidth = parseInt(this.wrapperDimensions.width, 10)
    this.canvasOffsetHeight = parseInt(this.wrapperDimensions.height, 10)
    this.initCanvasWithDimensions()
  }

  /*:: initCanvas2: () => void */
  initCanvas2 () {
    const { canvasWidth, canvasHeight } = this.calcCanvasNewDimensions()
    this.setForegroundImage(canvasWidth, canvasHeight)
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

    // Handle merge canvas
    this.mergeCanvasRef.current.width = canvasWidth
    this.mergeCanvasRef.current.height = canvasHeight
    this.canvasOriginalDimensions = { width: canvasWidth, height: canvasHeight }
    this.CFICanvas4.current.width = this.canvasOriginalDimensions.width
    this.CFICanvas4.current.height = this.canvasOriginalDimensions.height
    this.canvasOffsetWidth = canvasWidth
    this.canvasOffsetHeight = canvasHeight
    // this.canvasOriginalDimensions = { width: canvasWidth, height: canvasHeight }
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
    // this.CFICanvas4.current.style.width = `${canvasWidth}px`
    // this.CFICanvas4.current.style.height = `${canvasHeight}px`
    this.CFIWrapper.current.style.height = `${canvasHeight}px`
    this.setState({ canvasWidth, canvasHeight })
  }

  /*:: setBackgroundImage: (canvasWidth: number, canvasHeight: number) => void */
  setBackgroundImage (canvasWidth: number, canvasHeight: number) {
    this.CFICanvasContext.drawImage(this.CFIImage.current, 0, 0, canvasWidth, canvasHeight)
    this.CFICanvasContext2.clearRect(0, 0, canvasWidth, canvasHeight)
    this.CFICanvasContextPaint.clearRect(0, 0, canvasWidth, canvasHeight)

    this.setState({
      wrapperHeight: canvasHeight,
      canvasHeight,
      canvasWidth,
      canvasImageUrls: this.getLayers(),
      canvasHasBeenInitialized: true })
  }

  /*:: importLayers: (payload: Object) => void */
  importLayers (payload: Object) {
    const { palette } = this.props.workspace
    const colorLayers = payload.layersAsData.map(item => createImageDataAndAlphaPixelMapFromImageData(item))
    const imagePaths = colorLayers
      .map((item, i) => {
        return createImagePathItem(item.pixelMap, item.alphaPixelMap, palette[i], 'paint', 0, true, true)
      })
    repaintImageByPath(imagePaths, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
    this.setState({ canvasImageUrls: this.getLayers(), imagePathList: imagePaths, loadingMasks: false })
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
      if (storageAvailable('sessionStorage')) {
        // @todo candidate for redux? -RS
        window.sessionStorage.setItem('canvasOffsetPaintScene', JSON.stringify(canvasOffset))
      }
    }
  }

  getCanvasOffset = () => {
    const canvasOffset = storageAvailable('sessionStorage') && JSON.parse(window.sessionStorage.getItem('canvasOffsetPaintScene'))
    return canvasOffset
  }

  componentDidMount () {
    this.updateWindowDimensions()
    this.setDependentPositions()

    if (this.mergeCanvasRef.current) {
      this.mergeCanvasRef.current.style = 'opacity: 0'
    }
    this.initCanvas()
    this.tryToMergeColors()
    window.addEventListener('resize', this.resizeHandler)
    // @todo candidate for redux -RS
    if (storageAvailable('localStorage') && getTooltipShownLocalStorage() === null) {
      setTooltipShownLocalStorage()
    } else {
      this.setState({
        isInfoToolActive: false,
        paintCursor: `${canvasClass}--${toolNames.PAINTAREA}`
      })
    }
    if (this.props.workspace) {
      this.props.clearSceneWorkspace()
    }
    this.context.setIsPaintSceneActive()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeHandler)
    this.props.selectSavedScene(null)
    this.context.setIsPaintSceneActive()
    this.context.unSetIsPaintScenePolluted()
  }

  resizeHandler = () => {
    this.applyZoom(this.state.canvasZoom)
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
    let newImagePathList = copyImageList(imagePathList)
    let updateSelectArea = []
    this.CFICanvasContext4.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    this.setState({
      paintCursor: `${canvasClass}--${activeTool}`,
      lineStart: [],
      BeginPointList: [],
      polyList: [],
      presentPolyList: [],
      showAnimatePin: false,
      showNonAnimatePin: false
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
    if (activeTool !== toolNames.UNDO || activeTool !== toolNames.REDO) {
      newImagePathList = newImagePathList.filter(item => { return (item.type === 'paint' || item.type === 'delete' || item.type === 'delete-group') })
    }
    this.clearCanvas()
    repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, false, [], true)
    this.setState({ activeTool, selectedArea: updateSelectArea, canvasImageUrls: this.getLayers(), imagePathList: newImagePathList })
  }

  /*:: undo: () => void */
  undo () {
    const { clearUndoList, imagePathList } = this.state
    if (clearUndoList.length !== 0 && imagePathList.length === 0) {
      this.redrawCanvas(clearUndoList)
      const newImageList = copyImageList(clearUndoList)
      this.setState({ clearUndoList: [], imagePathList: newImageList })
    } else {
      const stateFragment = undo(this.state)
      // Create a new key to ensure a new merge canvas component instance is created
      stateFragment.mergeCanvasKey = `${Date.now()}`
      this.setState(stateFragment, () => {
        this.redrawCanvas(stateFragment.imagePathList)
      })
    }
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
    const { groupIds } = this.state
    this.clearCanvas()
    repaintImageByPath(imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, false, groupIds)
    this.setActiveGroupTool()
    this.setState({ canvasImageUrls: this.getLayers() })
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
    if ((this.props.lpActiveColor === null || (this.props.lpActiveColor.constructor === Object && Object.keys(this.props.lpActiveColor).length === 0)) && activeTool === toolNames.PAINTBRUSH) return
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
    if ((this.props.lpActiveColor === null || (this.props.lpActiveColor.constructor === Object && Object.keys(this.props.lpActiveColor).length === 0)) && activeTool === toolNames.PAINTBRUSH) return
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
    const drawPath = getImageCordinateByPixelPaintBrush(this.CFICanvasPaint, this.canvasOffsetWidth, this.canvasOffsetHeight, false)
    for (let i = 0; i < groupAreaList.length; i++) {
      const isHasIntersection = checkIntersection(groupAreaList[i].selectPath, drawPath)
      if (isHasIntersection) {
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
    window.removeEventListener('mouseup', this.mouseUpHandler)
    const { drawCoordinates, imagePathList, activeTool, deleteAreaList } = this.state
    let newDeleteAreaList = copyImageList(deleteAreaList)
    let paintPath = []
    const { lpActiveColor } = this.props
    if ((this.props.lpActiveColor === null || (this.props.lpActiveColor.constructor === Object && Object.keys(this.props.lpActiveColor).length === 0)) && activeTool === toolNames.PAINTBRUSH) {
      this.setState({
        isDragging: false
      })
      return
    }
    let newImagePathList
    const { newGroupSelectList, newGroupAreaList } = this.breakGroupIfhasIntersection()
    this.clearCanvas()
    if (lpActiveColor && activeTool === toolNames.PAINTBRUSH && drawCoordinates.length > 0) {
      const paintData = getPaintAreaPath(imagePathList, this.CFICanvasPaint, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.lpActiveColor)
      newImagePathList = paintData.newImagePathList
      paintPath = paintData.paintPath
      newDeleteAreaList = updateDeleteAreaList(paintPath, deleteAreaList)
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, false)
    }

    if (activeTool === toolNames.ERASE && drawCoordinates.length > 0) {
      const RGB = getActiveColorRGB({ red: 255, blue: 255, green: 255 })
      const erasePathWithAlpha = getImageCordinateByPixel(this.CFICanvasPaint, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight, true)
      let erasePath = []
      Object.keys(erasePathWithAlpha[1]).forEach(key => {
        if (erasePathWithAlpha[1][key] > 126) {
          erasePath.push(parseInt(key))
        }
      })
      const updateErasePath = filterErasePath(erasePath, deleteAreaList)
      const tmpImagePathList = eraseIntersection(imagePathList, updateErasePath)
      newImagePathList = remove(tmpImagePathList, (currImagePath) => {
        return currImagePath.data.length !== 0
      })
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, true)
    }
    this.CFICanvasContextPaint.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)

    this.setState({ isDragging: false,
      imagePathList: newImagePathList,
      groupAreaList: newGroupAreaList,
      deletAreaList: newDeleteAreaList,
      groupSelectList: newGroupSelectList,
      redoPathList: [],
      undoIsEnabled: checkUndoIsEnabled(newImagePathList),
      redoIsEnabled: false
    })
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
    const { imagePathList } = this.state
    const undolist = copyImageList(imagePathList)
    this.CFICanvasContext2.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    if (clearCanvasDrawing) {
      this.setState({
        imagePathList: [],
        selectedArea: [],
        clearUndoList: undolist,
        redoPathList: [],
        redoIsEnabled: false
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
    const { imagePathList, selectedArea, groupAreaList, groupSelectList, groupIds } = this.state
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
    const { clientX, clientY } = e
    const cursorX = parseInt((clientX - canvasClientOffset.left) * scale)
    const cursorY = parseInt((clientY - canvasClientOffset.top) * scale)
    const imageData = this.CFICanvasContext2.getImageData(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    let newImagePathList = copyImageList(imagePathList)
    const index = (cursorX + cursorY * this.canvasOffsetWidth) * 4
    let isClickInsideImage = false
    let isClickGroupArea = false

    const { r, g, b, a } = getColorAtPixel(imageData, cursorX, cursorY)
    if (r === 0 && g === 0 && b === 0 && a === 0) {
      return
    } else {
      isClickInsideImage = true
    }

    if (isClickInsideImage) {
      let tmpEdgeArea
      let tmpSelectPath
      let tmpId
      let ancestorId
      let tmplinkGroupId
      for (let i = 0; i < groupAreaList.length; i++) {
        if (groupAreaList[i].selectPath.includes(index)) {
          tmpSelectPath = groupAreaList[i].selectPath
          tmpEdgeArea = groupAreaList[i].edgeList
          tmpId = uniqueId()
          ancestorId = groupAreaList[i].id
          tmplinkGroupId = groupAreaList[i].linkGroupId
          isClickGroupArea = true
          break
        }
      }
      if (isClickGroupArea) {
        let hasAdd = false
        for (let i = 0; i < groupSelectList.length; i++) {
          if (groupSelectList[i].selectPath.includes(index)) {
            let toggleSelectId = groupSelectList[i].id
            newImagePathList = newImagePathList.map((item) => item.id === toggleSelectId ? { ...item, isEnabled: false } : item)
            newImagePathList.push({
              type: 'unselect-group',
              data: groupSelectList[i].selectPath,
              color: [],
              id: uniqueId(),
              toggleSelectId: toggleSelectId,
              isEnabled: true,
              linkedOperation: null,
              siblingOperations: null })
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
            id: tmpId,
            ancestorId: ancestorId,
            linkGroupId: tmplinkGroupId
          })
          newImagePathList.push(
            { type: 'select-group',
              data: tmpEdgeArea,
              redoPath: tmpSelectPath,
              color: [255, 255, 255, 255],
              linkGroupId: tmplinkGroupId,
              id: tmpId,
              ancestorId: ancestorId,
              isEnabled: true,
              linkedOperation: null,
              siblingOperations: null })
        }
        this.setState({ groupSelectList, imagePathList: newImagePathList })
      }

      if (!isClickGroupArea) {
        if (selectedArea.length > 0) {
          let hasAdd = false
          let linkId
          for (let i = 0; i < selectedArea.length; i++) {
            if (selectedArea[i].selectPath.includes(index)) {
              linkId = selectedArea[i].id
              hasAdd = true
              newImagePathList = newImagePathList.map((item) => item.id === linkId ? { ...item, isEnabled: false } : item)
              newImagePathList.push({
                type: 'unselect',
                data: selectedArea[i].selectPath,
                color: [],
                id: uniqueId(),
                toggleSelectId: linkId,
                isEnabled: true,
                linkedOperation: null,
                siblingOperations: null })
              selectedArea.splice(i, 1)
              break
            }
          }

          if (!hasAdd) {
            const imagePath = getSelectArea(imageData, { r: 255, g: 0, b: 0 }, cursorX, cursorY)
            const edge = edgeDetect(this.CFICanvas2, imagePath, [255, 0, 0, 255], this.canvasOffsetWidth, this.canvasOffsetHeight)
            const linkId = uniqueId()
            selectedArea.push({
              id: linkId,
              edgeList: edge,
              selectPath: imagePath
            })
            newImagePathList.push(
              { type: 'select',
                data: edge,
                redoPath: imagePath,
                color: [255, 255, 255, 255],
                id: linkId,
                isEnabled: true,
                linkedOperation: null,
                siblingOperations: null })
          }
          this.setState({ selectedArea, imagePathList: newImagePathList, undoIsEnabled: checkUndoIsEnabled(newImagePathList), redoPathList: [], redoIsEnabled: false })
        } else {
          const imagePath = getSelectArea(imageData, { r: 255, g: 0, b: 0 }, cursorX, cursorY)
          const edge = edgeDetect(this.CFICanvas2, imagePath, [255, 0, 0, 255], this.canvasOffsetWidth, this.canvasOffsetHeight)
          const linkId = uniqueId()
          selectedArea.push({
            id: linkId,
            edgeList: edge,
            selectPath: imagePath
          })
          newImagePathList.push(
            { type: 'select',
              data: edge,
              redoPath: imagePath,
              color: [255, 255, 255, 255],
              id: linkId,
              isEnabled: true,
              linkedOperation: null,
              siblingOperations: null })
          this.setState({ selectedArea, imagePathList: newImagePathList, undoIsEnabled: checkUndoIsEnabled(newImagePathList), redoPathList: [], redoIsEnabled: false })
        }
      }
    }

    this.clearCanvas()
    repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, false, groupIds)
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
    if (this.props.lpActiveColor === null || (this.props.lpActiveColor.constructor === Object && Object.keys(this.props.lpActiveColor).length === 0)) return
    const { BeginPointList, polyList, lineStart, imagePathList, presentPolyList, deleteAreaList } = this.state
    let newDeleteAreaList = copyImageList(deleteAreaList)
    const { clientX, clientY } = e
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const canvasClientOffset4 = this.CFICanvas4.current.getBoundingClientRect()
    const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
    const cursorX = (clientX - canvasClientOffset.left) * scale
    const cursorY = (clientY - canvasClientOffset.top) * scale
    const X = clientX - canvasClientOffset4.left
    const Y = clientY - canvasClientOffset4.top
    const poly = [...polyList]
    const presentPoly = [...presentPolyList]
    poly.push([cursorX, cursorY])
    presentPoly.push([X, Y])
    let ctxDraw = this.CFICanvas4.current.getContext('2d')
    let isBackToStart = false
    if (BeginPointList.length > 0) {
      isBackToStart = pointInsideCircle(X, Y, BeginPointList, 10)
    }
    if (isBackToStart) {
      this.pause = true
      this.clearCanvas()
      this.CFICanvasContext4.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      let tmpImagePathList
      let newImagePathList
      this.CFICanvasContextPaint.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      createPolygon(polyList, this.CFICanvasPaint, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.lpActiveColor.hex, 'source-over')
      if (!isAddArea) {
        const RGB = getActiveColorRGB(hexToRGB(this.props.lpActiveColor.hex))
        const erasePath = getImageCordinateByPixel(this.CFICanvasPaint, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight, false)
        this.CFICanvasContextPaint.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
        tmpImagePathList = eraseIntersection(imagePathList, erasePath)
        newImagePathList = remove(tmpImagePathList, (currImagePath) => {
          return currImagePath.data.length !== 0
        })
      } else {
        const paintData = getPaintAreaPath(imagePathList, this.CFICanvasPaint, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.lpActiveColor)
        newImagePathList = paintData.newImagePathList
        const paintPath = paintData.paintPath
        newDeleteAreaList = updateDeleteAreaList(paintPath, deleteAreaList)
        this.CFICanvasContextPaint.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      }
      this.clearCanvas()
      this.CFICanvasContext4.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)

      this.setState(
        {
          polyList: [],
          presentPolyList: [],
          lineStart: [],
          BeginPointList: [],
          imagePathList: newImagePathList,
          deleteAreaList: newDeleteAreaList,
          showAnimatePin: false,
          showNonAnimatePin: false,
          undoIsEnabled: checkUndoIsEnabled(newImagePathList)
        }
      )
      return
    } else {
      this.CFICanvasContextPaint.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.CFICanvasContext4.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      if (BeginPointList.length > 0) {
        this.dropPin(BeginPointList[0], BeginPointList[1], BeginPointList.length > 0)
      }
      presentPoly.length > 2 && repaintCircleLine(ctxDraw, BeginPointList, presentPoly.slice(1, -1))
      const canvasWrapperOffset = this.getCanvasWrapperOffset()
      const leftOffset = clientX - canvasWrapperOffset.x
      const topOffset = clientY - canvasWrapperOffset.y
      this.dropPin(leftOffset, topOffset, BeginPointList.length > 0)
      if (lineStart.length > 0) {
        ctxDraw.beginPath()
        const end = [X, Y]
        drawLine(ctxDraw, lineStart, end, true)
      } else {
        this.setState({ BeginPointList: [X, Y] })
      }
      ctxDraw.restore()
    }
    this.setState({ lineStart: [X, Y],
      polyList: poly,
      presentPolyList: presentPoly
    })
  }

  handlePaintArea = throttle((e: Object) => {
    const { imagePathList } = this.state
    if (this.props.lpActiveColor === null || (this.props.lpActiveColor.constructor === Object && Object.keys(this.props.lpActiveColor).length === 0)) return
    let imagePath = []
    const { clientX, clientY } = e
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const scale = this.canvasOriginalDimensions.width / canvasClientOffset.width
    const cursorX = Math.round((clientX - canvasClientOffset.left) * scale)
    const cursorY = Math.round((clientY - canvasClientOffset.top) * scale)
    const mergeContext = this.mergeCanvasRef.current.getContext('2d')
    const imageData = mergeContext.getImageData(0, 0, mergeContext.canvas.width, mergeContext.canvas.height)

    let copyImagePathList = copyImageList(imagePathList)
    const RGB = getActiveColorRGB(hexToRGB(this.props.lpActiveColor.hex))
    const ctx = this.CFICanvas2.current.getContext('2d')
    const isPaint = colorMatch(getColorAtPixel(imageData, cursorX, cursorY), { r: RGB[0], g: RGB[1], b: RGB[2], a: RGB[3] }, 100)

    if (!isPaint) {
      imagePath = getSelectArea(imageData, RGB, cursorX, cursorY, 94)

      this.clearCanvas()
      drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, RGB, imagePath)
      const newPath = getImageCordinateByPixel(this.CFICanvas2, RGB, this.canvasOffsetWidth, this.canvasOffsetHeight, false)
      // @todo [IMRPOVEMENT]- candidate for createImagePath factory -RS
      copyImagePathList.push({
        type: 'paint',
        id: uniqueId(),
        color: RGB,
        colorRef: { ...this.props.lpActiveColor },
        data: newPath,
        isEnabled: true,
        linkedOperation: null,
        siblingOperations: null })
      this.clearCanvas()
      repaintImageByPath(copyImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.setState({ imagePathList: copyImagePathList,
        undoIsEnabled: checkUndoIsEnabled(copyImagePathList),
        redoIsEnabled: false,
        mergeCanvasKey: `${Date.now()}`,
        canvasImageUrls: this.getLayers()
      })
    }
  }, 10)

  dropPin = (x, y, isAnimate) => {
    if (isAnimate) {
      this.setState({
        pinX: x,
        pinY: y,
        showAnimatePin: true,
        showNonAnimatePin: true
      })
    } else {
      this.setState({
        currPinX: x,
        currPinY: y,
        showAnimatePin: isAnimate,
        showNonAnimatePin: true
      })
    }
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
    if (paintBrushWidth === brushLargeSize) {
      paintBrushActiveClass = paintBrushLargeClass
      if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushLargeCircleClass
    } else if (paintBrushWidth === brushMediumSize) {
      paintBrushActiveClass = paintBrushMediumClass
      if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushMediumCircleClass
    } else if (paintBrushWidth === brushSmallSize) {
      paintBrushActiveClass = paintBrushSmallClass
      if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushSmallCircleClass
    } else if (paintBrushWidth === brushTinySize) {
      paintBrushActiveClass = paintBrushTinyClass
      if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushTinyCircleClass
    }
    return { paintBrushActiveClass: paintBrushActiveClass, paintBrushCircleActiveClass: paintBrushCircleActiveClass }
  }

  getEraseBrushActiveClass = () => {
    const { eraseBrushWidth, eraseBrushShape } = this.state
    let eraseBrushActiveClass = ''
    let eraseBrushCircleActiveClass = ''
    if (eraseBrushWidth === brushLargeSize) {
      eraseBrushActiveClass = paintBrushLargeClass
      if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushLargeCircleClass
    } else if (eraseBrushWidth === brushMediumSize) {
      eraseBrushActiveClass = paintBrushMediumClass
      if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushMediumCircleClass
    } else if (eraseBrushWidth === brushSmallSize) {
      eraseBrushActiveClass = paintBrushSmallClass
      if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushSmallCircleClass
    } else if (eraseBrushWidth === brushTinySize) {
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
    const { selectedArea, groupSelectList, groupAreaList, imagePathList, groupIds } = this.state
    let copyImagePathList = copyImageList(imagePathList)
    let newImagePathList
    let newGroupIds = [...groupIds]
    let newGroupAreaList = [...groupAreaList]
    let groupAreaPath = []
    let groupEdgeList = []
    let linkGroupId = []
    for (let i = 0; i < selectedArea.length; i++) {
      const targetPath = selectedArea[i].selectPath
      const edgeList = selectedArea[i].edgeList
      const selectId = selectedArea[i].id
      groupAreaPath = [...targetPath, ...groupAreaPath]
      groupEdgeList = [...edgeList, ...groupEdgeList]
      newGroupIds.push(selectId)
      linkGroupId.push(selectId)
    }

    if (groupSelectList.length > 0) {
      newImagePathList = copyImagePathList.map((history) => (history.type === 'select-group') ? { ...history, isEnabled: false } : history)

      for (let j = 0; j < groupSelectList.length; j++) {
        linkGroupId = [...linkGroupId.concat(groupSelectList[j].linkGroupId)]
        const targetPath = groupSelectList[j].selectPath
        const edgeList = groupSelectList[j].edgeList
        groupAreaPath = [...targetPath, ...groupAreaPath]
        groupEdgeList = [...edgeList, ...groupEdgeList]
        for (let index = 0; index < newGroupAreaList.length; index++) {
          if (newGroupAreaList[index].id === groupSelectList[j].ancestorId) {
            newGroupAreaList.splice(index, 1)
            index--
          }
        }
      }
    } else {
      newImagePathList = copyImageList(copyImagePathList)
    }

    if (groupAreaPath.length > 0) {
      const copySelectedArea = copyImageList(selectedArea)
      const copyGroupSelectList = copyImageList(groupSelectList)
      const ancestorId = uniqueId()
      newGroupAreaList.push({
        edgeList: groupEdgeList,
        selectPath: groupAreaPath,
        id: ancestorId,
        linkGroupId: linkGroupId
      })

      const id = uniqueId()
      newGroupSelectList.push({
        edgeList: groupEdgeList,
        selectPath: groupAreaPath,
        id: id,
        ancestorId: ancestorId,
        linkGroupId: linkGroupId
      })

      newImagePathList.push({
        type: 'select-group',
        subType: 'create-group',
        selectedArea: copySelectedArea,
        groupSelectList: copyGroupSelectList,
        groupAreaList: newGroupAreaList,
        data: groupEdgeList,
        redoPath: groupAreaPath,
        id: id,
        linkGroupId: linkGroupId,
        color: [255, 255, 255, 255],
        isEnabled: true,
        linkedOperation: null,
        ancestorId: ancestorId,
        siblingOperations: null
      })
    }
    this.setState({
      groupAreaList: newGroupAreaList,
      groupSelectList: newGroupSelectList,
      selectedArea: [],
      isUngroup: true,
      groupIds: newGroupIds,
      imagePathList: newImagePathList
    })
  }

  ungroup = () => {
    const { groupSelectList, groupAreaList, imagePathList } = this.state
    let copyImagePathList = copyImageList(imagePathList)
    let newGroupIds = []
    let removedIds = []
    let newImagePathList
    const idsToUngroup = groupSelectList.map((item) => {
      return item.ancestorId
    })

    for (let i = 0; i < groupAreaList.length; i++) {
      const idToModify = groupAreaList[i].linkGroupId
      if (idsToUngroup.includes(groupAreaList[i].id)) {
        removedIds = [...removedIds.concat(idToModify)]
      } else {
        newGroupIds = [...newGroupIds.concat(idToModify)]
      }
    }

    const newGroupAreaList = groupAreaList.filter(item => {
      return (idsToUngroup.indexOf(item.id) === -1)
    })

    const unGroupedAreaList = groupAreaList.filter(area => idsToUngroup.includes(area.id))
    newImagePathList = copyImagePathList.map((history) => {
      if (history.type === 'select' && removedIds.includes(history.id)) {
        return { ...history, isEnabled: false }
      } else if (history.type === 'select-group') {
        return { ...history, isEnabled: false }
      } else {
        return history
      }
    })

    const getSelectAreaPathById = (ancestorId) => {
      for (let j = 0; j < groupSelectList.length; j++) {
        if (ancestorId === groupSelectList[j].ancestorId) {
          return groupSelectList[j]
        }
      }
      return []
    }

    unGroupedAreaList.forEach(area => {
      const id = uniqueId()
      const groupSelect = getSelectAreaPathById(area.id)
      newImagePathList.push({
        type: 'ungroup',
        data: [],
        redoPath: [],
        id: id,
        groupIds: area.linkGroupId,
        groupAreaList: area,
        groupSelectList: groupSelect,
        color: [255, 255, 255, 255],
        isEnabled: true,
        linkedOperation: null,
        ancestorId: groupSelect.id,
        siblingOperations: null
      })
    })

    this.clearCanvas()
    repaintImageByPath(newImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, false, newGroupIds)
    this.setState({ groupAreaList: newGroupAreaList, groupSelectList: [], isUngroup: false, groupIds: newGroupIds, imagePathList: newImagePathList })
  }

  deleteGroup = () => {
    const { imagePathList, groupSelectList, selectedArea, groupIds, groupAreaList, deleteAreaList } = this.state
    let updateImagePathList = copyImageList(imagePathList)
    let newGroupIds = []

    for (let i = 0; i < groupSelectList.length; i++) {
      const deletePath = [...groupSelectList[i].selectPath, ...groupSelectList[i].edgeList]
      const id = uniqueId()
      updateImagePathList.push({
        type: 'delete-group',
        data: [...groupSelectList[i].selectPath, ...groupSelectList[i].edgeList],
        redoPath: groupSelectList[i].selectPath,
        id: uniqueId(),
        linkGroupId: null,
        color: [255, 255, 255, 0],
        groupSelectList: groupSelectList,
        groupAreaList: groupAreaList,
        groupIds: groupIds,
        isEnabled: true,
        linkedOperation: null,
        ancestorId: null,
        siblingOperations: null
      })
      deleteAreaList.push({
        id: id,
        data: deletePath
      })
    }

    for (let i = 0; i < selectedArea.length; i++) {
      const deletePath = [...selectedArea[i].selectPath, ...selectedArea[i].edgeList]
      const id = uniqueId()
      updateImagePathList.push({
        type: 'delete',
        data: deletePath,
        redoPath: selectedArea[i].selectPath,
        id: id,
        linkGroupId: null,
        color: [255, 255, 255, 0],
        isEnabled: true,
        linkedOperation: null,
        ancestorId: null,
        siblingOperations: null
      })
      deleteAreaList.push({
        id: id,
        data: deletePath
      })
    }
    const idsToUngroup = groupSelectList.map((item) => {
      return item.ancestorId
    })

    const newGroupAreaList = groupAreaList.filter(item => {
      return (idsToUngroup.indexOf(item.id) === -1)
    })

    for (let i = 0; i < groupAreaList.length; i++) {
      const idToModify = groupAreaList[i].linkGroupId
      if (!idsToUngroup.includes(groupAreaList[i].id)) {
        newGroupIds = [...newGroupIds.concat(idToModify)]
      }
    }

    this.clearCanvas()
    repaintImageByPath(updateImagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, true, groupIds)
    this.setState({
      imagePathList: updateImagePathList,
      selectedArea: [],
      groupSelectList: [],
      groupAreaList: newGroupAreaList,
      deletAreaList: deleteAreaList,
      groupIds: newGroupIds })
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

  getLayers () {
    if (!this.CFICanvas.current || !this.CFICanvas2.current) {
      return []
    }
    const imageUrls = [this.CFICanvas.current.toDataURL(), this.CFICanvas2.current.toDataURL()]
    return imageUrls
  }

  renderMergeCanvas (imageUrls: string[]) {
    if (this.state.activeTool === toolNames.PAINTAREA) {
      return (<MergeCanvas
        key={this.state.mergeCanvasKey}
        width={this.canvasOriginalDimensions.width}
        height={this.canvasOriginalDimensions.height}
        ref={this.mergeCanvasRef}
        applyZoomPan={this.applyZoomPan}
        layers={imageUrls} />)
    }

    return null
  }

  saveBase64 = (imageUrls: string[]) => {
    return ((<MergeCanvas
      key={this.state.mergeCanvasKey}
      width={this.canvasOriginalDimensions.width}
      height={this.canvasOriginalDimensions.height}
      ref={this.mergeCanvasRefModal}
      applyZoomPan={this.applyZoomPan}
      layers={imageUrls} />))
  }

  exportImagePaths () {
    return this.state.imagePathList
  }

  // This Method sorts the imagePathList by color to trigger the MergeColor component to instantiate and generate a flat (jpg) mask per color
  processMasks () {
    const colorList = getColorsFromImagePathList(this.state.imagePathList)
    const labColorList = colorList.map(color => getLABFromColor(color))

    let saveBackgroundOnly = false

    if (!labColorList.length) {
      saveBackgroundOnly = true
    }

    const backgroundImageUrl = this.CFICanvas.current.toDataURL('image/jpeg', 1.0)
    const ctx2 = this.CFICanvas2.current.getContext('2d')
    const imageData = !saveBackgroundOnly ? ctx2.getImageData(0, 0, ctx2.canvas.width, ctx2.canvas.height) : null
    const metaData = createCustomSceneMetadata('TEMP_NAME', this.state.uniqueSceneId, colorList, ctx2.canvas.width, ctx2.canvas.height)

    this.props.saveMasks(labColorList, imageData, backgroundImageUrl, metaData)
  }

  applyZoomPan = (ref: RefObject) => {
    const options = {
      containerWidth: this.wrapperOriginalDimensions.width,
      containerHeight: this.wrapperOriginalDimensions.height,
      canvasWidth: this.canvasOriginalDimensions.width,
      canvasHeight: this.canvasOriginalDimensions.height,
      zoom: this.state.canvasZoom,
      panX: this.canvasPanStart.x,
      panY: this.canvasPanStart.y
    }
    const factors = this.canvasDimensionFactors(options)
    this.applyDimensionFactorsByCanvas(factors, ref)
  }

  render () {
    const { lpActiveColor, intl } = this.props
    const bgImageUrl = this.props.workspace ? this.props.workspace.bgImageUrl : this.props.imageUrl
    const layers = this.props.workspace ? this.props.workspace.layers : null
    const { activeTool, position, paintBrushShape, paintBrushWidth, eraseBrushShape, eraseBrushWidth, undoIsEnabled, redoIsEnabled, showOriginalCanvas, isAddGroup, isDeleteGroup, isUngroup, paintCursor, isInfoToolActive, loading, showAnimatePin, showNonAnimatePin, pinX, pinY, currPinX, currPinY, canvasWidth, canvasHeight, canvasHasBeenInitialized, showSelectPaletteModal } = this.state
    const lpActiveColorRGB = (lpActiveColor) ? `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})` : ``
    const backgroundColorBrush = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 0.7)` : lpActiveColorRGB
    const { paintBrushActiveClass, paintBrushCircleActiveClass } = this.getPaintBrushActiveClass()
    const { eraseBrushActiveClass, eraseBrushCircleActiveClass } = this.getEraseBrushActiveClass()
    const { selectPaletteActions, selectPaletteTitle, selectPaletteDescription } = this.getSelectPaletteModalConfig()
    return (
      <>
        {loading ? <div className={`${animationLoader} ${animationLoader}--load`} /> : null}
        <div role='presentation' className={`${baseClass} ${isInfoToolActive ? `${disableTextSelect} ${showCursor}` : ``} ${activeTool === toolNames.PAINTBRUSH || activeTool === toolNames.ERASE ? `${disableTextSelect} ${hideCursor}` : ``} ${(loading) ? disableClick : ``}`} onClick={this.handleClick} onMouseMove={this.mouseMoveHandler} ref={this.CFIWrapper} style={{ height: this.state.wrapperHeight }} onMouseLeave={this.mouseLeaveHandler} onMouseEnter={this.mouseEnterHandler}>
          {showSelectPaletteModal ? <DynamicModal
            actions={selectPaletteActions}
            title={selectPaletteTitle}
            height={canvasHeight}
            description={selectPaletteDescription} /> : null}
          {/* the 35 in the padding is the radius of the circle loader. Note the bitwise rounding */}
          {this.props.savingMasks || this.state.loadingMasks ? <div style={{ height: canvasHeight }} className='spinner'><div style={{ padding: ((canvasHeight / 2) | 0) - 35 }}><CircleLoader /></div></div> : null}
          {this.props.savingMasks ? <SaveMasks processMasks={this.processMasks} /> : null }
          <canvas className={`${canvasClass} ${showOriginalCanvas ? `${canvasShowByZindex}` : `${canvasHideByZindex}`} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-first' ref={this.CFICanvas}>{intl.messages.CANVAS_UNSUPPORTED}</canvas>
          <canvas style={{ opacity: showOriginalCanvas ? 1 : 0.8 }} className={`${canvasClass} ${paintCursor} ${canvasSecondClass} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-second' ref={this.CFICanvas2}>{intl.messages.CANVAS_UNSUPPORTED}</canvas>
          <canvas
            onMouseDown={this.onPanStart}
            style={{ opacity: 1 }}
            className={`${canvasClass} ${paintCursor} ${(activeTool === toolNames.PAINTBRUSH
              ? canvasSecondClass : canvasThirdClass)} ${(activeTool === toolNames.ERASE)
              ? canvasHiddenByVisibility : canvasVisibleByVisibility} ${this.isPortrait ? portraitOrientation : ''}`}
            name='paint-scene-canvas-paint'
            ref={this.CFICanvasPaint}>
            {intl.messages.CANVAS_UNSUPPORTED}
          </canvas>
          <canvas className={`${canvasClass} ${canvasSecondClass}`} ref={this.CFICanvas4} name='paint-scene-canvas-fourth' />
          {this.renderMergeCanvas(this.state.canvasImageUrls)}
          <img className={`${imageClass}`} ref={this.CFIImage} onLoad={this.initCanvas} onError={this.handleImageErrored} src={bgImageUrl} alt={intl.messages.IMAGE_INVISIBLE} />
          {layers && canvasHasBeenInitialized ? <MergeColors
            imageUrlList={layers}
            colors={layers.map(item => {
              return { r: 255, g: 255, b: 255 }
            })}
            handleImagesMerged={this.importLayers}
            width={canvasWidth}
            height={canvasHeight}
            ignoreColorOffset
            preserveLayersAsData /> : null}
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
              isInfoToolActive={isInfoToolActive}
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
          {showAnimatePin && (activeTool === toolNames.DEFINEAREA || activeTool === toolNames.REMOVEAREA) && <div className={`${animationPin}`} style={{ top: pinY, left: pinX }}>
            <div className={`${animationPin}__outer`}>
              <div className={`${animationPin}__inner`} />
            </div>
          </div>}
          {showNonAnimatePin && (activeTool === toolNames.DEFINEAREA || activeTool === toolNames.REMOVEAREA) && <div className={`${nonAnimationPin}`} style={{ top: currPinY, left: currPinX }} >
            <div className={`${nonAnimationPin}__outer`}>
              <div className={`${nonAnimationPin}__inner`} />
            </div>
          </div>}
        </div>
        <PaintSceneFooter handleSave={this.props.startSavingMasks} top={this.state.wrapperHeight} />
      </>
    )
  }
}

const mapStateToProps = (state: Object, props: Object) => {
  const { lp, savingMasks, selectedSavedSceneId, scenesAndRegions } = state
  const selectedScene = scenesAndRegions.find(item => item.id === selectedSavedSceneId)

  return {
    lpColors: lp.colors,
    lpActiveColor: lp.activeColor,
    savingMasks,
    selectedScene
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    saveMasks: (colorList: Array<number[]>, imageData: Object, backgroundImageUrl: string, metaData: Object) =>
      dispatch(saveMasks(colorList, imageData, backgroundImageUrl, metaData)),
    startSavingMasks: () => dispatch(startSavingMasks()),
    mergeLpColors: (colors: Object[]) => dispatch(mergeLpColors(colors)),
    replaceLpColors: (colors: Object[]) => dispatch(replaceLpColors(colors)),
    selectSavedScene: (sceneId) => dispatch(selectSavedScene(sceneId)),
    clearSceneWorkspace: () => clearSceneWorkspace()
  }
}

export {
  baseClass, paintBrushClass, canvasClass
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PaintScene))
PaintScene.contextType = RouteContext
