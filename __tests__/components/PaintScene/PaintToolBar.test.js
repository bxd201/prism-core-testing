import React from 'react'
import { shallow, mount } from 'enzyme'
import PaintToolBar,
{ toolbarToggleButtonClass, toolbarButtonClass, brushTypesClass } from 'src/components/PaintScene/PaintToolBar'
import { toolNames, brushLargeSize, brushRoundShape } from 'src/components/PaintScene/data'
import BrushTypes from 'src/components/PaintScene/BrushTypes'
import ZoomTool from 'src/components/PaintScene/ZoomTool'
import PaintToolTip from 'src/components/PaintScene/PaintToolTip'

const setActiveToolMockFn = jest.fn()
const clearCanvasMockFn = jest.fn()
const setBrushShapeSizeMockFn = jest.fn()
const groupHandlerMockFn = jest.fn()
const performUndoMockFn = jest.fn()
const performRedoMockFn = jest.fn()
const hidePaintMockFn = jest.fn()
const applyZoomMockFn = jest.fn()
const mockEvent = { target: {}, preventDefault: jest.fn(), stopPropagation: jest.fn() }
const toggleButtonClickHandlerMock = jest.fn()

const defaultProps = {
  activeTool: toolNames.PAINTAREA,
  setActiveTool: setActiveToolMockFn,
  clearCanvas: clearCanvasMockFn,
  paintBrushShape: brushRoundShape,
  paintBrushWidth: brushLargeSize,
  eraseBrushShape: brushRoundShape,
  eraseBrushWidth: brushLargeSize,
  setBrushShapeSize: setBrushShapeSizeMockFn,
  groupHandler: groupHandlerMockFn,
  performUndo: performUndoMockFn,
  performRedo: performRedoMockFn,
  undoIsEnabled: true,
  redoIsEnabled: true,
  hidePaint: hidePaintMockFn,
  applyZoom: applyZoomMockFn,
  isUngroup: false,
  isAddGroup: false,
  isDeleteGroup: false
}

const createPaintToolBar = (props) => {
  return shallow(<PaintToolBar {...defaultProps} {...props} />)
}

const mountPaintToolBar = (props) => {
  return mount(<PaintToolBar {...defaultProps} {...props} />)
}

describe('PaintToolBar render testing', () => {
  let paintToolBar

  beforeAll(() => (paintToolBar = createPaintToolBar()))

  it('should match snapshot', () => expect(paintToolBar).toMatchSnapshot())

  it('should render 2 BrushTypes component, one for Paint brush and other for Erase', () => {
    expect(paintToolBar.find(BrushTypes)).toHaveLength(2)
  })

  it('should render 15 buttons, 14 for tools and 1 for toggle toolbar', () => {
    expect(paintToolBar.find('button')).toHaveLength(15)
  })

  it('should render ZoomTool component', () => {
    expect(paintToolBar.find(ZoomTool).exists()).toBe(true)
  })
})

describe('PaintToolBar state & event testing using shallow', () => {
  let paintToolBar

  beforeAll(() => (paintToolBar = createPaintToolBar()))

  it('should render PaintToolTip when Hints button is clicked', () => {
    paintToolBar.find('button').at(13).simulate('click', mockEvent)
    expect(paintToolBar.find(PaintToolTip).exists()).toBe(true)
  })

  it('should call mock function toggleButtonClickHandlerMock when Toggle button is clicked', () => {
    paintToolBar.instance().toggleButtonClickHandler = toggleButtonClickHandlerMock
    paintToolBar.instance().forceUpdate()
    paintToolBar.find('button').at(14).simulate('click', mockEvent)
    expect(toggleButtonClickHandlerMock).toHaveBeenCalled()
  })
})

describe('PaintToolBar state & event testing using mount', () => {
  let paintToolBar
  let initialState

  beforeEach(() => {
    paintToolBar = mountPaintToolBar()
    initialState = paintToolBar.instance().state
  })

  afterEach(jest.clearAllMocks)

  it('should hide/show Toolbar when Toggle button is clicked', () => {
    paintToolBar.find(`button.${toolbarToggleButtonClass}`).simulate('click')
    expect(!initialState.showToolBar).toEqual(paintToolBar.instance().state.showToolBar)
    paintToolBar.find(`button.${toolbarToggleButtonClass}`).simulate('click')
    expect(initialState.showToolBar).toEqual(paintToolBar.instance().state.showToolBar)
  })

  it('should show PaintToolTip when Hints button is clicked', () => {
    paintToolBar.find(`button.${toolbarButtonClass}`).at(13).simulate('click')
    expect(paintToolBar.find(PaintToolTip).exists()).toBe(true)
    expect(!initialState.showTooltip).toEqual(paintToolBar.instance().state.showTooltip)
  })

  it('should show/hide Paint BrushTypes when PaintBrush button is clicked', () => {
    paintToolBar.setProps({ activeTool: toolNames.PAINTBRUSH })
    paintToolBar.find(`button.${toolbarButtonClass}`).at(4).simulate('click')
    expect(!initialState.showPaintBrushTypes).toEqual(paintToolBar.instance().state.showPaintBrushTypes)
    paintToolBar.find(`button.${toolbarButtonClass}`).at(4).simulate('click')
    expect(initialState.showPaintBrushTypes).toEqual(paintToolBar.instance().state.showPaintBrushTypes)
  })

  it('should hide Paint BrushTypes when mouseleave event occurs on Paint BrushTypes div', () => {
    paintToolBar.setProps({ activeTool: toolNames.PAINTBRUSH })
    paintToolBar.find(`button.${toolbarButtonClass}`).at(4).simulate('click')
    paintToolBar.find(`div.${brushTypesClass}`).at(0).simulate('mouseleave')
    expect(initialState.showPaintBrushTypes).toEqual(paintToolBar.instance().state.showPaintBrushTypes)
  })

  it('should show/hide Erase BrushTypes when Erase button is clicked', () => {
    paintToolBar.setProps({ activeTool: toolNames.ERASE })
    paintToolBar.find(`button.${toolbarButtonClass}`).at(6).simulate('click')
    expect(!initialState.showEraseBrushTypes).toEqual(paintToolBar.instance().state.showEraseBrushTypes)
    paintToolBar.find(`button.${toolbarButtonClass}`).at(6).simulate('click')
    expect(initialState.showEraseBrushTypes).toEqual(paintToolBar.instance().state.showEraseBrushTypes)
  })

  it('should hide Erase BrushTypes when mouseleave event occurs on Erase BrushTypes div', () => {
    paintToolBar.setProps({ activeTool: toolNames.ERASE })
    paintToolBar.find(`button.${toolbarButtonClass}`).at(6).simulate('click')
    paintToolBar.find(`div.${brushTypesClass}`).at(1).simulate('mouseleave')
    expect(initialState.showEraseBrushTypes).toEqual(paintToolBar.instance().state.showEraseBrushTypes)
  })

  it('should hide/show Zoom slider when Zoom tool is active and Toggle button is clicked', () => {
    paintToolBar.setProps({ activeTool: toolNames.ZOOM })
    paintToolBar.find(`button.${toolbarToggleButtonClass}`).simulate('click')
    expect(paintToolBar.instance().state.zoomSliderHide).toEqual(1)
    paintToolBar.find(`button.${toolbarToggleButtonClass}`).simulate('click')
    expect(paintToolBar.instance().state.zoomSliderHide).toEqual(0)
  })

  it('should call hidePaint prop function and update isHidePaint state when mousedown event occurs on HidePaint tool button', () => {
    paintToolBar.find(`button.${toolbarButtonClass}`).at(12).simulate('mousedown')
    expect(!initialState.isHidePaint).toEqual(paintToolBar.instance().state.isHidePaint)
    expect(hidePaintMockFn).toHaveBeenCalled()
  })

  it('should call groupHanlder prop function when Select tool is active and Delete button is clicked', () => {
    paintToolBar.find(`button.${toolbarButtonClass}`).at(5).simulate('click')
    paintToolBar.find(`button.${toolbarButtonClass}`).at(0).simulate('click')
    expect(groupHandlerMockFn).toHaveBeenCalled()
  })

  it('should call groupHanlder prop function when Select tool is active and Group button is clicked', () => {
    paintToolBar.find(`button.${toolbarButtonClass}`).at(5).simulate('click')
    paintToolBar.find(`button.${toolbarButtonClass}`).at(1).simulate('click')
    expect(groupHandlerMockFn).toHaveBeenCalled()
  })

  it('should call groupHanlder prop function when Select tool is active and Ungroup button is clicked', () => {
    paintToolBar.find(`button.${toolbarButtonClass}`).at(5).simulate('click')
    paintToolBar.find(`button.${toolbarButtonClass}`).at(2).simulate('click')
    expect(groupHandlerMockFn).toHaveBeenCalled()
  })
})
