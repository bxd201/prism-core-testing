import React from 'react'
import PaintToolBar from 'src/components/PaintScene/PaintToolBar'
import { fireEvent, within } from '@testing-library/dom'

test('PaintToolBar', async () => {
  const activeTool = 'paintArea'
  const activeToolText = 'PAINT AREA'
  const toolButtonsCount = 11
  const setActiveTool = jest.fn()
  const hidePaint = jest.fn()
  const { findByText, findByLabelText } = render(
    <PaintToolBar
      activeTool={activeTool}
      setActiveTool={setActiveTool}
      hidePaint={hidePaint}
    />
  )

  await findByText(activeToolText)

  const { getAllByRole } = within(await findByLabelText('Tools container'))
  const toolButtons = getAllByRole('button')

  expect(toolButtons).toHaveLength(toolButtonsCount)

  await findByLabelText('Tooltips tool wrapper') // Tools wrapper div exist
  // Clicking toggle toolbar button hides toolbar
  await fireEvent.click(await findByLabelText('Toggle toolbar'))
  await findByLabelText('Tools container hidden')

  // Clicking toggle toolbar button again shows toolbar
  await fireEvent.click(await findByLabelText('Toggle toolbar'))
  await findByLabelText('Tools container')

  // MouseDown on Hide paint tool button triggers hidePaint function
  await fireEvent.mouseDown(toolButtons[9])
  expect(hidePaint).toBeCalled()

  // Clicking any tool button triggers setActiveTool function
  await fireEvent.click(toolButtons[10])
  expect(setActiveTool).toHaveBeenCalled()
})
