import React from 'react'
import ColorWallSwatchList from 'src/components/Facets/ColorWall/ColorWallSwatchList'

const defaultParams = {
  colors: []
}

test('snapshot matches', () => {
  expect(mocked(<ColorWallSwatchList {...defaultParams}/>)).toMatchSnapshot()
})
