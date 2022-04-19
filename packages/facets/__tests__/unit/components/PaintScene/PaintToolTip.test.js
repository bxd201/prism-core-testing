import React from 'react'
import PaintToolTip from 'src/components/PaintScene/PaintToolTip'
import { fireEvent } from '@testing-library/dom'

it('PaintToolTip', async () => {
  const tooltipToolActiveNumber = 2
  const toolsCount = 12
  const tooltipContent = 'tooltip'
  const tooltipHeading = 'Paint tool'
  const backBtn = 'Back'
  const nextBtn = 'Next'
  const closeTooltip = jest.fn()
  const backButtonClickHandler = jest.fn()
  const nextButtonClickHandler = jest.fn()
  const showTooltipContentByZindex = jest.fn()
  const hideTooltipContentByZindex = jest.fn()

  const { findByText, findByLabelText } = render(
    <PaintToolTip
      tooltipToolActiveName='Paint tool'
      tooltipToolActiveNumber={tooltipToolActiveNumber}
      tooltipContent='tooltip'
      toolsCount={toolsCount}
      closeTooltip={closeTooltip}
      backButtonClickHandler={backButtonClickHandler}
      nextButtonClickHandler={nextButtonClickHandler}
      showTooltipContentByZindex={showTooltipContentByZindex}
      hideTooltipContentByZindex={hideTooltipContentByZindex}
    />
  )

  await findByText(tooltipContent)
  await findByText(tooltipHeading)
  await findByText(`${tooltipToolActiveNumber} of ${toolsCount}`)
  await fireEvent.click(await findByLabelText('Close'))
  expect(closeTooltip).toBeCalled()
  await findByText(backBtn)
  await fireEvent.click(await findByText(backBtn))
  expect(backButtonClickHandler).toBeCalled()
  await fireEvent.click(await findByText(nextBtn))
  expect(nextButtonClickHandler).toBeCalled()
})
