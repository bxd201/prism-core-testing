/* eslint-env jest */
import React from 'react'
import ColorWallSwatchUI from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchUI'
import * as Colors from '__mocks__/data/color/Colors'
import { Link } from 'react-router-dom'
const color = Colors.getColor()

const clickFn = jest.fn()
const defaultProps = {
  color: color,
  thisLink: '',
  focus: true,
  ref: { current: null },
  onClick: clickFn
}

test('should rendring Link correctly with props', () => {
  expect(mocked(<ColorWallSwatchUI {...defaultProps} thisLink='link' />).find(Link).exists()).toEqual(true)
})

test('click function will be invoked when link is clicked', () => {
  mocked(<ColorWallSwatchUI {...defaultProps} thisLink='link' />).find(Link).simulate('click')
  expect(clickFn).toHaveBeenCalled()
})
