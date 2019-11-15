/* eslint-env jest */

import React from 'react'
import { SherwinColorWall } from 'src/components/Facets/ColorWall/SherwinColorWall'
import * as Colors from '__mocks__/data/color/Colors'
import { FormattedMessage } from 'react-intl'
import HeroLoader from 'src/components/Loaders/HeroLoader/HeroLoader'
import GenericMessage from 'src/components/Messages/GenericMessage'
import ColorWallSwatchList from 'src/components/Facets/ColorWall/ColorWallSwatchList'
import { shallowWithIntl } from '__mocks__/helpers/intl'

const color = Colors.getColor()
const brights = Colors.getBrights()
const colors = Colors.getAllColors()
const colorMap = Colors.getAllColors()
const family = 'Red'
const families = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Neutral', 'White & Pastel']
const configContext = { 'theme': { 'primary': '#0069af', 'secondary': '#4f5967', 'warning': '#f2c500', 'success': '#1fce6d', 'danger': '#e94b35', 'error': '#e94b35', 'grey': '#cccccc', 'lightGrey': '#dddddd', 'nearBlack': '#2e2e2e', 'black': '#000000', 'white': '#ffffff' }, 'colorWall': { 'bloomRadius': 2 }, 'displayInfoButton': true }

const getSherwinColorWall = (props) => {
  let defaultProps = {
    loading: false,
    error: false,
    color: color,
    brights: brights,
    colors: colors,
    colorMap: colorMap,
    family: family,
    families: families,
    addToLivePalette: jest.fn(),
    config: configContext
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallowWithIntl(<SherwinColorWall {...newProps} />)
}

describe('SherwinColorWall with props', () => {
  let sherwinColorWall
  beforeEach(() => {
    if (!sherwinColorWall) {
      sherwinColorWall = getSherwinColorWall()
    }
  })

  it('should match snapshot', () => {
    expect(sherwinColorWall).toMatchSnapshot()
  })

  it('should render HeroLoader when loading prop is true', () => {
    sherwinColorWall.setProps({ loading: true })
    expect(sherwinColorWall.find(HeroLoader).exists()).toBe(true)
  })

  it('should show error message when error prop is true', () => {
    sherwinColorWall.setProps({ loading: false, error: true })
    expect(sherwinColorWall.find(GenericMessage).prop('type')).toEqual(GenericMessage.TYPES.ERROR)
    expect(sherwinColorWall.find(FormattedMessage).prop('id')).toEqual('ERROR_LOADING_COLORS')
  })

  it('should show no colors available warning when families prop is empty', () => {
    sherwinColorWall.setProps({ loading: false, error: false, families: [] })
    expect(sherwinColorWall.find(GenericMessage).prop('type')).toEqual(GenericMessage.TYPES.WARNING)
    expect(sherwinColorWall.find(FormattedMessage).prop('id')).toEqual('NO_COLORS_AVAILABLE')
  })

  it('should render ColorWallSwatchList component when families, brigths, colors props are not empty', () => {
    sherwinColorWall.setProps({ loading: false, error: false, families: families })
    expect(sherwinColorWall.find(ColorWallSwatchList).exists()).toBe(true)
  })
})
