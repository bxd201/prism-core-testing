import React from 'react'
import ColorWallToolbar from 'src/components/Facets/ColorWall/ColorWallToolbar'

test('snapshot matches', () => {
  expect(mocked(<ColorWallToolbar />)).toMatchSnapshot()
})
