// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import ColorsFromImagePin from './ColorsFromImagePin'
import { renderingPins, findClosestColor, throttleDragTime, activedPinsHalfWidth, cloneColorPinsArr } from './data'
import './InspiredScene.scss'
import { injectIntl } from 'react-intl'
import throttle from 'lodash/throttle'
import includes from 'lodash/includes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { loadColors } from 'src/store/actions/loadColors'
import { type Color } from 'src/shared/types/Colors.js.flow'
import WithConfigurationContext from 'src/contexts/ConfigurationContext/WithConfigurationContext'
import 'src/providers/fontawesome/fontawesome'
import uniqueId from 'lodash/uniqueId'

type ComponentProps = {
  data: any,
  isActivedPage: boolean,
  unorderedColors: Color[],
  intl: { locale: string, formatMessage: Function },
  config: { brandId: string },
  loadColors: (brandId: string, options?: {}) => void,
}

type ComponentState = {
    previewPinIsUpdating: boolean,
    previewPinIsActive: boolean,
    previewColorName: string,
    previewColorNumber: string,
    mappedCanvasIndex: number,
    currentPixelRGB: any,
    currentPixelRGBstring: string,
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
    pinnedColors: [],
    imageStatus: 'loading',
    isDragging: false,
    position: { x: 0, y: 0, left: 0, right: 0, top: 0, bottom: 0 },
    isDeleting: false
  }
  constructor (props: ComponentProps) {
    super(props)
    this.CFICanvas = React.createRef()
    this.CFIWrapper = React.createRef()
    this.CFIImage = React.createRef()
    this.deleteButtonRef = React.createRef()
    this.canvasOffsetWidth = 0
    this.canvasOffsetHeight = 0
    this.indicatorRef = React.createRef()
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
      canvasOffset.x = Math.floor(canvasClientOffset.left)
      canvasOffset.y = Math.floor(canvasClientOffset.top)
      window.sessionStorage.setItem('canvasOffset', JSON.stringify(canvasOffset))
    }
    if (this.deleteButtonRef.current) {
      this.deleteButtonOffset = this.deleteButtonRef.current.getBoundingClientRect()
      this.deleteButtonR = this.deleteButtonOffset.width / 2
      this.deleteButtonX = this.deleteButtonOffset.x + this.deleteButtonR
      this.deleteButtonY = this.deleteButtonOffset.y + this.deleteButtonR
    }
  }

  getCanvasOffset = () => {
    this.setCanvasOffset()
    const canvasOffset = window.sessionStorage.getItem('canvasOffset')
    return JSON.parse(canvasOffset)
  }

  componentDidMount () {
    this.props.loadColors(this.props.config.brandId, { language: this.props.intl.locale })
    this.updateWindowDimensions()
    window.addEventListener('resize', this.updateWindowDimensions)
    window.addEventListener('scroll', this.setCanvasOffset)
    // @todo remove this
    window.canvasRef = this.CFICanvas
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateWindowDimensions)
    window.addEventListener('scroll', this.setCanvasOffset)
  }

  componentDidUpdate (prevProps: ComponentProps) {
    if (prevProps.unorderedColors !== this.props.unorderedColors) {
      const pinnedColors = renderingPins(this.props.data.initPins, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.unorderedColors)
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ pinnedColors })
    }
  }

  updateWindowDimensions = () => {
    this.setCanvasOffset()
    this.canvasOffset = this.CFICanvas.current.getBoundingClientRect()
    this.deleteButtonOffset = this.deleteButtonRef.current.getBoundingClientRect()
    this.deleteButtonR = this.deleteButtonOffset.width / 2
    this.deleteButtonX = this.deleteButtonOffset.x + this.deleteButtonR
    this.deleteButtonY = this.deleteButtonOffset.y + this.deleteButtonR
    this.canvasOffsetWidth = parseInt(this.canvasOffset.width, 10)
    this.canvasOffsetHeight = parseInt(this.canvasOffset.height, 10)
    this.canvasClientX = parseInt(this.canvasOffset.left, 10)
    this.canvasClientY = parseInt(this.canvasOffset.top, 10)
    if (this.props.unorderedColors) {
      this.setState({ pinnedColors: renderingPins(this.props.data.initPins, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.unorderedColors) })
    }
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
    if (this.props.unorderedColors) {
      this.setState({ pinnedColors: renderingPins(this.props.data.initPins, this.canvasOffsetWidth, this.canvasOffsetHeight, this.props.unorderedColors) })
    }
  }

  activatePin = (pinNumber: number) => {
    const pinnedColorClicked = this.state.pinnedColors.findIndex((colors) => {
      return colors.pinNumber === parseInt(pinNumber)
    })

    const lastActivedPin = this.state.pinnedColors.findIndex((colors) => {
      return colors.isActiveFlag === true
    })
    const clonePins = cloneColorPinsArr(this.state.pinnedColors)

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

  addNewPin = (cursorX: number, cursorY: number, ignoreRadius: boolean = false) => {
    const pinRadius = ignoreRadius ? 0 : activedPinsHalfWidth
    const color = findClosestColor(this.state.currentPixelRGB, this.props.unorderedColors)
    const currentPixelRGB = `${color.red},${color.green},${color.blue}`
    const clonePins = cloneColorPinsArr(this.state.pinnedColors)
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
    const newPins = this.removeSameColorPin(clonePins, color)
    this.setState({
      currentPixelRGB,
      currentPixelRGBstring: `rgb(${currentPixelRGB})`,
      previewPinIsUpdating: false,
      previewColorName: color.name,
      previewColorNumber: color.colorNumber,
      pinnedColors: [
        ...newPins,
        {
          ...color,
          rgbValue: `rgb(${currentPixelRGB})`,
          translateX: cursorX - pinRadius,
          translateY: cursorY - pinRadius,
          pinNumber: newPins.length,
          isActiveFlag: true,
          isContentLeft: isContentLeft,
          pinId: uniqueId('pin_')
        }
      ]
    })
  }

  removeSameColorPin = (currentPins: Array<any>, color: Color) => {
    const currentPixelRGB = `${color.red},${color.green},${color.blue}`
    const duplicatePinIndex = currentPins.findIndex((colors) => {
      return colors.rgbValue === `rgb(${currentPixelRGB})`
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

  // @todo This method is called at the beginning of a mouse drag and at the end of a touch drag.  Touch hides and then deletes, me thinks this should be the universal technique. -RS
  deleteCurrentPin = (pinNumber: number) => {
    const clonePins = cloneColorPinsArr(this.state.pinnedColors)
    clonePins.splice(pinNumber, 1)
    const newPins = clonePins.map((pins, index) => {
      pins.pinNumber = index
      return pins
    })
    this.setState({ pinnedColors: newPins })
  }

  // Added this to delete for touch
  deletePinById = (pinId: string) => {
    const pinnedColors = cloneColorPinsArr(this.state.pinnedColors.filter(pin => pin.pinId !== pinId))
    this.setState({ pinnedColors })
  }

  borderChecking = (x: number, y: number) => {
    /* position Object is referred to the position of dragging pins
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

  handleTouchEnd = (dims: any, pinId: string) => {
    const shouldDelete = this.handleDragStop(dims, pinId)

    // @todo this deleteByPinId may be unneeded, test after release -RS
    if (shouldDelete) {
      this.deletePinById(pinId)
    }
  }

  handleDrag = throttle((x: number, y: number, isMobile: boolean) => {
    const canvasOffset = this.getCanvasOffset()
    const position = this.borderChecking(x, y)
    let isDeleting = false
    const circleDistance = Math.sqrt(Math.pow((this.deleteButtonX - x), 2) + Math.pow((this.deleteButtonY - y), 2))
    if (circleDistance < (activedPinsHalfWidth + this.deleteButtonR)) {
      isDeleting = true
    }
    const offsetY = x - canvasOffset.x
    const offsetX = y - canvasOffset.y

    const mappedCanvasIndex = Math.floor((offsetX * this.canvasOffsetWidth + offsetY) * 4)
    const currentPixelRGBstring = `rgb(${this.imageDataData[mappedCanvasIndex]},${this.imageDataData[mappedCanvasIndex + 1]},${this.imageDataData[mappedCanvasIndex + 2]})`
    const newState = { position: position, currentPixelRGBstring: currentPixelRGBstring, isDragging: true, isDeleting: isDeleting }

    this.setState(newState)
  }, throttleDragTime)

  isInHitArea = (pointerPos: any) => {
    const targetDims = this.deleteButtonRef.current.getBoundingClientRect()
    const indicatorDims = this.indicatorRef.current.getBoundingClientRect()

    return (
      indicatorDims.top < targetDims.bottom &&
      indicatorDims.right - 3 > targetDims.left &&
      indicatorDims.bottom - 3 > targetDims.top &&
      indicatorDims.left + 3 < targetDims.right
    )
  }

  checkCircleDistance = (x1: number, y1: number, x2: number, y2: number, r1: number, r2: number) => {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)) < (r1 + r2)
  }

  // This method is used by mobile browsers to get the pointer  (by proxy) location when input coords are unavailable
  getCoordsFromIndicator = () => {
    const indicatorRef = this.indicatorRef.current
    // This suppresses a console error
    if (!indicatorRef) {
      return
    }

    const indicatorDims = indicatorRef.getBoundingClientRect()
    const indicatorRadius = indicatorDims.width / 2
    const x = Math.floor(indicatorDims.top + indicatorRadius)
    const y = Math.floor(indicatorDims.left + indicatorRadius)

    return { x, y }
  }

  handleDragStop = (e: any) => {
    const isTouchEvent = e.clientX === void (0)
    const { previewPinIsUpdating, isDragging } = this.state
    let x = e.clientX
    let y = e.clientY

    // @todo recheck this code, not sure it is helpful -RS
    if (isTouchEvent) {
      const touchCoords = this.getCoordsFromIndicator()
      x = touchCoords.x
      y = touchCoords.y
    }

    if (!previewPinIsUpdating && isDragging) {
      const position = this.borderChecking(x, y)
      const offsetX = position.x + activedPinsHalfWidth
      const offsetY = position.y + activedPinsHalfWidth
      const mappedCanvasIndex = (offsetY * this.canvasOffsetWidth + offsetX) * 4

      const shouldDelete = this.isInHitArea({ x, y })

      if (shouldDelete) {
        this.setState({ isDragging: false, isDeleting: false })
        return true
      } else {
        this.setState({
          currentPixelRGB: [this.imageDataData[mappedCanvasIndex], this.imageDataData[mappedCanvasIndex + 1], this.imageDataData[mappedCanvasIndex + 2]],
          currentPixelRGBstring: `rgb(${this.imageDataData[mappedCanvasIndex]},${this.imageDataData[mappedCanvasIndex + 1]},${this.imageDataData[mappedCanvasIndex + 2]})`,
          isDragging: false
        }, () => {
          const pinX = isTouchEvent ? this.state.position.x : offsetX
          const pinY = isTouchEvent ? this.state.position.y : offsetY

          this.addNewPin(pinX, pinY, isTouchEvent)
        })
      }
    }
  }

  handlePinMoveByKeyboard = throttle(({ offsetX, offsetY, pinNumber }: { offsetX: number, offsetY: number, pinNumber: number }) => {
    const canvasOffset = this.getCanvasOffset()
    let cursorX = offsetX - Math.floor(canvasOffset.x)
    let cursorY = offsetY - Math.floor(canvasOffset.y)
    const isContentLeft = cursorX < this.canvasOffsetWidth / 2

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
    const color: Color = findClosestColor([this.imageDataData[mappedCanvasIndex], this.imageDataData[mappedCanvasIndex + 1], this.imageDataData[mappedCanvasIndex + 2]], this.props.unorderedColors)
    const rgbValue = `rgb(${color.red},${color.green},${color.blue})`

    this.setState({ pinnedColors: this.state.pinnedColors.map(color => {
      return color.pinNumber === pinNumber ? { ...color, translateX, translateY, isContentLeft, rgbValue } : color
    }) })
  }, 50)

  handleKeyUpAfterPinMove = (movingPinNumber: number) => {
    const clonedPins = cloneColorPinsArr(this.state.pinnedColors)
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

  removePin = (e: Object) => {
    e.stopPropagation()
    const clonedPins = cloneColorPinsArr(this.state.pinnedColors)
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
    const { pinnedColors, currentPixelRGBstring, position, isDragging, isDeleting } = this.state
    const { img } = this.props.data
    const { isActivedPage, intl } = this.props

    return (
      <div role='presentation' className='scene__image__wrapper' onClick={isActivedPage ? this.handleClick : null} ref={this.CFIWrapper}>
        <canvas className='scene__image__wrapper__canvas' name='canvas' ref={this.CFICanvas} />
        <img crossOrigin='anonymous' className='scene__image__wrapper__image' ref={this.CFIImage} onLoad={this.handleImageLoaded} onError={this.handleImageErrored} src={img} alt='' />
        {
          isActivedPage && pinnedColors && pinnedColors.map((pinnedColor, index) => {
            return (
              <ColorsFromImagePin
                key={`push${index}`}
                color={pinnedColor}
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
        {isActivedPage && isDragging &&
        <div ref={this.indicatorRef} className='scene__image__wrapper__indicator'
          style={{
            backgroundColor: currentPixelRGBstring,
            top: position.top,
            bottom: position.bottom,
            left: position.left,
            right: position.right
          }} />
        }
        <button
          ref={this.deleteButtonRef}
          title={`${intl.formatMessage({ id: 'DELETE_COLOR' })}`}
          className={`scene__image__wrapper__delete-pin ${isDeleting ? 'scene__image__wrapper__delete-pin--active' : ''}`}
          style={{ display: isDragging || pinnedColors.some(c => c.isActiveFlag) ? 'flex' : 'none' }}
          onClick={this.removePin}
        >
          <FontAwesomeIcon icon='trash' size='1x' />
        </button>
      </div>
    )
  }
}

export default injectIntl(connect(
  ({ colors }) => ({ unorderedColors: colors.unorderedColors }),
  { loadColors }
)(WithConfigurationContext(ColorsFromImage)))
