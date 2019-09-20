import React from 'react'
import { mount } from 'enzyme'
import { PaintScene } from 'src/components/PaintScene/PaintScene'

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
  }
}

// eslint-disable-next-line no-unused-vars
const createPaintScene = (props = {}) => {
  return mount(<PaintScene {...defaultProps} {...props} />)
}

describe('PaintScene action history testing', () => {
  it('Component state.PixelDataHistory should not increase if state.drawCoordinated is empty and redoCoordinates are not provided', () => {
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.pushToHistory()

    expect(instance.state.pixelDataHistory).toHaveLength(0)
  })

  it('Component state.PixelDataHistory should increase by 1 if there are state.drawCoordinated when pushToHistory is called', () => {
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.setState({ drawCoordinates: [{ x: 0, y: 0 }] })
    instance.pushToHistory()

    expect(instance.state.pixelDataHistory).toHaveLength(1)
  })

  it('Component state.PixelDataHistory should increase by 1 if there are redoCoordinates are provided when pushToHistory is called', () => {
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.pushToHistory({ x: 0, y: 0 })

    expect(instance.state.pixelDataHistory).toHaveLength(1)
  })

  it('Component should enable undo if there are values pushed to state.pixelDataHistory', () => {
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.pushToHistory({ x: 0, y: 0 })

    expect(instance.state.undoIsEnabled).toEqual(true)
  })

  it('Component should not enable redo if there are values are pushed to state.pixelDataHistory and there are no values in state.pixelDataRedoHistory', () => {
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.pushToHistory({ x: 0, y: 0 })

    expect(instance.state.redoIsEnabled).toEqual(false)
  })

  it('Component should enable redo if an undo action is taken', () => {
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.pushToHistory({ x: 0, y: 0 })
    // Canvas context not available so fake it
    instance.clearCanvas = jest.fn()
    instance.undo()

    expect(instance.state.redoIsEnabled).toEqual(true)
  })

  it('Component should disable undo if an undo action is taken and there are no remaining action history items (state.pixelDataHistory)', () => {
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.pushToHistory({ x: 0, y: 0 })
    // Canvas context not available so fake it
    instance.clearCanvas = jest.fn()
    instance.undo()

    expect(instance.state.undoIsEnabled).toEqual(false)
  })

  it('Component not should disable undo if an undo action is taken and there are still remaining items in action history (state.pixelDataHistory)', () => {
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.pushToHistory({ x: 0, y: 0 })
    instance.pushToHistory({ x: 0, y: 0 })
    // Canvas context not available so fake it
    instance.clearCanvas = jest.fn()
    instance.undo()

    expect(instance.state.undoIsEnabled).toEqual(true)
  })

  it('Component should disable redo if a redo action is taken and there are no remaining items in action history (state.pixelDataHistory)', () => {
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.pushToHistory({ x: 0, y: 0 })
    // Canvas context not available so fake it
    instance.clearCanvas = jest.fn()
    instance.undo()
    instance.redo()

    expect(instance.state.redoIsEnabled).toEqual(false)
  })

  it('Component should enable undo if a redo action is taken', () => {
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.pushToHistory({ x: 0, y: 0 })
    // Canvas context not available so fake it
    instance.clearCanvas = jest.fn()
    instance.undo()
    instance.redo()

    expect(instance.state.undoIsEnabled).toEqual(true)
  })

  it('Component state.pixelDataHistory should equal the number of actions taken minus the number undo actions taken', () => {
    const actionsTaken = Math.ceil(Math.random() * 10)
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.clearCanvas = jest.fn()
    const undoActionsTaken = actionsTaken > 1 ? Math.floor(actionsTaken / 2) : 1

    for (let i = 0; i < actionsTaken; i++) {
      instance.pushToHistory({ x: 0, y: 0 })
    }

    for (let j = 0; j < undoActionsTaken; j++) {
      instance.undo()
    }

    expect(instance.state.pixelDataHistory.length).toEqual(actionsTaken - undoActionsTaken)
  })

  it('Component state.pixelDataRedoHistory should equal the number of undo actions taken', () => {
    const actionsTaken = Math.ceil(Math.random() * 10)
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.clearCanvas = jest.fn()
    const undoActionsTaken = actionsTaken > 1 ? Math.floor(actionsTaken / 2) : 1

    for (let i = 0; i < actionsTaken; i++) {
      instance.pushToHistory({ x: 0, y: 0 })
    }

    for (let j = 0; j < undoActionsTaken; j++) {
      instance.undo()
    }

    expect(instance.state.pixelDataRedoHistory.length).toEqual(undoActionsTaken)
  })

  it('Component state.pixelDataHistory should equal the net number of history operations done', () => {
    const actionsTaken = Math.ceil(Math.random() * 25)
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.clearCanvas = jest.fn()
    const undoActionsTaken = actionsTaken > 1 ? Math.floor(actionsTaken / 2) : 1
    const redoActionsTaken = undoActionsTaken > 1 ? Math.floor(actionsTaken / 2) : 1

    for (let i = 0; i < actionsTaken; i++) {
      instance.pushToHistory({ x: 0, y: 0 })
    }

    for (let j = 0; j < undoActionsTaken; j++) {
      instance.undo()
    }

    for (let k = 0; k < redoActionsTaken; k++) {
      instance.redo()
    }

    expect(instance.state.pixelDataHistory.length).toEqual(actionsTaken - undoActionsTaken + redoActionsTaken)
  })

  it('Component state.pixelDataRedoHistory should equal the net number of undo operations done', () => {
    const actionsTaken = Math.ceil(Math.random() * 25)
    const wrapper = createPaintScene()
    const instance = wrapper.instance()
    instance.clearCanvas = jest.fn()
    const undoActionsTaken = actionsTaken > 1 ? Math.floor(actionsTaken / 2) : 1
    const redoActionsTaken = undoActionsTaken > 1 ? Math.floor(actionsTaken / 2) : 1

    for (let i = 0; i < actionsTaken; i++) {
      instance.pushToHistory({ x: 0, y: 0 })
    }

    for (let j = 0; j < undoActionsTaken; j++) {
      instance.undo()
    }

    for (let k = 0; k < redoActionsTaken; k++) {
      instance.redo()
    }

    expect(instance.state.pixelDataRedoHistory.length).toEqual(undoActionsTaken - redoActionsTaken)
  })
})
