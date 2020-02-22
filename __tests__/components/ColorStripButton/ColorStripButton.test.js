import React from 'react'
import ColorStripButton from 'src/components/ColorStripButton/ColorStripButton'

it('renders any children elements', () => {
  const { getByText } = render(<ColorStripButton>text</ColorStripButton>)
  expect(getByText('text')).toBeInTheDocument()
})

it('renders a color strip when one is provided', () => {
  const { getAllByTestId } = render(<ColorStripButton colors={[{ hex: '000000' }, { hex: '000000' }]} />)
  const colorStrip = getAllByTestId('color-square')
  expect(colorStrip).toHaveLength(2)
  colorStrip.forEach(colorSquare => expect(colorSquare).toHaveStyle('background-color: 000000'))
})

it('renders bottom label when one is provided', () => {
  const { getByText } = render(<ColorStripButton bottomLabel='a bottom label' />)
  expect(getByText('a bottom label')).toBeInTheDocument()
})
