// @flow
import React, { PureComponent, createRef } from 'react'
import { connect } from 'react-redux'
import ColorsFromImagePin from './ColorsFromImagePin'
import { activedPinsHalfWidth, findClosestColor, renderingPins } from './data'
import { loadColors } from 'src/store/actions/loadColors'
import WithConfigurationContext from 'src/contexts/ConfigurationContext/WithConfigurationContext'
import { type Color } from 'src/shared/types/Colors.js.flow'
import ColorFromImageIndicator from './ColorFromImageIndicator'
import throttle from 'lodash/throttle'
import { injectIntl } from 'react-intl'
import { calcOrientationDimensions } from '../../shared/utils/scale.util'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import uniqueId from 'lodash/uniqueId'

type ColorFromImageState = {
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number,
  canvasTop: number,
  canvasBottom: number,
  canvasLeft: number,
  canvasRight: number,
  pinnedColors: null | Object[],
  currentPixelRGBstring: string,
  previewPinIsUpdating: boolean,
  currentPixelRGB: number[],
  mappedCanvasIndex: number,
  imageData: Uint8ClampedArray | null,
  imageStatus: string,
  indicatorTop: number,
  indicatorBottom: number,
  indicatorLeft: number,
  indicatorRight: number,
  initialWidth: number,
  initialHeight: number,
  isDeleting: false
}

type ColorFromImageProps = {
  imageUrl: string,
  width: number,
  isPortrait: boolean,
  originalIsPortrait: boolean,
  originalImageWidth: number,
  originalImageHeight: number,
  isActive: boolean,
  pins: Object[],
  intl: { locale: string, formatMessage: Function },
  maxHeight: number,
  config: { brandId: string },
  loadColors: (brandId: string, options?: {}) => void,
  colors: Color[]
}

const pinsHalfWidthWithBorder = 26

class DynamicColorFromImage extends PureComponent <ColorFromImageProps, ColorFromImageState> {
  constructor (props) {
    super(props)

    this.state = {
      canvasX: 0,
      canvasY: 0,
      canvasWidth: 0,
      canvasHeight: 0,
      canvasTop: 0,
      canvasLeft: 0,
      canvasBottom: 0,
      canvasRight: 0,
      pinnedColors: null,
      currentPixelRGBstring: 'rgb(0,0,0)',
      previewPinIsUpdating: false,
      currentPixelRGB: [0, 0, 0],
      mappedCanvasIndex: 0,
      imageData: null,
      imageStatus: 'loading',
      indicatorTop: 0,
      indicatorBottom: 0,
      indicatorLeft: 0,
      indicatorRight: 0,
      initialWidth: 0,
      initialHeight: 0,
      isDeleting: false
    }

    this.canvasRef = createRef()
    this.imageRef = createRef()
    this.wrapperRef = createRef()
    this.deleteButtonRef = createRef()
    this.indicatorRef = React.createRef()

    this.handleImageLoaded = this.handleImageLoaded.bind(this)
    this.handleImageLoadError = this.handleImageLoadError.bind(this)
    this.updateCanvasWithNewDimensions = this.updateCanvasWithNewDimensions.bind(this)
    this.setBackgroundImage = this.setBackgroundImage.bind(this)
    this.setCanvasOffset = this.setCanvasOffset.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.generatePins = this.generatePins.bind(this)
    this.handleDrag = throttle(this.handleDrag.bind(this))
    this.handleDragStop = this.handleDragStop.bind(this)
    this.handleKeyUpAfterPinMove = this.handleKeyUpAfterPinMove.bind(this)
    this.handlePinMoveByKeyboard = this.handlePinMoveByKeyboard.bind(this)
    this.borderChecking = this.borderChecking.bind(this)
    this.addNewPin = this.addNewPin.bind(this)
    this.removeSameColorPin = this.removeSameColorPin.bind(this)
    this.activatePin = this.activatePin.bind(this)
    this.removePin = this.removePin.bind(this)
    this.handleResize = throttle(this.handleResize.bind(this))
    this.deleteCurrentPin = this.deleteCurrentPin.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.getCoordsFromIndicator = this.getCoordsFromIndicator.bind(this)
  }

  componentDidMount () { this.props.loadColors(this.props.config.brandId, { language: this.props.intl.locale }) }

  componentDidUpdate (prevProps: ColorFromImageProps, prevState: ColorFromImageState) {
    if (prevProps.width && prevProps.width !== this.props.width) {
      this.handleResize(prevProps, prevState)
    }
  }
  /*:: handleResize: (prevProps: ColorFromImageProps, prevState: ColorFromImageState) => void */
  handleResize (prevProps: ColorFromImageProps, prevState: ColorFromImageState) {
    this.updateCanvasWithNewDimensions(this.props.width)
  }
  /*:: handleImageLoaded: (e: SyntheticEvent) => void */
  handleImageLoaded (e) {
    const initialDimensions = this.updateCanvasWithNewDimensions(this.props.width)
    this.setState({ initialWidth: initialDimensions.width, initialHeight: initialDimensions.height })
  }
  /*:: handleImageLoadError: () => void */
  handleImageLoadError () {
    this.setState({ imageStatus: 'failed' })
  }
  /*:: handleClick: (e: SyntheticEvent) => void */
  handleClick (e: SyntheticEvent) {
    const { isDragging, previewPinIsUpdating } = this.state
    if (!previewPinIsUpdating && !isDragging) {
      const { offsetLeft } = this.canvasRef.current
      const canvasDims = this.canvasRef.current.getBoundingClientRect()
      const position = this.borderChecking(e.clientX, e.clientY)

      let pinX = position.x - offsetLeft + activedPinsHalfWidth
      let pinY = position.y + activedPinsHalfWidth
      let offsetX = Math.floor(e.clientX - canvasDims.x)
      let offsetY = Math.floor(e.clientY - canvasDims.y)

      if (offsetX < 0) {
        offsetX = 0
      }
      if (offsetY < 0) {
        offsetY = 0
      }

      const mappedCanvasIndex = (offsetY * this.state.imageData.width + offsetX) * 4
      this.setState({
        currentPixelRGB: [this.state.imageData.data[mappedCanvasIndex], this.state.imageData.data[mappedCanvasIndex + 1], this.state.imageData.data[mappedCanvasIndex + 2]],
        currentPixelRGBstring: `rgb(${this.state.imageData.data[mappedCanvasIndex]},${this.state.imageData.data[mappedCanvasIndex + 1]},${this.state.imageData.data[mappedCanvasIndex + 2]})`,
        mappedCanvasIndex: mappedCanvasIndex,
        previewPinIsUpdating: true
      }, () => {
        this.addNewPin(pinX, pinY)
      })
    }
  }

  /*:: updateCanvasWithNewDimensions: (newWidth: number) => void */
  updateCanvasWithNewDimensions (newWidth: number): Object {
    const { isPortrait, originalIsPortrait, originalImageWidth, originalImageHeight, maxHeight } = this.props
    const ogImageWidth = originalIsPortrait === isPortrait ? originalImageWidth : originalImageHeight
    const ogImageHeight = originalIsPortrait === isPortrait ? originalImageHeight : originalImageWidth

    const newDims = calcOrientationDimensions(ogImageWidth, ogImageHeight, isPortrait, newWidth, maxHeight)

    let canvasWidth = isPortrait ? newDims.portraitWidth : newDims.landscapeWidth
    let canvasHeight = isPortrait ? newDims.portraitHeight : newDims.landscapeHeight

    const imageData = this.setBackgroundImage(canvasWidth, canvasHeight)
    this.setCanvasOffset(imageData)
    return { width: canvasWidth, height: canvasHeight }
  }
  /*:: setBackgroundImage: (width: number, height: number) => void */
  setBackgroundImage (width: number, height: number) {
    this.canvasRef.current.width = width
    this.canvasRef.current.height = height
    const ctx = this.canvasRef.current.getContext('2d')
    ctx.drawImage(this.imageRef.current, 0, 0, width, height)

    return ctx.getImageData(0, 0, width, height)
  }
  /*:: setCanvasOffset: (imageData: Object) => void */
  setCanvasOffset (imageData: Object) {
    const canvasDimensions = this.canvasRef.current.getBoundingClientRect()

    const newState = {
      canvasX: canvasDimensions.x,
      canvasY: canvasDimensions.y,
      canvasWidth: canvasDimensions.width,
      canvasHeight: canvasDimensions.height,
      canvasTop: canvasDimensions.top,
      canvasBottom: canvasDimensions.bottom,
      canvasLeft: canvasDimensions.left,
      canvasRight: canvasDimensions.right,
      imageData
    }

    if (!this.state.pinnedColors) {
      const renderedPins = renderingPins(this.props.pins, canvasDimensions.width, canvasDimensions.height, this.props.colors)
      newState.pinnedColors = renderedPins
    }

    this.setState(newState)
  }

  handleTouchEnd (dims: any, pinId: string) {
    this.handleDragStop(dims, pinId)
  }

  /*:: generatePins: (pins: Object[]) => void */
  generatePins (pins: Object[]) {
    return pins.map((pinnedColor, index) => {
      // Bitwise rounding since this can be called alot...every little BIT helps
      const translateX = pinnedColor.translateX * (this.state.canvasWidth / this.state.initialWidth) + this.canvasRef.current.offsetLeft
      const translateY = pinnedColor.translateY * (this.state.canvasHeight / this.state.initialHeight)

      return (
        <ColorsFromImagePin
          key={`push${index}`}
          color={pinnedColor}
          translateX={translateX}
          translateY={translateY}
          useTranslateProps
          handlePinMoveByKeyboard={this.handlePinMoveByKeyboard}
          handleKeyUpAfterPinMove={this.handleKeyUpAfterPinMove}
          handleDrag={this.handleDrag}
          deleteCurrentPin={this.deleteCurrentPin}
          handleDragStop={this.handleDragStop}
          activatePin={this.activatePin}
          handleTouchEnd={this.handleTouchEnd}
        />
      )
    })
  }
  /*:: activatePin: (pinNumber: number) => void */
  activatePin (pinNumber: number) {
    const pinnedColorClicked = this.state.pinnedColors.findIndex((colors) => {
      return colors.pinNumber === parseInt(pinNumber)
    })

    const lastActivedPin = this.state.pinnedColors.findIndex((colors) => {
      return colors.isActiveFlag === true
    })

    const clonePins = this.state.pinnedColors.map(pin => {
      return { ...pin }
    })

    if (pinnedColorClicked !== -1) {
      clonePins[pinnedColorClicked].isActiveFlag = true
      clonePins[pinnedColorClicked].isMovingPin = true
      if (lastActivedPin !== -1) {
        clonePins[lastActivedPin].isActiveFlag = false
        clonePins[lastActivedPin].isMovingPin = false
      }

      this.setState({
        pinnedColors: clonePins
      })
    }
  }
  /*:: addNewPin: (cursorX: number, cursorY: number) => void */
  addNewPin (cursorX: number, cursorY: number) {
    const color = findClosestColor(this.state.currentPixelRGB, this.props.colors)
    const currentPixelRGB = `${color.red},${color.green},${color.blue}`
    const clonePins = this.state.pinnedColors.map(pins => {
      return { ...pins }
    })
    const activePinIndex = this.state.pinnedColors.findIndex((colors) => {
      return colors.isActiveFlag
    })
    if (activePinIndex !== -1) {
      clonePins[activePinIndex].isActiveFlag = false
    }
    let isContentLeft = false

    if (cursorX < this.canvasRef.current.width / 2) {
      isContentLeft = true
    }
    const newPins = this.removeSameColorPin(clonePins, color)

    this.setState({
      color,
      currentPixelRGB,
      currentPixelRGBstring: `rgb(${currentPixelRGB})`,
      previewPinIsUpdating: false,
      previewColorName: color.colorName,
      previewColorNumber: color.colorNumber,
      pinnedColors: [
        ...newPins,
        {
          ...color,
          rgbValue: `rgb(${currentPixelRGB})`,
          // The translated values are calculated this way due to resize.
          // To keep the logic simpler the pin generator always calcs the scale factor and the new pins translate values are always in reference to the initial canvas size.
          // When there is no resize, scale should be 1 here and in the pin generator. the scales for user added pins is the inverse of the pin generators scale.
          translateX: (cursorX - activedPinsHalfWidth) * this.state.initialWidth / this.state.canvasWidth,
          translateY: (cursorY - activedPinsHalfWidth) * this.state.initialHeight / this.state.canvasHeight,
          pinNumber: newPins.length,
          isActiveFlag: true,
          isContentLeft: isContentLeft,
          pinId: uniqueId('pin_')
        }
      ]
    })
  }
  /*:: removeSameColorPin: (currentPins: Array<any>, index: number) => Object[] */
  removeSameColorPin (currentPins: any[], color: Color) {
    const duplicatePinIndex = currentPins.findIndex((colors) => {
      return colors.rgbValue === `rgb(${color.red},${color.green},${color.blue})`
    })
    if (duplicatePinIndex !== -1) { currentPins.splice(duplicatePinIndex, 1) }

    return currentPins.map((pins: Object, index: number): {} => ({ ...pins, pinNumber: index }))
  }
  /*:: deleteCurrentPin: (pinNumber: number) => void */
  deleteCurrentPin (pinNumber: number) {
    const clonePins = this.state.pinnedColors.map((pin) => {
      return { ...pin }
    })

    clonePins.splice(pinNumber, 1)
    const newPins = clonePins.map((pins, index) => {
      pins.pinNumber = index
      return pins
    })

    this.setState({ pinnedColors: newPins })
  }
  /*:: removePin: (e: SyntheticEvent) => */
  removePin (e: SyntheticEvent) {
    e.stopPropagation()
    const clonedPins = this.state.pinnedColors.map(pin => {
      return { ...pin }
    })
    const pinsWithoutActiveFlag = clonedPins.filter((colors, index) => {
      return colors.isActiveFlag !== true
    })
    if (pinsWithoutActiveFlag.length === clonedPins.length - 1) {
      const pinsWithoutActiveFlagIndexUpdated = pinsWithoutActiveFlag.map((colors, index) => {
        colors.pinNumber = index
        return colors
      })
      this.setState({
        pinnedColors: pinsWithoutActiveFlagIndexUpdated
      })
    }
  }
  /*:: handlePinMoveByKeyboard: (movingPinData: Object) => */
  handlePinMoveByKeyboard (movingPinData: Object) {
    const canvasOffset = this.canvasRef.current.getBoundingClientRect()
    let cursorX = movingPinData.offsetX - Math.floor(canvasOffset.x)
    let cursorY = movingPinData.offsetY - Math.floor(canvasOffset.y)
    let isContentLeft = false
    if (cursorX < this.state.canvasWidth / 2) {
      isContentLeft = true
    }
    if (cursorX < pinsHalfWidthWithBorder) {
      cursorX = pinsHalfWidthWithBorder
    } else if (cursorX > this.state.canvasWidth - pinsHalfWidthWithBorder) {
      cursorX = this.state.canvasWidth - pinsHalfWidthWithBorder
    }

    if (cursorY < pinsHalfWidthWithBorder) {
      cursorY = pinsHalfWidthWithBorder
    } else if (cursorY > this.state.canvasHeight - pinsHalfWidthWithBorder) {
      cursorY = this.state.canvasHeight - pinsHalfWidthWithBorder
    }

    const mappedCanvasIndex = (cursorY * this.state.imageData.width + cursorX) * 4
    // The translated values are calculated this way due to resize.
    // To keep the logic simpler the pin generator always calcs the scale factor and the new pins translate values are always in reference to the initial canvas size.
    // When there is no resize, scale should be 1 here and in the pin generator. the scales for user added pins is the inverse of the pin generators scale.
    const translateX = (cursorX - activedPinsHalfWidth) * this.state.initialWidth / this.state.canvasWidth
    const translateY = (cursorY - activedPinsHalfWidth) * this.state.initialHeight / this.state.canvasHeight
    const color = findClosestColor([this.state.imageData.data[mappedCanvasIndex], this.state.imageData.data[mappedCanvasIndex + 1], this.state.imageData.data[mappedCanvasIndex + 2]], this.props.colors)
    const currentPixelRGB = `${color.red},${color.green},${color.blue}`
    const newRgb = `rgb(${currentPixelRGB})`

    const clonedPins = this.state.pinnedColors.map(pin => {
      return { ...pin }
    })
    const pinNumber = movingPinData.pinNumber
    const duplicatePinIndex = clonedPins.findIndex((colors) => {
      return parseInt(colors.pinNumber, 10) !== parseInt(pinNumber, 10) && colors.rgbValue === newRgb && !colors.hide
    })
    clonedPins[pinNumber].rgbValue = newRgb
    clonedPins[pinNumber].translateX = translateX
    clonedPins[pinNumber].translateY = translateY
    clonedPins[pinNumber].isActiveFlag = true
    clonedPins[pinNumber].isContentLeft = isContentLeft
    clonedPins[pinNumber].colorName = color.colorName
    clonedPins[pinNumber].colorNumber = color.colorNumber

    if (duplicatePinIndex !== -1) {
      clonedPins[duplicatePinIndex].hide = true
    }
    this.setState({
      pinnedColors: clonedPins
    })
  }
  /*:: handleKeyUpAfterPinMove: (movingPinNumber: number) => void */
  handleKeyUpAfterPinMove (movingPinNumber: number) {
    const clonedPins = this.state.pinnedColors.map(pin => {
      return { ...pin }
    })
    const newPins = clonedPins.filter((pins, index) => {
      return !pins.hide
    })
    const newPinsIndexUpdated = newPins.map((pins, index) => {
      if (parseInt(pins.pinNumber, 10) === parseInt(movingPinNumber, 10)) {
        pins.isMovingPin = true
      } else {
        pins.isMovingPin = false
      }
      pins.pinNumber = index
      return pins
    })
    this.setState({
      pinnedColors: newPinsIndexUpdated
    })
  }
  /*:: borderChecking: (x: number, y: number) => Object */
  borderChecking (x: number, y: number) {
    const canvasDims = this.canvasRef.current.getBoundingClientRect()
    const { offsetLeft, offsetTop } = this.canvasRef.current

    // Assume everything is fine, this is the default case
    let top = y - activedPinsHalfWidth
    let bottom = 0
    let left = x - canvasDims.left - activedPinsHalfWidth + offsetLeft

    let right = 0

    // Too far left
    if (x < canvasDims.left + activedPinsHalfWidth) {
      left = offsetLeft
    }
    // Too far right
    if (x > canvasDims.right - activedPinsHalfWidth) {
      left = offsetLeft + canvasDims.width - (activedPinsHalfWidth * 2)
    }
    // Too far up
    if (y < canvasDims.top + activedPinsHalfWidth) {
      top = offsetTop
    }
    // Too far down
    if (y > canvasDims.bottom - activedPinsHalfWidth) {
      top = offsetTop + canvasDims.height - (activedPinsHalfWidth * 2)
    }

    // Bitwise rounding
    left = left | 1
    top = top | 1

    let _x = left
    let _y = top

    const box = {
      top,
      bottom,
      left,
      right,
      x: _x,
      y: _y
    }

    return box
  }
  /*:: handleDrag: (x: number, y: number) => void */
  handleDrag (x: number, y: number) {
    // determine if mouse is above the deleteBtn
    const deleteButtonOffset = this.deleteButtonRef.current.getBoundingClientRect()
    const deleteButtonR = deleteButtonOffset.width / 2
    const deleteButtonX = deleteButtonOffset.x + deleteButtonR
    const deleteButtonY = deleteButtonOffset.y + deleteButtonR
    const circleDistance = Math.sqrt(Math.pow((deleteButtonX - x), 2) + Math.pow((deleteButtonY - y), 2))
    const isDeleting = circleDistance < (activedPinsHalfWidth + deleteButtonR)

    const position = this.borderChecking(x, y)
    const canvasDims = this.canvasRef.current.getBoundingClientRect()
    // Bitwise rounding, since this happens pretty often
    let offsetX = x - canvasDims.x | 0
    if (offsetX < 0) {
      offsetX = 0
    }
    if (offsetX > canvasDims.width - 1) {
      offsetX = canvasDims.width - 1
    }
    let offsetY = y - canvasDims.y | 0
    if (offsetY < 0) {
      offsetY = 0
    }
    if (offsetY > canvasDims.height - 1) {
      offsetY = canvasDims.height - 1
    }
    const mappedCanvasIndex = (offsetY * this.state.imageData.width + offsetX) * 4
    const currentPixelRGBstring = `rgb(${this.state.imageData.data[mappedCanvasIndex]},${this.state.imageData.data[mappedCanvasIndex + 1]},${this.state.imageData.data[mappedCanvasIndex + 2]})`
    this.setState({
      indicatorTop: position.top,
      indicatorBottom: position.bottom,
      indicatorLeft: position.left,
      indicatorRight: position.right,
      currentPixelRGBstring,
      isDragging: true,
      isDeleting
    })
  }

  // This method is used by mobile browsers to get the pointer  (by proxy) location when input coords are unavailable
  getCoordsFromIndicator () {
    const x = Math.floor(this.state.indicatorLeft + activedPinsHalfWidth)
    const y = Math.floor(this.state.indicatorTop + activedPinsHalfWidth)

    return { x, y }
  }

  /*:: handleDragStop: (e: SyntheticEvent, pinId: string) => */
  handleDragStop (e: SyntheticEvent, pinId: string) {
    const isTouchEvent = e.clientX === void (0)
    const { previewPinIsUpdating, isDragging } = this.state

    if (!previewPinIsUpdating && isDragging) {
      const { offsetLeft } = this.canvasRef.current
      const canvasDims = this.canvasRef.current.getBoundingClientRect()
      const position = this.borderChecking(e.clientX, e.clientY)
      let pinX = position.x - offsetLeft + activedPinsHalfWidth
      let pinY = position.y + activedPinsHalfWidth
      // Bitwise rounding, since this happens pretty often
      let offsetX = e.clientX - canvasDims.x | 0
      let offsetY = e.clientY - canvasDims.y | 0

      if (isTouchEvent) {
        const touchCoords = this.getCoordsFromIndicator()
        offsetX = touchCoords.x
        offsetY = touchCoords.y

        pinX = touchCoords.x - offsetLeft
        pinY = touchCoords.y
      } else {
        if (offsetX < 0) {
          offsetX = 0
        }
        if (offsetX > canvasDims.width - 1) {
          offsetX = canvasDims.width - 1
        }
        if (offsetY < 0) {
          offsetY = 0
        }
        if (offsetY > canvasDims.height - 1) {
          offsetY = canvasDims.height - 1
        }
      }

      const mappedCanvasIndex = (offsetY * this.state.imageData.width + offsetX) * 4

      if (this.state.isDeleting) {
        const pinnedColors = this.state.pinnedColors.filter(item => item.pinId !== pinId)
        this.setState({ isDragging: false, isDeleting: false, pinnedColors })
      } else {
        this.setState({
          currentPixelRGB: [this.state.imageData.data[mappedCanvasIndex], this.state.imageData.data[mappedCanvasIndex + 1], this.state.imageData.data[mappedCanvasIndex + 2]],
          currentPixelRGBstring: `rgb(${this.state.imageData.data[mappedCanvasIndex]},${this.state.imageData.data[mappedCanvasIndex + 1]},${this.state.imageData.data[mappedCanvasIndex + 2]})`,
          isDragging: false
        }, () => {
          this.addNewPin(pinX, pinY)
        })
      }
    }
  }
  pinRemove () {

  }

  render () {
    return (
      <>
        <div role='presentation' className='colorfrom__image__wrapper' ref={this.wrapperRef}>
          <canvas
            className='colorfrom__image__wrapper__canvas'
            ref={this.canvasRef}
            onClick={this.handleClick}>{this.props.intl.formatMessage({ id: 'CANVAS_UNSUPPORTED' })}</canvas>
          <img
            className='colorfrom__image__wrapper__image--hidden'
            ref={this.imageRef}
            onLoad={this.handleImageLoaded}
            onError={this.handleImageLoadError}
            src={this.props.imageUrl}
            alt={this.props.intl.formatMessage({ id: 'IMAGE_INVISIBLE' })} />
          {this.props.isActive && (this.state.pinnedColors && this.state.pinnedColors.length) ? this.generatePins(this.state.pinnedColors) : null}
          {this.props.isActive && this.state.isDragging ? <ColorFromImageIndicator
            top={this.state.indicatorTop}
            bottom={this.state.indicatorBottom}
            left={this.state.indicatorLeft}
            right={this.state.indicatorRight}
            currentPixelRGBstring={this.state.currentPixelRGBstring} /> : null}
          <button
            ref={this.deleteButtonRef}
            title={`${this.props.intl.formatMessage({ id: 'DELETE_COLOR' })}`}
            className={`scene__image__wrapper__delete-pin ${this.state.isDeleting ? 'scene__image__wrapper__delete-pin--active' : ''}`}
            style={{ display: this.state.isDragging || (this.state.pinnedColors && this.state.pinnedColors.some(c => c.isActiveFlag)) ? 'flex' : 'none' }}
            onClick={this.removePin}
          >
            <FontAwesomeIcon icon='trash' size='1x' />
          </button>
        </div>
      </>
    )
  }
}

export default injectIntl(connect(
  ({ colors }) => ({ colors: colors.unorderedColors }),
  { loadColors }
)(WithConfigurationContext(DynamicColorFromImage)))
