import React from 'react'
import ConfirmationModal from 'src/components/MatchPhoto/ConfirmationModal'
import { fireEvent } from '@testing-library/dom'
import { RouteContext } from 'src/contexts/RouteContext/RouteContext'

test('ConfirmationModal', async () => {
  const onClickNo = jest.fn()
  const setActiveComponent = jest.fn()
  const { getByText } = render(
    <RouteContext.Provider value={{ setActiveComponent: setActiveComponent }}>
      <ConfirmationModal
        onClickNo={onClickNo}
      />
    </RouteContext.Provider>
  )

  getByText('The photo content will be lost if you close. Make sure the colors you want to keep have been added to your palette. Do you still want to close?')
  getByText('Yes')
  getByText('No')
  await fireEvent.click(getByText('Yes'))
  expect(setActiveComponent).toHaveBeenCalled()
})
