import React from 'react'
import BrushTypes from 'src/components/PaintScene/BrushTypes'
import { brushLargeSize, brushMediumSize, brushSmallSize, brushTinySize, brushRoundShape, brushSquareShape } from 'src/components/PaintScene/data'
import { fireEvent } from '@testing-library/dom'

test('BrushTypes', async () => {
  const brushSizeArray = [brushLargeSize, brushMediumSize, brushSmallSize, brushTinySize]
  const brushShapeTypeArray = [brushRoundShape, brushSquareShape]
  const brushTypeName = 'paint'
  const setBrushShapeSize = jest.fn()
  const { getByLabelText } = render(
    <BrushTypes
      activeWidth={brushSizeArray[0]}
      activeShape={brushShapeTypeArray[0]}
      setBrushShapeSize={setBrushShapeSize}
      brushTypeName={brushTypeName}
    />
  )

  brushSizeArray.map(brushSize => {
    if (brushSize === brushSizeArray[0]) {
      getByLabelText(`the ${brushSize} pixel wide, ${brushShapeTypeArray[0]} ${brushTypeName} brush`)
    }
  })

  await fireEvent.click(getByLabelText(`the ${brushMediumSize} pixel wide, ${brushShapeTypeArray[1]} ${brushTypeName} brush`))
  expect(setBrushShapeSize).toHaveBeenCalled()
  await fireEvent.keyDown(getByLabelText(`the ${brushMediumSize} pixel wide, ${brushShapeTypeArray[1]} ${brushTypeName} brush`), { keyCode: 39 })
  expect(setBrushShapeSize).toHaveBeenCalled()
})
