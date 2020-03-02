import React from 'react'
import ColorStripButton from 'src/components/ColorStripButton/ColorStripButton'

it('ColorStripButton', () => {
  const { getByText, getAllByTestId } = render(
    <ColorStripButton colors={[{ hex: '000000' }, { hex: '000000' }]} bottomLabel='a bottom label'>
      text
    </ColorStripButton>
  )

  // renders any children elements
  getByText('text')

  // renders a color strip when one is provided
  const colorStrip = getAllByTestId('color-square')
  expect(colorStrip).toHaveLength(2)
  colorStrip.forEach(colorSquare => expect(colorSquare).toHaveStyle('background-color: 000000'))

  // renders bottom label when one is provided
  getByText('a bottom label')
})
