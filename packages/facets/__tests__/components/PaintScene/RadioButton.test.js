import React from 'react'
import RadioButton from 'src/components/PaintScene/RadioButton'
import { fireEvent } from '@testing-library/dom'

test('RadioButton', async () => {
  const triggerSetBrushShapeSize = jest.fn()
  const enableBrushType = jest.fn()
  const { getByLabelText } = render(<RadioButton
    triggerSetBrushShapeSize={triggerSetBrushShapeSize}
    value='round-38'
    ariaLabel={`the 38 pixel wide, round paint brush`}
    id='paint0'
    isSelected
    enableBrushType={enableBrushType}
    brushTypeName='paint'
  />)
  getByLabelText('the 38 pixel wide, round paint brush')
  await fireEvent.click(getByLabelText('the 38 pixel wide, round paint brush'))
  expect(triggerSetBrushShapeSize).toHaveBeenCalled()
  await fireEvent.keyDown(getByLabelText('the 38 pixel wide, round paint brush'), { keyCode: 39 })
  expect(enableBrushType).toHaveBeenCalled()
})
