import React from 'react'
import ColorWall from 'src/components/Facets/ColorWall/ColorWall'

test('snapshot matches', () => {
  expect(mocked(<ColorWall />)).toMatchSnapshot()
})
