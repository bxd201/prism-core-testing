// @flow
import React, { PureComponent } from 'react'
import './MaskTools.scss'
import { connect } from 'react-redux'
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
