'use strict'

import React, { PureComponent, Fragment, createRef } from 'react'
import { brandColors } from './sw-colors-in-LAB.js'
import { getDeltaE00 } from 'delta-e'
import ColorsFromImagePin from './ColorsFromImagePin'

import './ColorsFromImage.scss'

const baseClass = 'match-photo-picker'
const wrapperClass = `${baseClass}__wrapper`
const canvasClass = `${baseClass}__canvas`
const hiddenImageClass = `${baseClass}__hidden-image`
const portraitOrientation = `${canvasClass}--portrait`

class ColorsFromImage extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
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

    this.findBrandColorTimeout = null
    this.brandColorsLength = brandColors.length
    this.CFICanvas = createRef()
    this.CFIWrapper = createRef()
    this.imageRef = createRef()
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
    this.CFICanvasContext = this.CFICanvas.current.getContext('2d')
    // eslint-disable-next-line react/prop-types
    this.handleResize(this.props.width, this.props.height)
  }

  addPin () {
    console.log('Adding pin')
  }

  handleResize (width, height) {
    // @todo - determine if I need to set/get the pixeldata
    this.CFICanvasContext.clearRect(0, 0, width, height)
    // eslint-disable-next-line react/prop-types
    this.CFICanvasContext.drawImage(this.imageRef.current, 0, 0, width, height)

    this.canvasOffset = this.CFICanvas.current.getBoundingClientRect()
    this.wrapperOffset = this.CFIWrapper.current.getBoundingClientRect()
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

  // @todo - fix coords -RS
  wrapperMouseMove (e) {
    if (!this.state.previewPinIsUpdating) {
      const cursorX = e.clientX - this.wrapperOffset.left // can also try screenX or pageX
      const cursorY = e.clientY - this.wrapperOffset.top
      // const mappedCanvasIndex = (cursorY * this.state.canvasWidth + cursorX) * 4
      // Using a bitwise or to trunc here since it is much faster than something like Math.trunc()
      const mappedCanvasIndex = (((e.clientY - this.canvasOffset.top) * this.state.canvasWidth) + (e.clientX - this.canvasOffset.left | 0)) * 4
      // eslint-disable-next-line react/prop-types
      const imageData = this.props.data.imageData.data

      this.setState({
        currentPixelRGB: [imageData[mappedCanvasIndex], imageData[mappedCanvasIndex + 1], imageData[mappedCanvasIndex + 2]],
        currentPixelRGBstring: 'rgb(' + imageData[mappedCanvasIndex] + ',' + imageData[mappedCanvasIndex + 1] + ',' + imageData[mappedCanvasIndex + 2] + ')',
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

  componentDidUpdate (prevProps, prevState) {
    // eslint-disable-next-line react/prop-types
    if (prevProps.width !== this.props.width) {
      // eslint-disable-next-line react/prop-types
      this.handleResize(prevProps.width, prevProps.height)
    }
  }

  render () {
    // eslint-disable-next-line react/prop-types
    const { isPortrait, img } = this.props.data

    const { previewPinIsActive, previewPinX, previewPinY, previewColorName, previewColorNumber, currentPixelRGBstring } = this.state
    const transformValue = `translate(${previewPinX}px, ${previewPinY}px)`

    return (
      <Fragment>
        <img ref={this.imageRef} className={hiddenImageClass} src={img} onLoad={this.handleImageLoaded} alt='hidden' />
        <div onMouseMove={this.wrapperMouseMove} className={wrapperClass} ref={this.CFIWrapper}>
          {/* eslint-disable-next-line react/prop-types */}
          <canvas className={isPortrait ? portraitOrientation : canvasClass} ref={this.CFICanvas} width={this.props.width} height={this.props.height} />
          <ColorsFromImagePin key='1'
            isActiveFlag={previewPinIsActive}
            pinType='preview'
            previewColorName={previewColorName}
            previewColorNumber={previewColorNumber}
            RGBstring={currentPixelRGBstring}
            transformValue={transformValue}
            onClickMethod={this.addPin} />
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
