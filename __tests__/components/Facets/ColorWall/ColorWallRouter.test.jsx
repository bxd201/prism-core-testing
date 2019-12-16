import React from 'react'
import ColorWallRouter from 'src/components/Facets/ColorWall/ColorWallRouter'

test('snapshot matches', () => {
  expect(mocked(<ColorWallRouter />)).toMatchSnapshot()
})
