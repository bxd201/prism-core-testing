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
  // tab move between swatches
  const tabNode = await findByLabelText('SW 6561 Teaberry')
  await fireEvent.keyDown(tabNode, { key: 'Tab', keyCode: 13 })
  tabNode.focus()
  await fireEvent.keyDown(tabNode, { key: 'Tab', keyCode: 9 })
  await fireEvent.keyDown(document.activeElement, { key: 'Enter', keyCode: 13 })
  await findByText('SW 6288')
  await findByText('Rosebud')

  // shift + tab move between swatches
  const currNode = await findByLabelText('SW 6288 Rosebud')
  await fireEvent.keyDown(currNode, { key: 'Enter', keyCode: 13 })
  currNode.focus()
  await fireEvent.keyDown(currNode, { key: 'Tab', keyCode: 9, shiftKey: true })
  await fireEvent.keyDown(document.activeElement, { key: 'Enter', keyCode: 13 })
  await findByText('SW 6561')
  await findByText('Teaberry')

  // after hit Enter by keyboard of "SW 6958", the color swatch "SW 6958" is displayed
  const node = await findByLabelText('SW 6598 Dishy Coral')
  await node.focus()
  await fireEvent.keyDown(node, { key: 'Enter', keyCode: 13 })
  await findByText('SW 6598')
  await findByText('Dishy Coral')

  // after hit esc zooming back out the bloomed text no longer exists
  await fireEvent.keyDown(node, { key: 'ESC', keyCode: '27' })
  await expect(queryByText('Dishy Coral')).toBeNull()

  // after hit arrow left, bloomed swatch should be display the text next to Dishy Coral
  await node.focus()
  await fireEvent.keyDown(node, { key: 'right', keyCode: 39 })
  await fireEvent.keyDown(document.activeElement, { key: 'Enter', keyCode: 13 })
  await findByText('SW 6605')
  await findByText('Charisma')

  // after hit arrow up, bloomed swatch should be display the text above to Dishy Coral
  await fireEvent.keyDown(node, { key: 'ESC', keyCode: 27 })
  await node.focus()
  await fireEvent.keyDown(node, { key: 'up', keyCode: 38 })
  await fireEvent.keyDown(document.activeElement, { key: 'Enter', keyCode: 13 })
  await findByText('SW 6597')
  await findByText('Hopeful')

  // after hit arrow left, bloomed swatch should be display the text next to Charisma
  await fireEvent.keyDown(node, { key: 'ESC', keyCode: 27 })
  await node.focus()
  await fireEvent.keyDown(node, { key: 'left', keyCode: 37 })
  await fireEvent.keyDown(document.activeElement, { key: 'Enter', keyCode: 13 })
  await findByText('SW 6591')
  await findByText('Amaryllis')

  // after hit arrow down, bloomed swatch should be display the text next to Charisma
  await fireEvent.keyDown(node, { key: 'ESC', keyCode: 27 })
  await node.focus()
  await fireEvent.keyDown(node, { key: 'down', keyCode: 40 })
  await fireEvent.keyDown(document.activeElement, { key: 'Enter', keyCode: 13 })
  await findByText('SW 6599')
  await findByText('Begonia')

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
