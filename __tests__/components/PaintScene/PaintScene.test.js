import React from 'react'
import { mount } from 'enzyme'
import { PaintScene, baseClass, paintBrushClass, canvasClass } from 'src/components/PaintScene/PaintScene'
import { toolNames } from 'src/components/PaintScene/data'

const handleClickMockFn = jest.fn()
const mouseMoveHandlerMockFn = jest.fn()
const mouseEnterHandlerMockFn = jest.fn()
const mouseLeaveHandlerMockFn = jest.fn()
const mouseDownHandlerMockFn = jest.fn()
const dragStartHandlerMockFn = jest.fn()

const defaultProps = {
  imageUrl: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=1311}&qlt=92',
  imageRotationAngle: 0,
  lpActiveColor: {
    'colorNumber': '7008',
    'coordinatingColors': {
      'coord2ColorId': '11203',
      'coord1ColorId': '2996'
    },
    'description': [
      'Diluted',
      'Wan',
      'Dazzling'
    ],
    'id': 'bright-2689',
    'isExterior': true,
    'isInterior': true,
    'name': 'Alabaster',
    'lrv': 82.215,
    'brandedCollectionNames': [
      'Color Forecast',
      'Senior Living Color Collection',
      'Pottery Barn Fall/Winter 2018',
      'Pottery Barn Fall/Winter 2018'
    ],
    'colorFamilyNames': [
      'White & Pastel'
    ],
    'brandKey': 'SW',
    'red': 237,
    'green': 234,
    'blue': 224,
    'hue': 0.128205128205128,
    'saturation': 0.26530612244897983,
    'lightness': 0.903921568627451,
    'hex': '#edeae0',
    'isDark': false,
    'storeStripLocator': '255-C2',
    'similarColors': [
      '2857',
      '11364',
      '2682',
      '2872',
      '2768',
      '2767',
      '2690',
      '2686',
      '2071',
      '1593'
    ]
  },
  referenceDimensions: {
    imageWidth: 1024,
    imageHeight: 768,
    isPortrait: false,
    originalIsPortrait: false
  }
}

// eslint-disable-next-line no-unused-vars
const createPaintScene = (props = {}) => {
  return mount(<PaintScene {...defaultProps} {...props} />)
}

describe('PaintScene render, state & event testing', () => {
  let paintScene
  let initialState

  beforeEach(() => {
    paintScene = createPaintScene()
    initialState = paintScene.instance().state
  })

  afterEach(jest.clearAllMocks)

  it('should match snapshot', () => {
    expect(paintScene).toMatchSnapshot()
  })

  it(`should call handleClickMockFn when click event occurs on div.${baseClass}`, () => {
    paintScene.instance().handleClick = handleClickMockFn
    paintScene.instance().forceUpdate()
    paintScene.find(`div.${baseClass}`).simulate('click')
    expect(handleClickMockFn).toHaveBeenCalled()
  })

  it(`should call mouseMoveHandlerMockFn when mousemove event occurs on div.${baseClass}`, () => {
    paintScene.instance().mouseMoveHandler = mouseMoveHandlerMockFn
    paintScene.instance().forceUpdate()
    paintScene.find(`div.${baseClass}`).simulate('mousemove')
    expect(mouseMoveHandlerMockFn).toHaveBeenCalled()
  })

  it(`should call mouseEnterHandlerMockFn when mouseenter event occurs on div.${baseClass}`, () => {
    paintScene.instance().mouseEnterHandler = mouseEnterHandlerMockFn
    paintScene.instance().forceUpdate()
    paintScene.find(`div.${baseClass}`).simulate('mouseenter')
    expect(mouseEnterHandlerMockFn).toHaveBeenCalled()
  })

  it(`should call mouseEnterHandlerMockFn when mouseleave event occurs on div.${baseClass}`, () => {
    paintScene.instance().mouseLeaveHandler = mouseLeaveHandlerMockFn
    paintScene.instance().forceUpdate()
    paintScene.find(`div.${baseClass}`).simulate('mouseleave')
    expect(mouseLeaveHandlerMockFn).toHaveBeenCalled()
  })

  it(`should update state position.isHidden to true when mouseleave event occurs on div.${baseClass}`, () => {
    paintScene.find(`div.${baseClass}`).simulate('mouseleave')
    expect(!initialState.position.isHidden).toEqual(paintScene.instance().state.position.isHidden)
  })

  it(`should update state position.isHidden to false when mouseenter event occurs on div.${baseClass}`, () => {
    paintScene.setState({
      position: {
        ...initialState.position,
        isHidden: true
      }
    })
    paintScene.find(`div.${baseClass}`).simulate('mouseenter')
    expect(initialState.position.isHidden).toEqual(paintScene.instance().state.position.isHidden)
  })

  it(`should call mouseDownHandlerMockFn when mousedown event occurs on div.${paintBrushClass}`, () => {
    paintScene.instance().mouseDownHandler = mouseDownHandlerMockFn
    paintScene.instance().forceUpdate()
    paintScene.setState({ activeTool: toolNames.PAINTBRUSH })
    paintScene.find(`div.${paintBrushClass}`).simulate('mousedown')
    expect(mouseDownHandlerMockFn).toHaveBeenCalled()
  })

  it(`should call dragStartHandlerMockFn when dragstart event occurs on div.${paintBrushClass}`, () => {
    paintScene.instance().dragStartHandler = dragStartHandlerMockFn
    paintScene.instance().forceUpdate()
    paintScene.setState({ activeTool: toolNames.PAINTBRUSH })
    paintScene.find(`div.${paintBrushClass}`).simulate('dragstart')
    expect(dragStartHandlerMockFn).toHaveBeenCalled()
  })

  it(`should update state isDragging to true when dragstart event occurs on div.${paintBrushClass}`, () => {
    paintScene.setState({ activeTool: toolNames.PAINTBRUSH })
    paintScene.find(`div.${paintBrushClass}`).simulate('dragstart')
    expect(!initialState.isDragging).toEqual(paintScene.instance().state.isDragging)
  })

  it(`should update state canvasMouseDown to true when activeTool is zoom and mousedown event occurs on third canvas.${canvasClass}`, () => {
    paintScene.setState({ activeTool: toolNames.ZOOM })
    paintScene.find(`canvas.${canvasClass}`).at(2).simulate('mousedown')
    expect(!initialState.canvasMouseDown).toEqual(paintScene.instance().state.canvasMouseDown)
  })
})
