import React from 'react'
import { ColorWallPage } from 'src/components/Facets/ColorWallFacet'
import { fireEvent } from '@testing-library/dom'

test('ColorWallFacet', async () => {
  const { findByText, findByPlaceholderText, findByLabelText } = render(<ColorWallPage />)

  await fireEvent.click(await findByText('Sherwin-Williams Colors'))
  await findByLabelText('SW 6840 Exuberant Pink')

  // clicking "Color Families" shows a list of color families and a cancel button
  await fireEvent.click(await findByText('Color Families'))
  await findByText('Red')
  await findByText('Orange')
  await findByText('White & Pastel')
  await fireEvent.click(await findByText('Cancel'))

  // clicking "Search Color" shows the search bar and a cancel button
  await fireEvent.click(await findByText('Search color'))
  await findByPlaceholderText('Search by color name or number')
  await fireEvent.click(await findByText('Cancel'))

  // clicking the "Ebbtide" color swatch expands that color swatch and displays a "View Details" button by default
  await fireEvent.click(await findByLabelText('SW 6493 Ebbtide'))
  await findByText('SW 6493')
  await findByText('Ebbtide')
  await findByText('View Details')

  // after clicking the "Historic Colors" navigation button, the "SW 0038 Library Pewter" color swatch is displayed
  await fireEvent.click(await findByText('Sherwin-Williams Colors'))
  await fireEvent.click(await findByText('Historic Colors'))
  await findByLabelText('SW 0038 Library Pewter')

  // after clicking the "Timeless Colors" navigation button, the "SW 9185 Marea Baja" color swatch is displayed
  await fireEvent.click(await findByText('Historic Colors'))
  await fireEvent.click(await findByText('Timeless Colors'))
  await findByLabelText('SW 9185 Marea Baja')
}, 15000)
