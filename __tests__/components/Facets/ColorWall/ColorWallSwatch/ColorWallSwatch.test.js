/* eslint-disable no-undef */
/* eslint-env jest */
import React from 'react'
import ColorWallSwatch from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatch'
import * as Colors from '__mocks__/data/color/Colors'
import { Link } from 'react-router-dom'
import { fullColorName } from 'src/shared/helpers/ColorUtils'

const color = Colors.getColor()
const clickFn = jest.fn()

const defaultProps = {
  color: color,
  focus: false,
  thisLink: '',
  detailsLink: '',
  showContents: false,
  onAdd: clickFn,
  onClick: clickFn,
  active: false
}

test('ColorWallSwatch should match the Snapshot', () => {
  expect(mocked(<ColorWallSwatch {...defaultProps} />)).toMatchSnapshot()
})

test('ColorWallSwatch should render color title as default', () => {
  expect(fullColorName(color.brandKey, color.colorNumber, color.name)).toBe('SW 6561 Teaberry')
})

test('ColorSwatch renders a view details button by default when showContents = true', () => {
  expect(mocked(<ColorWallSwatch {...defaultProps} showContents />).text()).toContain('View Details')
})

test('ColorWallSwatch should render Link correctly when showContents = false and thislink = test', () => {
  expect(mocked(<ColorWallSwatch {...defaultProps} thisLink='test' />).find(Link).exists()).toBe(true)
})

test('clicking a ColorWallSwatch with showContents = false and no thisLink does NOT generate a Link', () => {
  expect(mocked(<ColorWallSwatch {...defaultProps} />).find(Link)).toHaveLength(0)
})

test('clicking a ColorWallSwatch with showContents = false and thisLink = \'test\' calls the passed in onClick function', () => {
  mocked(<ColorWallSwatch {...defaultProps} thisLink='test' />).find(Link).simulate('click')
  expect(clickFn).toHaveBeenCalled()
})
