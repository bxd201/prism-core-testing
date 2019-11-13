// @flow
import React, { PureComponent } from 'react'
import ColorsFromImagePin from './ColorsFromImagePin'
import cloneDeep from 'lodash/cloneDeep'
import { renderingPins, findBrandColor, throttleDragTime, activedPinsHalfWidth } from './data'
import './InspiredScene.scss'
import { brandColors } from './sw-colors-in-LAB.js'
import throttle from 'lodash/throttle'
import includes from 'lodash/includes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'

type ComponentProps = {
  data: any,
  isActivedPage: boolean
}

type ComponentState = {
    previewPinIsUpdating: boolean,
    previewPinIsActive: boolean,
    previewColorName: string,
    previewColorNumber: string,
    mappedCanvasIndex: number,
    currentPixelRGB: any,
    currentPixelRGBstring: string,
    currentBrandColorIndex: number,
    pinnedColors: Array<any>,
    imageStatus: string,
    isDragging: boolean,
    position: Object
}

const pinsHalfWidthWithBorder = 26
export class ColorsFromImage extends PureComponent<ComponentProps, ComponentState> {
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
    previewPinIsUpdating: false,
    previewPinIsActive: false,
    previewColorName: '',
    previewColorNumber: '',
    cursorX: 0,
    cursorY: 0,
    mappedCanvasIndex: 0,
    currentPixelRGB: [0, 0, 0],
    currentPixelRGBstring: 'rgb(0,0,0)',
    currentBrandColorIndex: 0,
    pinnedColors: [],
    imageStatus: 'loading',
    isDragging: false,
    position: { x: 0, y: 0, left: 0, right: 0, top: 0, bottom: 0 }
  }
  constructor (props: ComponentProps) {
    super(props)
    this.CFICanvas = React.createRef()
    this.CFIWrapper = React.createRef()
    this.CFIImage = React.createRef()
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
    this.setState({ pinnedColors: renderingPins(this.props.data.initPins, this.canvasOffsetWidth, this.canvasOffsetHeight) })
  }

  initCanvas = () => {
    this.setCanvasOffset()
    this.CFICanvasContext = this.CFICanvas.current.getContext('2d')
    this.canvasOffset = this.CFICanvas.current.getBoundingClientRect()
    this.canvasOffsetWidth = parseInt(this.canvasOffset.width, 10)
    this.canvasOffsetHeight = parseInt(this.canvasOffset.height, 10)
    this.CFICanvas.current.height = this.canvasOffsetHeight
    this.CFICanvas.current.width = this.canvasOffsetWidth
    if (this.props.data.imageRotationAngle) {
      this.CFICanvasContext.clearRect(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
      this.CFICanvasContext.save()
      this.CFICanvasContext.translate(this.canvasOffsetWidth / 2, this.canvasOffsetHeight / 2)
      this.CFICanvasContext.rotate(this.props.data.imageRotationAngle * Math.PI / 180)
      if (includes([90, -90, 270, -270], this.props.data.imageRotationAngle)) {
        this.CFICanvasContext.drawImage(this.CFIImage.current, -this.canvasOffsetWidth / 2, -this.canvasOffsetHeight, this.canvasOffsetWidth, this.canvasOffsetHeight * 2)
      } else {
        this.CFICanvasContext.drawImage(this.CFIImage.current, -this.canvasOffsetWidth / 2, -this.canvasOffsetHeight / 2, this.canvasOffsetWidth, this.canvasOffsetHeight)
      }
      this.CFICanvasContext.restore()
    } else {
      this.CFICanvasContext.drawImage(this.CFIImage.current, 0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    }
    const imageData = this.CFICanvasContext.getImageData(0, 0, this.canvasOffsetWidth, this.canvasOffsetHeight)
    this.imageDataData = imageData.data
    this.setState({ pinnedColors: renderingPins(this.props.data.initPins, this.canvasOffsetWidth, this.canvasOffsetHeight) })
  }

  activatePin = (pinNumber: number) => {
    const pinnedColorClicked = this.state.pinnedColors.findIndex((colors) => {
      return colors.pinNumber === parseInt(pinNumber)
    })

    const lastActivedPin = this.state.pinnedColors.findIndex((colors) => {
      return colors.isActiveFlag === true
    })
    const clonePins = cloneDeep(this.state.pinnedColors)

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

  addNewPin = (cursorX: number, cursorY: number) => {
    const arrayIndex = findBrandColor(this.state.currentPixelRGB)
    const clonePins = cloneDeep(this.state.pinnedColors)
    const activePinIndex = this.state.pinnedColors.findIndex((colors) => {
      return colors.isActiveFlag === true
    })
    if (activePinIndex !== -1) {
      clonePins[activePinIndex].isActiveFlag = false
    }
    let isContentLeft = false

    if (cursorX < this.canvasOffsetWidth / 2) {
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

  removeSameColorPin = (currentPins: Array<any>, index: number) => {
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

  handleClick = (e: Object) => {
    const { isDragging, previewPinIsUpdating } = this.state
    const currentTarget = e.target.getAttribute('name')
    if (!previewPinIsUpdating && !isDragging && currentTarget === 'canvas') {
      const position = this.borderChecking(e.clientX, e.clientY)
      const offsetX = position.x + activedPinsHalfWidth
      const offsetY = position.y + activedPinsHalfWidth
      const cursorX = e.nativeEvent.offsetX
      const cursorY = e.nativeEvent.offsetY
      const mappedCanvasIndex = (cursorY * this.canvasOffsetWidth + cursorX) * 4
      this.setState({
        currentPixelRGB: [this.imageDataData[mappedCanvasIndex], this.imageDataData[mappedCanvasIndex + 1], this.imageDataData[mappedCanvasIndex + 2]],
        currentPixelRGBstring: `rgb(${this.imageDataData[mappedCanvasIndex]},${this.imageDataData[mappedCanvasIndex + 1]},${this.imageDataData[mappedCanvasIndex + 2]})`,
        mappedCanvasIndex: mappedCanvasIndex,
        previewPinIsUpdating: true
      }, () => {
        this.addNewPin(offsetX, offsetY)
      })
    }
  }

  deleteCurrentPin = (pinNumber: number) => {
    const clonePins = cloneDeep(this.state.pinnedColors)
    clonePins.splice(pinNumber, 1)
    const newPins = clonePins.map((pins, index) => {
      pins.pinNumber = index
      return pins
    })
    this.setState({ pinnedColors: newPins })
  }

  borderChecking = (x: number, y: number) => {
    /* position Object is refered to the position of dragging pins
       it includes attribute top, bottom, left, right, x, y
       #1. position.x and position.y is only used for calculate the position
       when pin dropped on the canvas
       #2. top, bottom, left, right make sure pins only be rendering inside of canvas
       */
    let position = {}
    const canvasOffset = this.getCanvasOffset()
    if (x < canvasOffset.x + activedPinsHalfWidth) {
      position.left = 0
      position.x = position.left
    } else if (x - canvasOffset.x > this.canvasOffsetWidth - activedPinsHalfWidth) {
      position.right = 0
      position.x = this.canvasOffsetWidth - 2 * activedPinsHalfWidth
    } else {
      position.left = x - canvasOffset.x - activedPinsHalfWidth
      position.x = position.left
    }

    if (y < canvasOffset.y + activedPinsHalfWidth) {
      position.top = 0
      position.y = position.top
    } else if (y - canvasOffset.y > this.canvasOffsetHeight - activedPinsHalfWidth) {
      position.bottom = activedPinsHalfWidth
      position.y = this.canvasOffsetHeight - 2 * activedPinsHalfWidth
    } else {
      position.top = y - canvasOffset.y - activedPinsHalfWidth
      position.y = position.top
    }

    return position
  }

  handleDrag = throttle((x: number, y: number) => {
    const canvasOffset = this.getCanvasOffset()
    const position = this.borderChecking(x, y)
    const offsetY = x - canvasOffset.x
    const offsetX = y - canvasOffset.y
    const mappedCanvasIndex = (offsetX * this.canvasOffsetWidth + offsetY) * 4
    const currentPixelRGBstring = `rgb(${this.imageDataData[mappedCanvasIndex]},${this.imageDataData[mappedCanvasIndex + 1]},${this.imageDataData[mappedCanvasIndex + 2]})`
    this.setState({ position: position, currentPixelRGBstring: currentPixelRGBstring, isDragging: true })
  }, throttleDragTime)

  handleDragStop = (e: Object) => {
    const { previewPinIsUpdating, isDragging } = this.state
    if (!previewPinIsUpdating && isDragging) {
      const position = this.borderChecking(e.clientX, e.clientY)
      const offsetX = position.x + activedPinsHalfWidth
      const offsetY = position.y + activedPinsHalfWidth
      const mappedCanvasIndex = (offsetY * this.canvasOffsetWidth + offsetX) * 4
      this.setState({
        currentPixelRGB: [this.imageDataData[mappedCanvasIndex], this.imageDataData[mappedCanvasIndex + 1], this.imageDataData[mappedCanvasIndex + 2]],
        currentPixelRGBstring: `rgb(${this.imageDataData[mappedCanvasIndex]},${this.imageDataData[mappedCanvasIndex + 1]},${this.imageDataData[mappedCanvasIndex + 2]})`,
        isDragging: false
      }, () => {
        this.addNewPin(offsetX, offsetY)
      })
    }
  }

  handlePinMoveByKeyboard = throttle((movingPinData: Object) => {
    const canvasOffset = this.getCanvasOffset()
    let cursorX = movingPinData.offsetX - canvasOffset.x
    let cursorY = movingPinData.offsetY - canvasOffset.y
    let isContentLeft = false
    if (cursorX < this.canvasOffsetWidth / 2) {
      isContentLeft = true
    }
    if (cursorX < pinsHalfWidthWithBorder) {
      cursorX = pinsHalfWidthWithBorder
    } else if (cursorX > this.canvasOffsetWidth - pinsHalfWidthWithBorder) {
      cursorX = this.canvasOffsetWidth - pinsHalfWidthWithBorder
    }

    if (cursorY < pinsHalfWidthWithBorder) {
      cursorY = pinsHalfWidthWithBorder
    } else if (cursorY > this.canvasOffsetHeight - pinsHalfWidthWithBorder) {
      cursorY = this.canvasOffsetHeight - pinsHalfWidthWithBorder
    }

    const mappedCanvasIndex = (cursorY * this.canvasOffsetWidth + cursorX) * 4
    const translateX = cursorX - activedPinsHalfWidth
    const translateY = cursorY - activedPinsHalfWidth
    const arrayIndex = findBrandColor([this.imageDataData[mappedCanvasIndex], this.imageDataData[mappedCanvasIndex + 1], this.imageDataData[mappedCanvasIndex + 2]])
    const newRgb = `rgb(${brandColors[arrayIndex + 2]})`
    const clonedPins = cloneDeep(this.state.pinnedColors)
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
  }, 50)

  handleKeyUpAfterPinMove = (movingPinNumber: number) => {
    const clonedPins = cloneDeep(this.state.pinnedColors)
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

  pinRemove = (e: Object) => {
    e.stopPropagation()
    const clonedPins = cloneDeep(this.state.pinnedColors)
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

  render () {
    const { pinnedColors, currentPixelRGBstring, position, isDragging } = this.state
    const { img } = this.props.data
    const { isActivedPage } = this.props
    let showDeletePin = false
    return (
      <div role='presentation' className='scene__image__wrapper' onClick={isActivedPage ? this.handleClick : null} ref={this.CFIWrapper}>
        <canvas className='scene__image__wrapper__canvas' name='canvas' ref={this.CFICanvas} />
        <img className='scene__image__wrapper__image' ref={this.CFIImage} onLoad={this.handleImageLoaded} onError={this.handleImageErrored} src={img} alt='' />
        {
          isActivedPage && pinnedColors && pinnedColors.map((pinnedColor, index) => {
            if (pinnedColor.isActiveFlag) {
              showDeletePin = true
            }
            return (<ColorsFromImagePin key={`push${index}`}
              isActiveFlag={pinnedColor.isActiveFlag}
              isContentLeft={pinnedColor.isContentLeft}
              previewColorName={`${pinnedColor.colorName}`}
              previewColorNumber={`${pinnedColor.colorNumber}`}
              RGBstring={`${pinnedColor.rgbValue}`}
              translateX={`${pinnedColor.translateX}`}
              translateY={`${pinnedColor.translateY}`}
              pinNumber={`${pinnedColor.pinNumber}`}
              handlePinMoveByKeyboard={this.handlePinMoveByKeyboard}
              handleKeyUpAfterPinMove={this.handleKeyUpAfterPinMove}
              hide={pinnedColor.hasOwnProperty('hide') && pinnedColor.hide}
              isMovingPin={pinnedColor.hasOwnProperty('isMovingPin') && pinnedColor.isMovingPin}
              handleDrag={this.handleDrag}
              deleteCurrentPin={this.deleteCurrentPin}
              handleDragStop={this.handleDragStop}
              activatePin={this.activatePin} />)
          })
        }
        {isActivedPage && isDragging &&
        <div className='scene__image__wrapper__indicator'
          style={{
            backgroundColor: currentPixelRGBstring,
            top: position.top,
            bottom: position.bottom,
            left: position.left,
            right: position.right
          }} />
        }
        {(showDeletePin) && <button className='scene__image__wrapper__delete-pin' onClick={this.pinRemove}><FontAwesomeIcon icon='trash' size='1x' /></button>}
      </div>
    )
  }
}

export default ColorsFromImage
