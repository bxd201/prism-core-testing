import React from 'react'
import { shallow } from 'enzyme'
import ColorsFromImage from 'src/components/InspirationPhotos/ColorsFromImage'
import ColorsFromImagePin from 'src/components/InspirationPhotos/ColorsFromImagePin'

import { getImagesCollectionsData, collectionTabs } from 'src/components/InspirationPhotos/data'

const { collectionData } = getImagesCollectionsData(collectionTabs, 'tab1')
let defaultProps = {
  data: collectionData[0],
  isActivedPage: true
}

const createColorsFromImage = (props) => {
  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<ColorsFromImage {...newProps} />, { disableLifecycleMethods: true })
}

const pinnedColors = [
  { colorName: 'Rookwood Dark Red',
    colorNumber: '2801',
    isActiveFlag: true,
    isContentLeft: true,
    pinNumber: 0,
    rgbValue: 'rgb(75,41,41)',
    translateX: 35.74944320712695,
    translateY: 56.531827515400416 }]

const wrapper = createColorsFromImage()

describe('Testing state for createColorsFromImage component', () => {
  it('State should initialize correctly', () => {
    const initialState = wrapper.instance().state
    expect(initialState).toEqual({
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
    })
  })
})

describe('compoments rendring test', () => {
  wrapper.instance().updateWindowDimensions = jest.fn()
  wrapper.instance().componentDidMount()
  it('should rendering ColorsFromImage Component', () => {
    expect(wrapper.find('.scene__image__wrapper').exists()).toBe(true)
  })

  it('should rendering Colors From Image pins', () => {
    wrapper.setState({
      isActivedPage: true,
      pinnedColors: pinnedColors
    })
    expect(wrapper.find(ColorsFromImagePin).exists()).toBe(true)
  })

  it('should rendering indicators', () => {
    wrapper.setState({
      isActivedPage: true,
      isDragging: true
    })
    expect(wrapper.find('.scene__image__wrapper__indicator').exists()).toBe(true)
  })

  it('should rendering delete button', () => {
    expect(wrapper.find('.scene__image__wrapper__delete-pin').exists()).toBe(true)
  })
})

describe('component event test', () => {
  it('click canvas should works fine', () => {
    const click = jest.fn()
    wrapper.instance().handleClick = click
    wrapper.instance().forceUpdate()
    wrapper.find('.scene__image__wrapper').simulate('click')
    expect(click).toHaveBeenCalled()
  })

  it('draging color pins should be dragable', () => {
    wrapper.setState({
      isActivedPage: true,
      pinnedColors: pinnedColors
    })
    let canvasOffset = { x: 0, y: 0 }
    wrapper.instance().imageDataData = [0, 0, 0]
    window.sessionStorage.setItem('canvasOffset', JSON.stringify(canvasOffset))
    const drag = jest.fn()
    wrapper.instance().handleDrag = drag
    wrapper.instance().forceUpdate()
    wrapper.find(ColorsFromImagePin).props().handleDrag()
    expect(drag).toHaveBeenCalled()
  })

  it('color pins should be deletable', () => {
    wrapper.setState({
      isActivedPage: true,
      pinnedColors: pinnedColors
    })
    const deletePin = jest.fn()
    wrapper.instance().deleteCurrentPin = deletePin
    wrapper.instance().forceUpdate()
    wrapper.find(ColorsFromImagePin).props().deleteCurrentPin()
    expect(deletePin).toHaveBeenCalled()
  })

  it('color pins could be removed', () => {
    // eslint-disable-next-line no-undef
    const e = new Event('test')
    expect(wrapper.instance().state.pinnedColors).toHaveLength(1)
    wrapper.instance().pinRemove(e)
    const PinnedColorListLen = wrapper.instance().state.pinnedColors.length
    expect(PinnedColorListLen).toEqual(0)
  })

  it('color pins could be added', () => {
    const wrapper = createColorsFromImage()
    wrapper.setState({
      isActivedPage: true,
      pinnedColors: pinnedColors
    })
    expect(wrapper.instance().state.pinnedColors).toHaveLength(1)
    wrapper.instance().addNewPin(0, 0)
    const PinnedColorListLen = wrapper.instance().state.pinnedColors.length
    expect(PinnedColorListLen).toEqual(2)
  })

  it('color pins could be moved by keyboard', () => {
    const wrapper = createColorsFromImage()
    wrapper.setState({
      isActivedPage: true,
      pinnedColors: pinnedColors
    })
    let canvasOffset = { x: 0, y: 0 }
    wrapper.instance().imageDataData = [0, 0, 0]
    window.sessionStorage.setItem('canvasOffset', JSON.stringify(canvasOffset))
    const move = jest.fn()
    wrapper.instance().handlePinMoveByKeyboard = move
    wrapper.instance().forceUpdate()
    wrapper.find(ColorsFromImagePin).props().handlePinMoveByKeyboard()
    expect(move).toHaveBeenCalled()
  })
})
