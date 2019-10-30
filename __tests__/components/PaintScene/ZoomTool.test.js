import React from 'react'
import { shallow, mount } from 'enzyme'
import ZoomTool, { wrapperClass, zoomSliderClass } from 'src/components/PaintScene/ZoomTool'

const applyZoomMockFn = jest.fn()

const defaultProps = {
  applyZoom: applyZoomMockFn
}

const createZoomTool = (props) => {
  return shallow(<ZoomTool {...defaultProps} {...props} />)
}

const mountZoomTool = (props) => {
  return mount(<ZoomTool {...defaultProps} {...props} />)
}

describe('ZoomTool render testing', () => {
  let zoomTool

  beforeEach(() => (zoomTool = createZoomTool()))

  it('should match snapshot', () => expect(zoomTool).toMatchSnapshot())

  it('should render 2 spans with content', () => {
    expect(zoomTool.find(`div.${wrapperClass} > span`).at(0).text()).toEqual('ZOOM OUT')
    expect(zoomTool.find(`div.${wrapperClass} > span`).at(1).text()).toEqual('ZOOM IN')
  })
})

describe('ZoomTool state & event testing', () => {
  let zoomTool
  let initialState

  beforeEach(() => {
    zoomTool = mountZoomTool()
    initialState = zoomTool.instance().state
  })

  it('should update state isMouseDown when mousedown event occurs on div.zoomSliderClass > div', () => {
    zoomTool.find(`div.${zoomSliderClass} > div`).simulate('mousedown')
    expect(!initialState.isMouseDown).toEqual(zoomTool.instance().state.isMouseDown)
  })

  it('should call dragStartHandlerMockFn when dragstart event occurs on div.zoomSliderClass > div', () => {
    const dragStartHandlerMockFn = jest.fn()
    zoomTool.instance().dragStartHandler = dragStartHandlerMockFn
    zoomTool.instance().forceUpdate()
    zoomTool.find(`div.${zoomSliderClass} > div`).simulate('dragstart')
    expect(dragStartHandlerMockFn).toHaveBeenCalled()
  })
})
