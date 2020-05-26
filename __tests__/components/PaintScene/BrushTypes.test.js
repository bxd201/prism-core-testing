import React from 'react'
import BrushTypes from 'src/components/PaintScene/BrushTypes'
import { brushLargeSize, brushMediumSize, brushSmallSize, brushTinySize, brushRoundShape, brushSquareShape } from 'src/components/PaintScene/data'
import { fireEvent } from '@testing-library/dom'

it('BrushTypes', async () => {
  const brushSizeArray = [brushLargeSize, brushMediumSize, brushSmallSize, brushTinySize]
  const brushShapeTypeArray = [brushRoundShape, brushSquareShape]
  const setBrushShapeSize = jest.fn()
  const { getByLabelText } = render(
    <BrushTypes
      activeWidth={brushSizeArray[0]}
      activeShape={brushShapeTypeArray[0]}
      setBrushShapeSize={setBrushShapeSize}
    />
  )

  brushSizeArray.map(brushSize => {
    if (brushSize === brushSizeArray[0]) {
      getByLabelText(`the ${brushSize} pixel wide, ${brushShapeTypeArray[0]} brush is active`)
    } else {
      getByLabelText(`select the ${brushSize} pixel wide, ${brushShapeTypeArray[0]} brush`)
    }
  })

  brushSizeArray.map(brushSize => {
    getByLabelText(`select the ${brushSize} pixel wide, ${brushShapeTypeArray[1]} brush`)
  })

  await fireEvent.click(getByLabelText(`select the ${brushMediumSize} pixel wide, ${brushShapeTypeArray[1]} brush`))
  expect(setBrushShapeSize).toHaveBeenCalled()
})
