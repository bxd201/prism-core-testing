import React from 'react'
import { ColorFamilyPage } from 'src/components/Facets/ColorFamilyFacet/ColorFamilyFacet'
import { fireEvent } from '@testing-library/dom'

test('ColorFamilyFacet', async () => {
  const { findByText, findByLabelText, findByTitle, queryByText, findByPlaceholderText } = render(<ColorFamilyPage selectedColorFamily='red' />)

  // clicking the button with label positive Red is blooms the swatch and displays it's text
  await fireEvent.click(await findByLabelText('SW 6871 Positive Red'))
  await findByText('SW 6871')
  await findByText('Positive Red')

  // after zooming back out the bloomed text no longer exists
  await fireEvent.click(await findByTitle('Zoom out'))
  await expect(queryByText('Positive Red')).toBeNull()

  // entering 'red' into the search input shows some results
  fireEvent.change(await findByPlaceholderText('Search by color name or number'), { target: { value: 'red' } })
  await findByText('SW 6321')
  await findByText('Red Bay')

  // clearing the search input shows the color wall again
  fireEvent.change(await findByPlaceholderText('Search by color name or number'), { target: { value: '' } })
  await findByLabelText('SW 6871 Positive Red')

  // a message and suggestions are displayed when there are no results
  fireEvent.change(await findByPlaceholderText('Search by color name or number'), { target: { value: 'asdf' } })
  await findByText('Sorry, no color matches found.')
  await findByText('Youthful Coral')
})
