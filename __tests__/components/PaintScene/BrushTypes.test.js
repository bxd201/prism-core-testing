import React from 'react'
import { shallow } from 'enzyme'
import BrushTypes from 'src/components/PaintScene/BrushTypes'
import { brushLargeSize, brushRoundShape } from 'src/components/PaintScene/data'

const setBrushShapeSizeMockFn = jest.fn()

const defaultProps = {
  activeWidth: brushLargeSize,
  activeShape: brushRoundShape,
  setBrushShapeSize: setBrushShapeSizeMockFn
}

const createBrushTypes = (props) => {
  return shallow(<BrushTypes {...defaultProps} {...props} />)
}

describe('BrushTypes render & event testing', () => {
  let brushTypes

  beforeEach(() => (brushTypes = createBrushTypes()))

  afterEach(jest.clearAllMocks)

  it('should render 8 buttons for 8 brush types', () => {
    expect(brushTypes.find('button')).toHaveLength(8)
  })

  it('should call setBrushShapeSizeMockFn when each brush type button is clicked', () => {
    brushTypes.find('button').map(buttonElement => {
      buttonElement.simulate('click')
      expect(setBrushShapeSizeMockFn).toHaveBeenCalled()
    })
    expect(setBrushShapeSizeMockFn).toHaveBeenCalledTimes(8)
  })

  it(`should call setBrushShapeSizeMockFn with parameters ${brushRoundShape} and ${brushLargeSize} when first button is clicked`, () => {
    brushTypes.find('button').at(0).simulate('click')
    expect(setBrushShapeSizeMockFn).toHaveBeenCalledWith(brushRoundShape, brushLargeSize)
  })
})
