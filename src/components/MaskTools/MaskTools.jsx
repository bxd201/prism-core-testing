// @flow
import React, { PureComponent } from 'react'
import './MaskTools.scss'
import { connect } from 'react-redux'
import { getPaintAreaPath, repaintImageByPath, edgeDetect } from './utils'
import cloneDeep from 'lodash/cloneDeep'

type ComponentState = {
    mappedCanvasIndex: number,
    currentPixelRGB: any,
    currentPixelRGBstring: string,
    currentBrandColorIndex: number,
    pinnedColors: Array<any>,
    imageStatus: string
}

export class MaskTools extends PureComponent<ComponentProps, ComponentState> {
  canvasOffset: any
  imageDataData: any
  CFICanvasContext: any
  canvasOffsetWidth: number
  canvasOffsetHeight: number
  canvasClientX: number
  canvasClientY: number
  CFICanvas: RefObject
  CFIWrapper: RefObject
  CFIImage: RefObject

  state = {
    cursorX: 0,
    cursorY: 0,
    start: [],
    startPoint: [],
    polyList: [],
    allPloygons: [],
    count: 0,
    isSelect: true,
    imagePathList: [],
    selectAreaList: [],
    edgeList: []
  }
  constructor (props: ComponentProps) {
    super(props)
    this.CFICanvas = React.createRef()
    this.CFIWrapper = React.createRef()
    this.CFIImage = React.createRef()
    this.CanvasPaint = React.createRef()
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
    const { isActivedPage } = this.props
    let canvasOffset = {}
    if (isActivedPage && this.CFICanvas.current) {
      const canvasClientOffset = this.CFICanvas.current.getBoundingClientRect()
      canvasOffset.x = parseInt(canvasClientOffset.left, 10)
      canvasOffset.y = parseInt(canvasClientOffset.top, 10)
      window.sessionStorage.setItem('canvasOffset', JSON.stringify(canvasOffset))
    }
  }

  getCanvasOffset = () => {
    const canvasOffset = window.sessionStorage.getItem('canvasOffset')
    return JSON.parse(canvasOffset)
  }

  componentDidMount () {
    this.updateWindowDimensions()
    window.addEventListener('resize', this.updateWindowDimensions)
    window.addEventListener('scroll', this.setCanvasOffset)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateWindowDimensions)
    window.addEventListener('scroll', this.setCanvasOffset)
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
    this.canvasOffset = this.CFICanvas.current.getBoundingClientRect()
    this.canvasOffsetWidth = parseInt(this.canvasOffset.width, 10)
    this.canvasOffsetHeight = parseInt(this.canvasOffset.height, 10)

    this.CFICanvas.current.height = this.canvasOffsetHeight
    this.CFICanvas.current.width = this.canvasOffsetWidth
    this.CanvasPaint.current.height = this.canvasOffsetHeight
    this.CanvasPaint.current.width = this.canvasOffsetWidth

    this.CFICanvasContext.drawImage(this.CFIImage.current, 0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    const imageData = this.CFICanvasContext.getImageData(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    this.imageDataData = imageData.data
  }

  handleClick = (e: Object) => {
    const { isSelect } = this.state
    if (isSelect) {
      this.handleSelectArea(e)
    }
    if (!isSelect) {
      this.DefineRegion(e)
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
        const edge = edgeDetect(this.CanvasPaint, targetEdgeDetect, targetColor, this.canvasOffsetWidth, this.canvasOffsetWidth)
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
        repaintImageByPath(imagePathList, this.CanvasPaint, this.canvasOffsetWidth, this.canvasOffsetHeight)
        if (edgeListToRender.length > 0) {
          repaintImageByPath(edgeListToRender, this.CanvasPaint, this.canvasOffsetWidth, this.canvasOffsetHeight)
        }
      }
    }
  }

  clearCanvas = () => {
    const ctx = this.CanvasPaint.current.getContext('2d')
    ctx.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
  }

  DefineRegion = (e) => {
    const ctx = this.CanvasPaint.current
    const cursorX = e.nativeEvent.offsetX
    const cursorY = e.nativeEvent.offsetY
    if (!ctx.getContext) return
    let ctxDraw = ctx.getContext('2d')
    const { startPoint, polyList, start, imagePathList } = this.state
    let isBackToStart = false
    if (startPoint.length > 0) {
      isBackToStart = this.pointInsideCircle(cursorX, cursorY, startPoint, 10)
    }
    if (isBackToStart) {
      this.drawLine(ctxDraw, start, startPoint, true)
      this.clearCanvas()
      this.createPolygon(polyList, ctxDraw)
      const newImagePathList = getPaintAreaPath(imagePathList, this.CanvasPaint, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.activeColor)
      const newSelectAreaList = new Array(newImagePathList.length).fill(false)
      this.clearCanvas()
      repaintImageByPath(newImagePathList, this.CanvasPaint, this.canvasOffsetWidth, this.canvasOffsetHeight)

      this.setState(
        {
          polyList: [],
          start: [],
          startPoint: [],
          imagePathList: newImagePathList,
          selectAreaList: newSelectAreaList
        }
      )
      return
    } else {
      ctxDraw.save()
      ctxDraw.beginPath()
      ctxDraw.strokeStyle = '#fff'
      ctxDraw.arc(cursorX, cursorY, 10, 0, Math.PI * 2, false)
      ctxDraw.closePath()
      ctxDraw.stroke()
      // this.renderAnimation(ctxDraw, cursorX, cursorY)
      if (start.length > 0) {
        ctxDraw.beginPath()
        const end = [cursorX, cursorY]
        this.drawLine(ctxDraw, start, end, true)
      } else {
        this.setState({ startPoint: [cursorX, cursorY] })
      }
      ctxDraw.restore()
    }
    const poly = [...polyList]
    poly.push([cursorX, cursorY])
    this.setState({ start: [cursorX, cursorY], polyList: poly })
  }

  drawLine = (ctx, start, end, isDash) => {
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    isDash && ctx.setLineDash([5, 15])
    ctx.moveTo(start[0], start[1])
    ctx.lineTo(end[0], end[1])
    ctx.stroke()
    ctx.setLineDash([])
    ctx.closePath()
    ctx.restore()
  }

  createPolygon = (polyList = [[ 0, 0 ]], ctx) => {
    ctx.fillStyle = this.props.activeColor.hex
    ctx.beginPath()
    ctx.moveTo(polyList[0][0], polyList[0][1])
    for (let i = 1; i < polyList.length; i++) {
      ctx.lineTo(polyList[i][0], polyList[i][1])
    }
    ctx.closePath()
    ctx.fill()
  }

  pointInsideCircle = (x, y, circle, r) => {
    let dx = circle[0] - x
    let dy = circle[1] - y
    return dx * dx + dy * dy <= r * r
  }

  paintLine = (e) => {
    e.stopPropagation()
    this.setState({ isSelect: false, edgeList: [] })
  }

  save = () => {
    let destinationCanvas = document.createElement('canvas')
    destinationCanvas.width = this.canvasOffsetWidth
    destinationCanvas.height = this.canvasOffsetHeight

    let destCtx = destinationCanvas.getContext('2d')
    /** create a rectangle with the desired color */
    destCtx.fillStyle = '#000'
    destCtx.fillRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    /** draw the original canvas onto the destination canvas */
    this.alterRGBByPixel(this.CanvasPaint, [255, 255, 255], this.canvasOffsetWidth, this.canvasOffsetHeight)
    destCtx.drawImage(this.CanvasPaint.current, 0, 0)
    this.alterRGBByPixel(this.CanvasPaint, [255, 255, 0], this.canvasOffsetWidth, this.canvasOffsetHeight)
    return destinationCanvas.toDataURL()
  }

  alterRGBByPixel = (canvas, color, width, height) => {
    const ctx = canvas.current.getContext('2d')
    let imageData = ctx.getImageData(0, 0, width, height)
    let data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = color[0]
      data[i + 1] = color[1]
      data[i + 2] = color[2]
    }
    ctx.putImageData(imageData, 0, 0)
  }

  clearArc=(cxt, x, y) => {
    cxt.save()
    cxt.globalCompositeOperation = 'destination-out'
    cxt.beginPath()
    cxt.arc(x, y, 10, 0, 2 * Math.PI, false)
    cxt.fill()
    cxt.restore()
  }

  drawCircle = (ctx, x, y) => {
    ctx.beginPath()
    ctx.strokeStyle = '#fff'
    ctx.arc(x, y, 10, 0, Math.PI * 2, false)
    ctx.fillStyle = 'blue'
    ctx.fill()
    ctx.closePath()
    ctx.stroke()
  }

  selectArea = (e) => {
    e.stopPropagation()
    this.setState({ isSelect: true })
  }

  render () {
    const img = 'src/images/scenes/chair.jpg'
    return (
      <div role='presentation' className='scene__image__wrapper' onClick={this.handleClick} ref={this.CFIWrapper}>
        <canvas style={{ opacity: 0.8 }} className='scene__image__wrapper__canvas__paint' name='canvas__paint' ref={this.CanvasPaint} />
        <canvas className='scene__image__wrapper__canvas' name='canvas' ref={this.CFICanvas} />
        <button onClick={this.selectArea}>select area</button>
        <button onClick={this.paintLine}>Draw Line</button>
        <button onClick={this.save}>Save Mask</button>
        <img className='scene__image__wrapper__image' ref={this.CFIImage} onLoad={this.handleImageLoaded} onError={this.handleImageErrored} src={img} alt='' />
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { lp } = state
  return {
    activeColor: lp.activeColor
  }
}

export default connect(mapStateToProps, null)(MaskTools)
