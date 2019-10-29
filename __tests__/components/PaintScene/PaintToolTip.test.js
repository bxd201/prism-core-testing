import React from 'react'
import { shallow } from 'enzyme'
import PaintToolTip, { toolNameClass, tooltipContentClass, toolNumberClass, headerClass } from 'src/components/PaintScene/PaintToolTip'
import { toolBarButtons } from 'src/components/PaintScene/data'

const closeTooltipMockFn = jest.fn()
const backButtonClickHandlerMockFn = jest.fn()
const nextButtonClickHandlerMockFn = jest.fn()
const tooltipToolActiveName = toolBarButtons[0].displayName
const tooltipToolActiveNumber = toolBarButtons[0].id
const tooltipContent = toolBarButtons[0].tooltipContent
const toolsCount = toolBarButtons.length
const isSelectGroup = false

const defaultProps = {
  tooltipToolActiveName: tooltipToolActiveName,
  tooltipToolActiveNumber: tooltipToolActiveNumber,
  tooltipContent: tooltipContent,
  toolsCount: toolsCount,
  closeTooltip: closeTooltipMockFn,
  backButtonClickHandler: backButtonClickHandlerMockFn,
  nextButtonClickHandler: nextButtonClickHandlerMockFn,
  isSelectGroup: isSelectGroup
}

const createPaintToolTip = (props) => {
  return shallow(<PaintToolTip {...defaultProps} {...props} />)
}

describe('PaintToolTip render testing', () => {
  let paintToolTip

  beforeEach(() => (paintToolTip = createPaintToolTip()))

  it('should match snapshot', () => expect(paintToolTip).toMatchSnapshot())

  it('should render header content', () => {
    const headerContent = 'TOOL TIPS'
    expect(paintToolTip.find(`div.${headerClass} > span`).text()).toEqual(headerContent)
  })

  it('should render Tool name', () => {
    expect(paintToolTip.find(`div.${toolNameClass}`).text()).toEqual(tooltipToolActiveName)
  })

  it('should render Tool content', () => {
    expect(paintToolTip.find(`div.${tooltipContentClass}`).text()).toEqual(tooltipContent)
  })

  it('should render Tool number span', () => {
    const spanContent = `${tooltipToolActiveNumber} of ${toolsCount}`
    expect(paintToolTip.find(`span.${toolNumberClass}`).text()).toEqual(spanContent)
  })

  it('should call closeTooltipMockFn when close button is clicked', () => {
    paintToolTip.find('button').at(0).simulate('click')
    expect(closeTooltipMockFn).toHaveBeenCalled()
  })

  it('should call backButtonClickHandlerMockFn when BACK button is clicked', () => {
    paintToolTip.setProps({ tooltipToolActiveNumber: 2 })
    paintToolTip.find('button').at(1).simulate('click')
    expect(backButtonClickHandlerMockFn).toHaveBeenCalled()
  })

  it('should call nextButtonClickHandlerMockFn when NEXT button is clicked', () => {
    paintToolTip.find('button').at(2).simulate('click')
    expect(nextButtonClickHandlerMockFn).toHaveBeenCalled()
  })

  it('should call closeTooltipMockFn when isSelectGroup is true and close button is clicked', () => {
    paintToolTip.setProps({ isSelectGroup: true })
    paintToolTip.find('button').at(0).simulate('click')
    expect(closeTooltipMockFn).toHaveBeenCalled()
  })
})
