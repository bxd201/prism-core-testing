import React from 'react'
import Help from 'src/components/Help/Help'
import { fireEvent } from '@testing-library/dom'
import { RouteContext } from 'src/contexts/RouteContext/RouteContext'

test('Help', async () => {
  const navigate = jest.fn()
  const { getByText, getAllByText } = render(
    <RouteContext.Provider value={{ navigate: navigate }}>
      <Help />
    </RouteContext.Provider>
  )

  getByText('Helpful Hints')
  getByText('CLOSE')
  getAllByText('Icons & Buttons')
  getAllByText('My Color Palette')
  getAllByText('Adding Colors')
  getAllByText('Color Details')
  getAllByText('Painting My Own Photo')
  getAllByText('Saving My Work')
  fireEvent.click(getByText('CLOSE'))
  expect(navigate).toHaveBeenCalled()
})
