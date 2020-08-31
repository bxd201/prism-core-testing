// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import './PaintScene.scss'
import uniqueId from 'lodash/uniqueId'
import PaintToolBar from './PaintToolBar'
import { injectIntl } from 'react-intl'

import {
  createImageDataAndAlphaPixelMapFromImageData,
  getColorsFromImagePathList, getInitialDims, getLABFromColor
} from './PaintSceneUtils'
import { repaintImageByPath, pointInsideCircle,
  getImageCordinateByPixel, canvasDimensionFactors, applyDimensionFactorsByCanvas,
  getActiveColorRGB, hexToRGB, colorMatch, shouldCanvasResize,
  drawImagePixelByPath, getColorAtPixel, getCanvasWrapperOffset,
  copyImageList, createImagePathItem, drawPaintBrushPoint, applyDimensionFactorsToCanvas,
  getPaintBrushActiveClass, getEraseBrushActiveClass, compareArraysOfObjects, objectsEqual, getColorsForMergeColors } from './utils'
import { toolNames, groupToolNames, brushLargeSize, brushRoundShape, setTooltipShownLocalStorage, getTooltipShownLocalStorage } from './data'
import { getScaledPortraitHeight, getScaledLandscapeHeight } from '../../shared/helpers/ImageUtils'
import throttle from 'lodash/throttle'
import { redo, undo } from './UndoRedoUtil'
import MergeCanvas from '../MergeCanvas/MergeCanvas'
import {
  saveMasks,
  selectSavedScene,
  showSavedCustomSceneSuccessModal,
  showSaveSceneModal,
  startSavingMasks
} from '../../store/actions/persistScene'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import SaveMasks from './SaveMasks'
import { createCustomSceneMetadata, createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
import MergeColors from '../MergeCanvas/MergeColors'
import storageAvailable from '../../shared/utils/browserStorageCheck.util'
import DynamicModal, { DYNAMIC_MODAL_STYLE } from '../DynamicModal/DynamicModal'
import { checkCanMergeColors, shouldPromptToReplacePalette } from '../LivePalette/livePaletteUtility'
import { LP_MAX_COLORS_ALLOWED } from '../../constants/configurations'
import { mergeLpColors, replaceLpColors } from '../../store/actions/live-palette'
import { clearSceneWorkspace, WORKSPACE_TYPES } from '../../store/actions/paintScene'
import { setActiveScenePolluted, unsetActiveScenePolluted, setWarningModalImgPreview } from 'src/store/actions/scenes'
import { group, ungroup, deleteGroup, selectArea, bucketPaint, applyZoom,
  createOrDeletePolygon, createPolygonPin, eraseOrPaintMouseUp, eraseOrPaintMouseDown } from './toolFunction'
import { LiveMessage } from 'react-aria-live'

const baseClass = 'paint__scene__wrapper'
const canvasClass = `${baseClass}__canvas`
const canvasSecondClass = `${baseClass}__canvas-second`
const canvasThirdClass = `${baseClass}__canvas-third`
const portraitOrientation = `${canvasClass}--portrait`
const imageClass = `${baseClass}__image`
const paintBrushClass = `${baseClass}__paint-brush`
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
  clearSceneWorkspace: Function,
  showSaveSceneModal: boolean,
  showSaveSceneModalAction: Function,
  saveSceneName: string,
  sceneCount: number,
  showSavedConfirmModalFlag: boolean,
  hideSavedConfirmModal: Function,
  setActiveScenePolluted: () => void,
  unsetActiveScenePolluted: () => void,
  setWarningModalImgPreview: ({}) => void
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
  uniqueSceneId: string,
  prevWorkspace: Object
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

  constructor (props: ComponentProps) {
    super(props)

    const [initialImageWidth, initialImageHeight] = getInitialDims(props.workspace, props.referenceDimensions)
    const isPortrait = props.workspace ? props.workspace.height > props.workspace.width : props.referenceDimensions.isPortrait

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
    this.originalImageWidth = props.referenceDimensions.originalImageWidth
    this.originalImageHeight = props.referenceDimensions.originalImageHeight

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
      prevWorkspace: {},
      canvasHasBeenInitialized: false,
      showSelectPaletteModal: false,
      checkIsPaintSceneUpdate: false,
      uniqueSceneId: createUniqueSceneId(),
      isSceneOpend: false
    }

    this.undo = this.undo.bind(this)
    this.redo = this.redo.bind(this)
    this.redrawCanvas = this.redrawCanvas.bind(this)
    this.initCanvas = this.initCanvas.bind(this)
    this.initCanvasWithDimensions = this.initCanvasWithDimensions.bind(this)
    this.calcCanvasNewDimensions = this.calcCanvasNewDimensions.bind(this)
    this.scaleCanvases = this.scaleCanvases.bind(this)
    this.getLayers = this.getLayers.bind(this)
    this.renderMergeCanvas = this.renderMergeCanvas.bind(this)
    this.processMasks = this.processMasks.bind(this)
    this.initCanvas2 = this.initCanvas2.bind(this)
    this.importLayers = this.importLayers.bind(this)
    this.getSelectPaletteModalConfig = this.getSelectPaletteModalConfig.bind(this)
    this.loadPalette = this.loadPalette.bind(this)
    this.tryToMergeColors = this.tryToMergeColors.bind(this)
    this.hideSaveSceneModal = this.hideSaveSceneModal.bind(this)
    this.saveSceneFromModal = this.saveSceneFromModal.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  hideSaveSceneModal (e: SyntheticEvent) {
    e.preventDefault()
    e.stopPropagation()

    this.props.showSaveSceneModalAction(false)
  }

  saveSceneFromModal (e: SyntheticEvent, sceneName: string) {
    e.preventDefault()
    e.stopPropagation()
    if (sceneName.trim() === '') {
      return false
    }
    this.props.showSaveSceneModalAction(false)
    this.props.startSavingMasks(sceneName)
  }

  tryToMergeColors () {
    // eslint-disable-next-line no-new-object
    const { workspace, lpColors } = this.props
    if (workspace && workspace.workspaceType !== WORKSPACE_TYPES.smartMask && workspace.layers && workspace.palette && lpColors) {
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
    text: intl.formatMessage({ id: 'PAINT_SCENE.CANCEL' }),
    type: DYNAMIC_MODAL_STYLE.primary },
    { callback: (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.loadPalette()
      this.setState({ showSelectPaletteModal: false })
    },
    text: intl.formatMessage({ id: 'PAINT_SCENE.OK' }),
    type: DYNAMIC_MODAL_STYLE.primary }]

    return {
      selectPaletteActions,
      selectPaletteTitle: intl.formatMessage({ id: 'PAINT_SCENE.SELECT_PALETTE_TITLE' }),
      selectPaletteDescription: intl.formatMessage({ id: 'PAINT_SCENE.SELECT_PALETTE_DESC' })
    }
  }

  loadPalette () {
    const { workspace: { palette } } = this.props
    this.props.replaceLpColors(palette)
  }

  static getDerivedStateFromProps (props, state) {
    if (props.checkIsPaintSceneUpdate !== state.checkIsPaintSceneUpdate) {
      return {
        checkIsPaintSceneUpdate: props.checkIsPaintSceneUpdate
      }
    }
    const checkWorkSpaceIfUpdate = props.workspace ? !objectsEqual(props.workspace, state.prevWorkspace) : false
    if (checkWorkSpaceIfUpdate && props.workspace && props.workspace.layers === null) {
      return {
        imagePathList: [],
        prevWorkspace: props.workspace
      }
    }
    return null
  }

  componentDidUpdate (prevProps: Object, prevState: Object) {
    const checkImageListIfUpdate = !compareArraysOfObjects(this.state.imagePathList, prevState.imagePathList)
    if (checkImageListIfUpdate) {
      this.props.setActiveScenePolluted()
      this.props.setWarningModalImgPreview({ dataUrls: this.getLayers(), width: this.backgroundImageWidth, height: this.backgroundImageHeight })
    }
    if (prevState.loading) {
      return
    }
    const newWidth = shouldCanvasResize(prevProps.width, this.props.width)
    if (newWidth) {
      this.scaleCanvases(newWidth, prevProps.width)
    }
    const { imagePathList, selectedArea, groupSelectList } = this.state
    let copyImagePathList = copyImageList(imagePathList)
    const islpActiveColorAvailable = this.props.lpActiveColor && prevProps.lpActiveColor
    const islpActiveColorHexAvailable = islpActiveColorAvailable && prevProps.lpActiveColor.hex && this.props.lpActiveColor.hex
    const isActive = !!((selectedArea.length > 0 || groupSelectList.length > 0))
    if (islpActiveColorHexAvailable && prevProps.lpActiveColor.hex !== this.props.lpActiveColor.hex && isActive) {
      const ctx = this.CFICanvas2.current.getContext('2d')
      const RGB = this.props.lpActiveColor && getActiveColorRGB(hexToRGB(this.props.lpActiveColor.hex))

      groupSelectList.forEach(selectItem => {
        this.clearCanvas()
        drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, RGB, selectItem.selectPath)
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
      })

      selectedArea.forEach(selectItem => {
        this.clearCanvas()
        drawImagePixelByPath(ctx, this.canvasOffsetWidth, this.canvasOffsetHeight, RGB, selectItem.selectPath)
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
      })

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
    // const { canvasWidth, canvasHeight } = this.calcCanvasNewDimensions()
    this.setForegroundImage(this.state.canvasWidth, this.state.canvasHeight)
  }

  /*:: calcCanvasNewDimensions(newWidth: number) => Object */
  calcCanvasNewDimensions (newWidth: number, oldWidth: number) {
    const originalImageWidth = this.originalIsPortrait === this.isPortrait ? this.originalImageWidth : this.originalImageHeight
    const originalImageHeight = this.originalIsPortrait === this.isPortrait ? this.originalImageHeight : this.originalImageWidth
    let canvasWidth = 0
    const wrapperWidth = newWidth || this.wrapperDimensions.width

    const scaleRatio = newWidth / oldWidth

    if (this.isPortrait) {
      canvasWidth = Math.floor(this.state.canvasWidth * scaleRatio)
    } else {
      // Landscape
      canvasWidth = Math.floor(wrapperWidth)
    }

    let canvasHeight = 0

    if (this.isPortrait) {
      canvasHeight = Math.floor(getScaledPortraitHeight(originalImageWidth, originalImageHeight)(canvasWidth))
    } else {
      canvasHeight = Math.floor(getScaledLandscapeHeight(originalImageHeight, originalImageWidth)(canvasWidth))
    }

    return {
      canvasWidth,
      canvasHeight
    }
  }

  /*:: initCanvasWithNewDimensions: (newWidth?: number) => void */
  initCanvasWithDimensions (newWidth?: number) {
    const canvasWidth = this.state.canvasWidth
    const canvasHeight = this.state.canvasHeight

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
  scaleCanvases (newWidth: number, oldWidth: number) {
    const { canvasWidth, canvasHeight } = this.calcCanvasNewDimensions(newWidth, oldWidth)

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
    let { palette } = this.props.workspace
    const { lpColors } = this.props
    // @todo Currently this  replaces the pseudo-color(s) with colors from the palette, this will likely change -RS
    if (this.props.workspace.workspaceType === WORKSPACE_TYPES.smartMask && lpColors && lpColors.length) {
      palette = palette.map((pColor, i) => {
        if (parseInt(pColor.id) < 0) {
          return {
            ...lpColors[i % lpColors.length]
          }
        }

        return pColor
      })
    }
    const colorLayers = payload.layersAsData.map(item => createImageDataAndAlphaPixelMapFromImageData(item))
    const imagePaths = colorLayers
      .map((item, i) => {
        return createImagePathItem(item.pixelMap, item.alphaPixelMap, palette[i], 'paint', 0, true, true)
      })
    repaintImageByPath(imagePaths, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
    this.setState({ canvasImageUrls: this.getLayers(), imagePathList: imagePaths, loadingMasks: false, canvasHasBeenInitialized: false })
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
        // @todo [IMPROVEMENT] candidate for redux? -RS
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
    // @todo [IMPROVEMENT] candidate for redux -RS
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
    this.applyZoom(this.state.canvasZoom)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeHandler)
    this.props.selectSavedScene(null)
    this.props.unsetActiveScenePolluted()
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
    const ref = { CFICanvas2: this.CFICanvas2, canvasOriginalDimensions: this.canvasOriginalDimensions, CFICanvasContextPaint: this.CFICanvasContextPaint, CFICanvasContext2: this.CFICanvasContext2 }
    const { activeTool, paintBrushWidth, isDragging, drawCoordinates, eraseBrushWidth, paintBrushShape } = this.state
    const { lpActiveColor } = this.props
    const canvasClientOffset = this.CFICanvas2.current.getBoundingClientRect()
    const canvasWrapperOffset = getCanvasWrapperOffset(this.CFIWrapper)
    const paintBrushHalfWidth = (activeTool === toolNames.PAINTBRUSH) ? paintBrushWidth / 2 : eraseBrushWidth / 2
    const leftOffset = clientX - canvasWrapperOffset.x - paintBrushHalfWidth
    const topOffset = clientY - canvasWrapperOffset.y - paintBrushHalfWidth
    const position = { left: leftOffset, top: topOffset, isHidden: this.state.position.isHidden }

    this.setState({ position })
    if ((lpActiveColor === null || (lpActiveColor.constructor === Object && Object.keys(lpActiveColor).length === 0)) && activeTool === toolNames.PAINTBRUSH) return
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
          drawPaintBrushPoint(currentPoint, drawCoordinates[drawCoordinatesLength - 1], this.state, this.props, ref)
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
    const ref = { CFICanvas2: this.CFICanvas2, canvasOriginalDimensions: this.canvasOriginalDimensions, CFICanvasContextPaint: this.CFICanvasContextPaint, CFICanvasContext2: this.CFICanvasContext2 }
    let drawCoordinates = eraseOrPaintMouseDown(e, this.state, this.props, ref)
    this.setState({ drawCoordinates })
  }

  dragStartHandler = (e: Object) => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({ isDragging: true })
  }

  mouseUpHandler = (e: Object) => {
    const ref = {
      CFICanvasPaint: this.CFICanvasPaint,
      canvasOffsetWidth: this.canvasOffsetWidth,
      canvasOffsetHeight: this.canvasOffsetHeight,
      CFICanvas2: this.CFICanvas2,
      CFICanvasContextPaint: this.CFICanvasContextPaint
    }

    window.removeEventListener('mouseup', this.mouseUpHandler)
    let newState = eraseOrPaintMouseUp(this.state, this.props, ref)
    this.setState(newState)
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
    const ref = {
      CFICanvas2: this.CFICanvas2,
      canvasOriginalDimensions: this.canvasOriginalDimensions,
      CFICanvasContext2: this.CFICanvasContext2,
      canvasOffsetWidth: this.canvasOffsetWidth,
      canvasOffsetHeight: this.canvasOffsetHeight
    }
    let newState = selectArea(e, this.state, ref)
    if (!newState) return
    this.setState(newState)
    this.clearCanvas()
    repaintImageByPath(newState.imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, false, this.state.groupIds)
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
    if (this.props.lpActiveColor === null || (this.props.lpActiveColor.constructor === Object && Object.keys(this.props.lpActiveColor).length === 0)) return
    const { BeginPointList, polyList, presentPolyList } = this.state
    const { clientX, clientY } = e
    const ref = { CFICanvasContext4: this.CFICanvasContext4, CFICanvas4: this.CFICanvas4, canvasOffsetWidth: this.canvasOffsetWidth, canvasOffsetHeight: this.canvasOffsetHeight, CFICanvasPaint: this.CFICanvasPaint, CFICanvasContextPaint: this.CFICanvasContextPaint, CFIWrapper: this.CFIWrapper }
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

    let isBackToStart = false
    if (BeginPointList.length > 0) {
      isBackToStart = pointInsideCircle(X, Y, BeginPointList, 10)
    }
    if (isBackToStart) {
      this.clearCanvas()
      let newState = createOrDeletePolygon(isAddArea, this.state, this.props, ref)
      this.clearCanvas()
      this.CFICanvasContext4.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      repaintImageByPath(newState.imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.setState(newState)
      return
    } else {
      let newState = createPolygonPin(e, this.state, this.props, ref, [X, Y], presentPoly)
      this.setState(newState)
    }
    this.setState({ lineStart: [X, Y],
      polyList: poly,
      presentPolyList: presentPoly
    })
  }

  handlePaintArea = throttle((e: Object) => {
    e.persist()
    const ref = {
      CFICanvas2: this.CFICanvas2,
      canvasOriginalDimensions: this.canvasOriginalDimensions,
      canvasOffsetWidth: this.canvasOffsetWidth,
      canvasOffsetHeight: this.canvasOffsetHeight,
      CFICanvasContext2: this.CFICanvasContext2,
      mergeCanvasRef: this.mergeCanvasRef
    }
    const { clientX, clientY } = e
    const canvasClientOffset = ref.CFICanvas2.current.getBoundingClientRect()
    const scale = ref.canvasOriginalDimensions.width / canvasClientOffset.width
    const cursorX = Math.round((clientX - canvasClientOffset.left) * scale)
    const cursorY = Math.round((clientY - canvasClientOffset.top) * scale)
    const mergeContext = this.mergeCanvasRef.current.getContext('2d')
    const imageData = mergeContext.getImageData(0, 0, mergeContext.canvas.width, mergeContext.canvas.height)
    const RGB = this.props.lpActiveColor && getActiveColorRGB(hexToRGB(this.props.lpActiveColor.hex))
    if (RGB) {
      const isPaint = colorMatch(getColorAtPixel(imageData, cursorX, cursorY), { r: RGB[0], g: RGB[1], b: RGB[2], a: RGB[3] }, 100)
      if (!isPaint) {
        this.setState({ paintCursor: `${canvasClass}--${toolNames.PAINTAREA}--loading` })
        setTimeout(() => {
          let newState = bucketPaint(e, this.state, this.props, ref)
          this.clearCanvas()
          repaintImageByPath(newState.imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight)
          this.setState({ ...newState, canvasImageUrls: this.getLayers(), paintCursor: `${canvasClass}--${toolNames.PAINTAREA}` })
        }, 200)
      }
    }
  }, 10)

  handleClick (e: Object) {
    const { activeTool, isInfoToolActive } = this.state
    // showSaveSceneModal prevents click from painting when modal is open
    if (isInfoToolActive || this.props.showSaveSceneModal || this.props.showSavedConfirmModalFlag) {
      return
    }
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
    const ref = {
      wrapperOriginalDimensions: this.wrapperOriginalDimensions,
      canvasOriginalDimensions: this.canvasOriginalDimensions,
      CFICanvas: this.CFICanvas,
      CFICanvas2: this.CFICanvas2,
      CFICanvasPaint: this.CFICanvasPaint,
      canvasPanStart: this.canvasPanStart
    }
    applyZoom(zoomNumber, ref)
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
    const ref = { CFICanvas: this.CFICanvas, CFICanvas2: this.CFICanvas2, CFICanvasPaint: this.CFICanvasPaint }
    const { canvasZoom, canvasMouseDown } = this.state
    if (canvasZoom <= 1 || canvasZoom >= 8) return
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
    const factors = canvasDimensionFactors(options)
    applyDimensionFactorsToCanvas(factors, ref)
  }, 10)

  onPanEnd = () => {
    this.setState({
      canvasMouseDown: false
    })
  }

  group = () => {
    let newState = group(this.state)
    this.setState(newState)
  }

  ungroup = () => {
    let newState = ungroup(this.state)
    this.clearCanvas()
    repaintImageByPath(newState.imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, false, newState.groupIds)
    this.setState(newState)
  }

  deleteGroup = () => {
    let newState = deleteGroup(this.state)
    this.clearCanvas()
    repaintImageByPath(newState.imagePathList, this.CFICanvas2, this.canvasOffsetWidth, this.canvasOffsetHeight, true, newState.groupIds)
    this.setState(newState)
  }
canvasHeight
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
    return (<MergeCanvas
      key={this.state.mergeCanvasKey}
      width={this.canvasOriginalDimensions.width}
      height={this.canvasOriginalDimensions.height}
      ref={this.mergeCanvasRef}
      applyZoomPan={this.applyZoomPan}
      layers={imageUrls} />)
  }

  // This Method sorts the imagePathList by color to trigger the MergeColor component to instantiate and generate a flat (jpg) mask per color
  processMasks () {
    const colorList = getColorsFromImagePathList(this.state.imagePathList)
    const labColorList = colorList.map(color => getLABFromColor(color))
    let livePaletteColorsIdArray = []
    this.props.lpColors && this.props.lpColors.map(color => {
      livePaletteColorsIdArray.push(color.id)
    })

    let saveBackgroundOnly = false

    if (!labColorList.length) {
      saveBackgroundOnly = true
    }

    const backgroundImageUrl = this.CFICanvas.current.toDataURL('image/jpeg', 1.0)
    const ctx2 = this.CFICanvas2.current.getContext('2d')
    const imageData = !saveBackgroundOnly ? ctx2.getImageData(0, 0, ctx2.canvas.width, ctx2.canvas.height) : null
    const metaData = createCustomSceneMetadata('TEMP_NAME', this.props.saveSceneName, this.state.uniqueSceneId, colorList, ctx2.canvas.width, ctx2.canvas.height, livePaletteColorsIdArray)
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
    const factors = canvasDimensionFactors(options)
    applyDimensionFactorsByCanvas(factors, ref)
  }

  getPreviewData = () => {
    const livePaletteColorsDiv = this.props.lpColors.filter(color => !!color).map((color, i) => {
      const { red, green, blue } = color
      return (
        <div
          key={i}
          style={{ backgroundColor: `rgb(${red},${green},${blue})`, flexGrow: '1', borderLeft: (i > 0) ? '1px solid #ffffff' : 'none' }}>
          &nbsp;
        </div>
      )
    })

    return <>
      <div style={{ height: '68px' }}>
        <MergeCanvas
          ref={React.createRef()}
          layers={this.getLayers()}
          width={110}
          height={68}
          colorOpacity={0.8}
        />
      </div>
      <div style={{ display: 'flex', marginTop: '1px' }}>{livePaletteColorsDiv}</div>
    </>
  }

  render () {
    const { lpActiveColor, intl, showSaveSceneModal, lpColors, workspace } = this.props
    const livePaletteColorCount = (lpColors && lpColors.length) || 0
    const bgImageUrl = workspace ? workspace.bgImageUrl : this.props.imageUrl
    const layers = workspace && workspace.workspaceType !== WORKSPACE_TYPES.smartMask ? workspace.layers : null
    const workspaceImageData = workspace && workspace.workspaceType === WORKSPACE_TYPES.smartMask ? workspace.layers : null
    const { activeTool, position, paintBrushShape, paintBrushWidth, eraseBrushShape, eraseBrushWidth, undoIsEnabled, redoIsEnabled, showOriginalCanvas, isAddGroup, isDeleteGroup, isUngroup, paintCursor, isInfoToolActive, loading, showAnimatePin, showNonAnimatePin, pinX, pinY, currPinX, currPinY, canvasWidth, canvasHeight, canvasHasBeenInitialized, showSelectPaletteModal } = this.state
    const lpActiveColorRGB = (lpActiveColor) ? `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})` : ``
    const backgroundColorBrush = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 0.7)` : lpActiveColorRGB
    const { paintBrushActiveClass, paintBrushCircleActiveClass } = getPaintBrushActiveClass(this.state)
    const { eraseBrushActiveClass, eraseBrushCircleActiveClass } = getEraseBrushActiveClass(this.state)
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
          {showSaveSceneModal && livePaletteColorCount !== 0 ? <DynamicModal
            actions={[
              { text: intl.formatMessage({ id: 'SAVE_SCENE_MODAL.SAVE' }), callback: this.saveSceneFromModal },
              { text: intl.formatMessage({ id: 'SAVE_SCENE_MODAL.CANCEL' }), callback: this.hideSaveSceneModal }
            ]}
            previewData={this.getPreviewData()}
            height={canvasHeight}
            allowInput
            inputDefault={`${intl.formatMessage({ id: 'SAVE_SCENE_MODAL.DEFAULT_DESCRIPTION' })} ${this.props.sceneCount}`} /> : null}
          {showSaveSceneModal && livePaletteColorCount === 0 ? <DynamicModal
            actions={[
              { text: intl.formatMessage({ id: 'SAVE_SCENE_MODAL.CANCEL' }), callback: this.hideSaveSceneModal }
            ]}
            description={intl.formatMessage({ id: 'SAVE_SCENE_MODAL.UNABLE_TO_SAVE_WARNING' })}
            height={canvasHeight} /> : null}
          { /* ----------Confirm modal ---------- */ }
          { this.props.showSavedConfirmModalFlag ? <DynamicModal
            actions={[
              { text: intl.formatMessage({ id: 'PAINT_SCENE.OK_DISMISS' }), callback: this.props.hideSavedConfirmModal }
            ]}
            description={intl.formatMessage({ id: 'PAINT_SCENE.SCENE_SAVED' })}
            height={canvasHeight} /> : null}
          {/* the 35 in the padding is the radius of the circle loader. Note the bitwise rounding */}
          {this.props.savingMasks || this.state.loadingMasks ? <div style={{ height: canvasHeight }} className='spinner'><div style={{ padding: ((canvasHeight / 2) | 0) - 35 }}><CircleLoader /></div></div> : null}
          {this.props.savingMasks ? <SaveMasks processMasks={this.processMasks} /> : null }
          <canvas className={`${canvasClass} ${showOriginalCanvas ? `${canvasShowByZindex}` : `${canvasHideByZindex}`} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-first' ref={this.CFICanvas}>{intl.formatMessage({ id: 'CANVAS_UNSUPPORTED' })}</canvas>
          <canvas style={{ opacity: showOriginalCanvas ? 1 : 0.8 }} className={`${canvasClass} ${paintCursor} ${canvasSecondClass} ${this.isPortrait ? portraitOrientation : ''}`} name='paint-scene-canvas-second' ref={this.CFICanvas2}>{intl.formatMessage({ id: 'CANVAS_UNSUPPORTED' })}</canvas>
          <canvas
            onMouseDown={this.onPanStart}
            style={{ opacity: 1 }}
            className={`${canvasClass} ${paintCursor} ${(activeTool === toolNames.PAINTBRUSH
              ? canvasSecondClass : canvasThirdClass)} ${(activeTool === toolNames.ERASE)
              ? canvasHiddenByVisibility : canvasVisibleByVisibility} ${this.isPortrait ? portraitOrientation : ''}`}
            name='paint-scene-canvas-paint'
            ref={this.CFICanvasPaint}>
            {intl.formatMessage({ id: 'CANVAS_UNSUPPORTED' })}
          </canvas>
          <canvas className={`${canvasClass} ${canvasSecondClass}`} ref={this.CFICanvas4} name='paint-scene-canvas-fourth' />
          {/* renderMergeCanvas is dependency of the flood fill operation. The returned component ensures that the algorithm can search/fill a flattened image. */}
          {this.renderMergeCanvas(this.state.canvasImageUrls)}
          {/* Loads background image */}
          <img className={`${imageClass}`} ref={this.CFIImage} onLoad={this.initCanvas} onError={this.handleImageErrored} src={bgImageUrl} alt={intl.formatMessage({ id: 'IMAGE_INVISIBLE' })} />
          {/* MergeColors component is used to load and imported surfaces. Currently loads smartmasks and saved scenes */}
          {(layers || workspaceImageData) && canvasHasBeenInitialized ? <MergeColors
            imageUrlList={layers}
            imageDataList={workspaceImageData}
            colors={getColorsForMergeColors(workspace)}
            handleImagesMerged={this.importLayers}
            width={canvasWidth}
            height={canvasHeight}
            ignoreColorOffset
            preserveLayersAsData /> : null}
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
        <LiveMessage message={`${activeTool} tool is activated`} aria-live='assertive' clearOnUnmount='true' />
      </>
    )
  }
}

const mapStateToProps = (state: Object, props: Object) => {
  const { lp, savingMasks, selectedSavedSceneId, scenesAndRegions, showSaveSceneModal, saveSceneName } = state
  const selectedScene = scenesAndRegions.find(item => item.id === selectedSavedSceneId)

  return {
    lpColors: lp.colors,
    lpActiveColor: lp.activeColor,
    savingMasks,
    selectedScene,
    showSaveSceneModal,
    saveSceneName,
    sceneCount: state.sceneMetadata.length + 1,
    showSavedConfirmModalFlag: state.showSavedCustomSceneSuccess
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    saveMasks: (colorList: Array<number[]>, imageData: Object, backgroundImageUrl: string, metaData: Object) =>
      dispatch(saveMasks(colorList, imageData, backgroundImageUrl, metaData)),
    startSavingMasks: (sceneName) => dispatch(startSavingMasks(sceneName)),
    mergeLpColors: (colors: Object[]) => dispatch(mergeLpColors(colors)),
    replaceLpColors: (colors: Object[]) => dispatch(replaceLpColors(colors)),
    selectSavedScene: (sceneId) => dispatch(selectSavedScene(sceneId)),
    clearSceneWorkspace: () => clearSceneWorkspace(),
    showSaveSceneModalAction: (shouldShow) => dispatch(showSaveSceneModal(shouldShow)),
    hideSavedConfirmModal: (e: SyntheticEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dispatch(showSavedCustomSceneSuccessModal(false))
    },
    setActiveScenePolluted: () => dispatch(setActiveScenePolluted()),
    unsetActiveScenePolluted: () => dispatch(unsetActiveScenePolluted()),
    setWarningModalImgPreview: (data) => dispatch(setWarningModalImgPreview(data))
  }
}

export {
  baseClass, paintBrushClass, canvasClass
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PaintScene))
