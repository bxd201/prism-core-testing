'use strict'

import React, { PureComponent, Fragment } from 'react'
import { brandColors } from './sw-colors-in-LAB.js'
import { getDeltaE00 } from 'delta-e'
import ColorsFromImagePin from './ColorsFromImagePin'

class ColorsFromImage extends PureComponent {
  state = {
    previewPinIsUpdating: false,
    previewPinIsActive: false,
    previewColorName: '',
    previewColorNumber: '',
    cursorIsPaused: false,
    cursorX: 0,
    cursorY: 0,
    previewPinX: 0,
    previewPinY: 0,
    mappedCanvasIndex: 0,
    currentPixelRGB: [0, 0, 0],
    currentPixelRGBstring: 'rgb(0,0,0)',
    currentBrandColorIndex: null,
    pinnedColors: [],
    activePinIndex: -1,
    currentPinIndex: -1,
    imageStatus: 'loading'
  }

  constructor (props) {
    super(props)

    this.findBrandColorTimeout = null
    this.brandColorsLength = brandColors.length
    this.CFICanvas = React.createRef()
    this.CFIWrapper = React.createRef()
    this.CFIImage = React.createRef()
    this.canvasHeight = 487 // 974 / 2 frog
    this.canvasWidth = 898 // 1796 / 2  frog
    this.handleImageLoaded = this.handleImageLoaded.bind(this)
    this.handleImageErrored = this.handleImageErrored.bind(this)
    this.initCanvas = this.initCanvas.bind(this)
    this.wrapperMouseMove = this.wrapperMouseMove.bind(this)
    this.rgb2lab = this.rgb2lab.bind(this)
    this.findBrandColor = this.findBrandColor.bind(this)
    this.updatePreviewPin = this.updatePreviewPin.bind(this)
  }

  rgb2lab (rgb) {
    // eslint-disable-next-line one-var
    var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      x, y, z

    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

    x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116
    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116
    z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116

    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
  }

  handleImageLoaded () {
    this.setState({ imageStatus: 'loaded' })
    this.initCanvas()
  }

  handleImageErrored () {
    this.setState({ imageStatus: 'failed' })
  }

  initCanvas () {
    this.CFICanvas.current.height = this.canvasHeight
    this.CFICanvas.current.width = this.canvasWidth
    this.CFICanvasContext = this.CFICanvas.current.getContext('2d')
    this.CFICanvasContext.drawImage(this.CFIImage.current, 0, 0, this.canvasWidth, this.canvasHeight)
    this.imageData = this.CFICanvasContext.getImageData(0, 0, this.canvasWidth, this.canvasHeight) // imageObj.width
    this.imageDataData = this.imageData.data

    this.imageWrapperOffset = this.CFIWrapper.current.getBoundingClientRect()
    this.imageWrapperOffsetTop = this.imageWrapperOffset.top
    this.imageWrapperOffsetLeft = this.imageWrapperOffset.left
  }

  addPin () {
    console.log('Adding pin')
  }

  findBrandColor () {
    let currentPixelInLABarray = this.rgb2lab(this.state.currentPixelRGB)
    let currentPixelInLAB = { L: currentPixelInLABarray[0], A: currentPixelInLABarray[1], B: currentPixelInLABarray[2] }

    for (var arrayIndex = 0; arrayIndex < this.brandColorsLength; arrayIndex += 6) {
      let thisSWinLAB = { L: brandColors[arrayIndex + 3], A: brandColors[arrayIndex + 4], B: brandColors[arrayIndex + 5] }
      let colorDistance = getDeltaE00(currentPixelInLAB, thisSWinLAB)

      if (colorDistance < 12) {
        this.setState({ currentBrandColorIndex: arrayIndex, currentPixelRGB: brandColors[arrayIndex + 2], currentPixelRGBstring: 'rgb(' + brandColors[arrayIndex + 2] + ')', previewPinIsActive: true, previewColorName: brandColors[arrayIndex], previewColorNumber: brandColors[arrayIndex + 1] })
        arrayIndex = this.brandColorsLength // This is to kick us out of the inner loop, since we've found a good match
      }
    }
  }

  updatePreviewPin () {
    let _this = this
    this.previewPinIsUpdating = true

    // This is manually debouncing cursor position updates
    window.setTimeout(function () { _this.setState({ previewPinIsUpdating: false }) }, 50)

    // Clear the previous mouse move call to findBrandColor and set a new one for the current cursor position
    window.clearTimeout(this.findBrandColorTimeout)
    this.findBrandColorTimeout = window.setTimeout(this.findBrandColor, 700)
  }

  wrapperMouseMove (e) {
    if (!this.state.previewPinIsUpdating) {
      const cursorX = e.clientX - this.imageWrapperOffsetLeft // can also try screenX or pageX
      const cursorY = e.clientY - this.imageWrapperOffsetTop
      const mappedCanvasIndex = (cursorY * this.canvasWidth + cursorX) * 4

      this.setState({
        currentPixelRGB: [this.imageDataData[mappedCanvasIndex], this.imageDataData[mappedCanvasIndex + 1], this.imageDataData[mappedCanvasIndex + 2]],
        currentPixelRGBstring: 'rgb(' + this.imageDataData[mappedCanvasIndex] + ',' + this.imageDataData[mappedCanvasIndex + 1] + ',' + this.imageDataData[mappedCanvasIndex + 2] + ')',
        mappedCanvasIndex: mappedCanvasIndex,
        previewPinIsUpdating: true,
        previewPinIsActive: false,
        previewPinX: cursorX,
        previewPinY: cursorY }, () => {
        (() => { this.updatePreviewPin() })()
      })
    }
  }

  componentDidMount () {
    this.initCanvas()
  }

  render () {
    // eslint-disable-next-line one-var
    const { previewPinIsActive, previewPinX, previewPinY, previewColorName, previewColorNumber, currentPixelRGBstring } = this.state
    const transformValue = `translate(${previewPinX}px, ${previewPinY}px)`
    const CIFwrapperClass = ''

    return (
      <Fragment>
        <div onMouseMove={this.wrapperMouseMove} className={'CFIwrapper ' + CIFwrapperClass} ref={this.CFIWrapper}>
          <canvas className='CFIcanvas' ref={this.CFICanvas} />
          <img className='CFIimage' ref={this.CFIImage} onLoad={this.handleImageLoaded} onError={this.handleImageErrored} src='/src/images/colors-from-image/frog.png' alt='' />
          <ColorsFromImagePin key='1' isActiveFlag={previewPinIsActive} pinType='preview' previewColorName={previewColorName} previewColorNumber={previewColorNumber} RGBstring={currentPixelRGBstring} transformValue={transformValue} onClickMethod={this.addPin} />
        </div>
      </Fragment>
    )
  }
}

export default ColorsFromImage

/*
-------------------------------------------------------------------------------------------
------------------ ### TO DO ### ------------------
-------------------------------------------------------------------------------------------
Do three steps of increasing fidelity checking in findBrandColor

Memoize result of findBrandColor

Confirm that I'm manually debouncing mousemove
*/
