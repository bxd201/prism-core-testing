// @flow
import React, { PureComponent, createRef } from 'react'
import ColorsFromImagePin from './ColorsFromImagePin'
import { getScaledLandscapeHeight, getScaledPortraitHeight } from '../../shared/helpers/ImageUtils'
import { activedPinsHalfWidth, findBrandColor, renderingPins } from './data'
import ColorFromImageIndicator from './ColorFromImageIndicator'
import { brandColors } from './sw-colors-in-LAB'
import ColorFromImageDeleteButton from './ColorFromImageDeleteButton'
import throttle from 'lodash/throttle'

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
  initialHeight: number
}

type ColorFromImageProps = {
  imageUrl: string,
  width: number,
  isPortrait: boolean,
  originalIsPortrait: boolean,
  originalImageWidth: number,
  originalImageHeight: number,
  isActive: boolean,
  pins: Object[]
}

const getCanvasClassName = (isPortrait) => {
  const base = 'scene__image__wrapper__canvas'

  if (isPortrait) {
    return base + '--portrait'
  }

  return base
}

const shouldShowDelete = (pins) => {
  let shouldShow = false
  if (!pins) {
    return false
  }

  pins.some(pin => {
    if (pin.isActiveFlag) {
      shouldShow = true
      return shouldShow
    }
  })

  return shouldShow
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
      initialHeight: 0
    }

    this.canvasRef = createRef()
    this.imageRef = createRef()
    this.wrapperRef = createRef()

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
  }

  componentDidUpdate (prevProps: ColorFromImageProps, prevState: ColorFromImageState) {
    if (prevProps.width && prevProps.width !== this.props.width) {
      this.handleResize(prevProps, prevState)
      // @todo - Have not found a good way to redraw the pins. -RS
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
      const pinX = position.x - offsetLeft + activedPinsHalfWidth
      const pinY = position.y + activedPinsHalfWidth
      let offsetX = e.clientX - canvasDims.x | 1
      let offsetY = e.clientY - canvasDims.y | 1

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
    let canvasWidth = 0
    const wrapperWidth = newWidth

    if (this.props.isPortrait) {
      canvasWidth = wrapperWidth / 2
    } else {
      // Landscape
      canvasWidth = wrapperWidth
    }
    // Rounding via bitwise or since this could be called A LOT
    canvasWidth = canvasWidth | 1

    let canvasHeight = 0

    if (this.props.isPortrait) {
      if (this.props.originalIsPortrait) {
        canvasHeight = Math.floor(getScaledPortraitHeight(this.props.originalImageWidth, this.props.originalImageHeight)(canvasWidth))
      } else {
        canvasHeight = Math.floor(getScaledPortraitHeight(this.props.originalImageHeight, this.props.originalImageWidth)(canvasWidth))
      }
    } else {
      if (this.props.originalIsPortrait) {
        canvasHeight = Math.floor(getScaledLandscapeHeight(this.props.originalImageWidth, this.props.originalImageHeight)(canvasWidth))
      } else {
        // Swap width and height for photos that are originally landscape
        canvasHeight = Math.floor(getScaledLandscapeHeight(this.props.originalImageHeight, this.props.originalImageWidth)(canvasWidth))
      }
    }
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
      const renderedPins = renderingPins(this.props.pins, canvasDimensions.width, canvasDimensions.height)
      newState.pinnedColors = renderedPins
    }

    this.setState(newState)
  }
  /*:: generatePins: (pins: Object[]) => void */
  generatePins (pins: Object[]) {
    return pins.map((pinnedColor, index) => {
      const translateX = pinnedColor.translateX + this.canvasRef.current.offsetLeft

      return (<ColorsFromImagePin key={`push${index}`}
        isActiveFlag={pinnedColor.isActiveFlag}
        isContentLeft={pinnedColor.isContentLeft}
        previewColorName={`${pinnedColor.colorName}`}
        previewColorNumber={`${pinnedColor.colorNumber}`}
        RGBstring={`${pinnedColor.rgbValue}`}
        translateX={`${translateX}`}
        translateY={`${pinnedColor.translateY}`}
        pinNumber={`${pinnedColor.pinNumber}`}
        handlePinMoveByKeyboard={this.handlePinMoveByKeyboard}
        handleKeyUpAfterPinMove={this.handleKeyUpAfterPinMove}
        hide={pinnedColor.hasOwnProperty('hide') && pinnedColor.hide}
        isMovingPin={pinnedColor.hasOwnProperty('isMovingPin') && pinnedColor.isMovingPin}
        handleDrag={this.handleDrag}
        handleDragStop={this.handleDragStop}
        activatePin={this.activatePin}
        deleteCurrentPin={this.deleteCurrentPin} />)
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
    const arrayIndex = findBrandColor(this.state.currentPixelRGB)
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
    const newPins = this.removeSameColorPin(clonePins, arrayIndex)
    this.setState({
      currentBrandColorIndex: arrayIndex,
      currentPixelRGB: brandColors[arrayIndex + 2],
      currentPixelRGBstring: 'rgb(' + brandColors[arrayIndex + 2] + ')',
      previewPinIsUpdating: false,
      previewColorName: brandColors[arrayIndex],
      previewColorNumber: brandColors[arrayIndex + 1],
      pinnedColors: [
        ...newPins,
        {
          colorName: brandColors[arrayIndex],
          colorNumber: brandColors[arrayIndex + 1],
          rgbValue: 'rgb(' + brandColors[arrayIndex + 2] + ')',
          translateX: cursorX - activedPinsHalfWidth,
          translateY: cursorY - activedPinsHalfWidth,
          pinNumber: newPins.length,
          isActiveFlag: true,
          isContentLeft: isContentLeft
        }
      ]
    })
  }
  /*:: removeSameColorPin: (currentPins: Array<any>, index: number) => Object[] */
  removeSameColorPin (currentPins: Array<any>, index: number) {
    const duplicatePinIndex = currentPins.findIndex((colors) => {
      return colors.rgbValue === 'rgb(' + brandColors[index + 2] + ')'
    })
    if (duplicatePinIndex !== -1) {
      currentPins.splice(duplicatePinIndex, 1)
    }

    const newPins = currentPins.map<Object>((pins: Object, index: number): Object => {
      pins.pinNumber = index
      return pins
    })

    return newPins
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
    let cursorX = movingPinData.offsetX - canvasOffset.x
    let cursorY = movingPinData.offsetY - canvasOffset.y
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
    const translateX = cursorX - activedPinsHalfWidth
    const translateY = cursorY - activedPinsHalfWidth
    const arrayIndex = findBrandColor([this.state.imageData.data[mappedCanvasIndex], this.state.imageData.data[mappedCanvasIndex + 1], this.state.imageData.data[mappedCanvasIndex + 2]])
    const newRgb = `rgb(${brandColors[arrayIndex + 2]})`
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
    clonedPins[pinNumber].colorName = brandColors[arrayIndex]
    clonedPins[pinNumber].colorNumber = brandColors[arrayIndex + 1]

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
    let top = y - canvasDims.top - activedPinsHalfWidth
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
    const position = this.borderChecking(x, y)
    const canvasDims = this.canvasRef.current.getBoundingClientRect()
    // Bitwise rounding
    const offsetX = x - canvasDims.x | 1
    const offsetY = y - canvasDims.y | 1
    const mappedCanvasIndex = (offsetY * this.state.imageData.width + offsetX) * 4
    const currentPixelRGBstring = `rgb(${this.state.imageData.data[mappedCanvasIndex]},${this.state.imageData.data[mappedCanvasIndex + 1]},${this.state.imageData.data[mappedCanvasIndex + 2]})`
    this.setState({
      indicatorTop: position.top,
      indicatorBottom: position.bottom,
      indicatorLeft: position.left,
      indicatorRight: position.right,
      currentPixelRGBstring,
      isDragging: true })
  }
  /*:: handleDragStop: (e: SyntheticEvent) => */
  handleDragStop (e: SyntheticEvent) {
    const { previewPinIsUpdating, isDragging } = this.state
    if (!previewPinIsUpdating && isDragging) {
      const { offsetLeft } = this.canvasRef.current
      const canvasDims = this.canvasRef.current.getBoundingClientRect()
      const position = this.borderChecking(e.clientX, e.clientY)
      const pinX = position.x - offsetLeft + activedPinsHalfWidth
      const pinY = position.y + activedPinsHalfWidth
      const offsetX = e.clientX - canvasDims.x | 1
      const offsetY = e.clientY - canvasDims.y | 1
      const mappedCanvasIndex = (offsetY * this.state.imageData.width + offsetX) * 4

      this.setState({
        currentPixelRGB: [this.state.imageData.data[mappedCanvasIndex], this.state.imageData.data[mappedCanvasIndex + 1], this.state.imageData.data[mappedCanvasIndex + 2]],
        currentPixelRGBstring: `rgb(${this.state.imageData.data[mappedCanvasIndex]},${this.state.imageData.data[mappedCanvasIndex + 1]},${this.state.imageData.data[mappedCanvasIndex + 2]})`,
        isDragging: false
      }, () => {
        this.addNewPin(pinX, pinY)
      })
    }
  }

  render () {
    return (
      <>
        <div role='presentation' className='scene__image__wrapper' ref={this.wrapperRef}>
          <canvas
            className={getCanvasClassName(this.props.isPortrait)}
            ref={this.canvasRef}
            onClick={this.handleClick} />
          <img
            className='scene__image__wrapper__image--hidden'
            ref={this.imageRef}
            onLoad={this.handleImageLoaded}
            onError={this.handleImageLoadError}
            src={this.props.imageUrl}
            alt='invisible' />
          {this.props.isActive && (this.state.pinnedColors && this.state.pinnedColors.length) ? this.generatePins(this.state.pinnedColors) : null}
          {this.props.isActive && this.state.isDragging ? <ColorFromImageIndicator
            top={this.state.indicatorTop}
            bottom={this.state.indicatorBottom}
            left={this.state.indicatorLeft}
            right={this.state.indicatorRight}
            currentPixelRGBstring={this.state.currentPixelRGBstring} /> : null}
          <ColorFromImageDeleteButton isVisible={shouldShowDelete(this.state.pinnedColors)} clickHandler={this.removePin} />
        </div>
      </>
    )
  }
}

export default DynamicColorFromImage
