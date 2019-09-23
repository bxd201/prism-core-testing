import React from 'react'
import { shallow } from 'enzyme'
import PaintToolBar from 'src/components/PaintScene/PaintToolBar'
import { toolNames } from 'src/components/PaintScene/data'

const defaultProps = {
  activeTool: toolNames.PAINTAREA,
  setActiveTool: jest.fn(),
  clearCanvas: jest.fn(),
  paintBrushShape: 'round',
  paintBrushWidth: 38,
  eraseBrushShape: 'round',
  eraseBrushWidth: 38,
  setBrushShapeSize: jest.fn(),
  performUndo: jest.fn(),
  performRedo: jest.fn(),
  undoIsEnabled: true,
  redoIsEnabled: true
}

const createPaintToolBarComponent = (props) => {
  return shallow(<PaintToolBar {...defaultProps} {...props} />)
}

/* @todo review these tests, I think more nuance is needed.
describe('PaintToolBar render testing', () => {
  it('Component should show brush palette when paint brush tool is selected and clicked', () => {
    const wrapper = createPaintToolBarComponent({ activeTool: toolNames.PAINTBRUSH })
    const mockEvent = { target: {}, preventDefault: jest.fn(), stopPropagation: jest.fn() }
    wrapper.find('button').at(1).simulate('click', mockEvent)
    const brushPalette = wrapper.find('.paint-tool-bar__brush-types--show').at(0).exists()

    expect(brushPalette).toBeTruthy()
  })

  it('Component should not show brush palette when paint brush tool is first selected', () => {
    const wrapper = createPaintToolBarComponent({ activeTool: toolNames.PAINTAREA })
    const mockEvent = { target: {}, preventDefault: jest.fn(), stopPropagation: jest.fn() }
    wrapper.find('button').at(0).simulate('click', mockEvent)
    const brushPalette = wrapper.find('.paint-tool-bar__brush-types--show').at(0).exists()

    expect(brushPalette).toBeFalsy()
  })

  it('Component should show erase palette when eraser tool is selected and clicked', () => {
    const wrapper = createPaintToolBarComponent({ activeTool: toolNames.ERASE })
    const mockEvent = { target: {}, preventDefault: jest.fn(), stopPropagation: jest.fn() }
    wrapper.find('button').at(1).simulate('click', mockEvent)
    const eraserPalette = wrapper.find('.paint-tool-bar__brush-types--show').at(0).exists()

    expect(eraserPalette).toBeTruthy()
  })

  it('Component should not show brush palette when paint brush tool is first selected', () => {
    const wrapper = createPaintToolBarComponent({ activeTool: toolNames.PAINTAREA })
    const mockEvent = { target: {}, preventDefault: jest.fn(), stopPropagation: jest.fn() }
    wrapper.find('button').at(1).simulate('click', mockEvent)
    const eraserPalette = wrapper.find('.paint-tool-bar__brush-types--show').at(0).exists()

    expect(eraserPalette).toBeFalsy()
  })
})
 */
