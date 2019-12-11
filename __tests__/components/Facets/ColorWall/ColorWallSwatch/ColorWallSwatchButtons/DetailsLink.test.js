/* eslint-env jest */
import React from 'react'
import DetailsLink from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchButtons/DetailsLink'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import ColorWallContext from 'src/components/Facets/ColorWall/ColorWallContext'

const color = { id: 1, brandKey: 'sw', colorNumber: 1234, name: 'red' }

test('matches snapshot', () => {
  expect(mocked(<DetailsLink color={color} />)).toMatchSnapshot()
})

test('should render nothing when ColorWallContext.displayDetailsLink is false', () => {
  expect(mocked(
    <ColorWallContext.Provider value={{ displayDetailsLink: false }}>
      <DetailsLink color={color} />
    </ColorWallContext.Provider>
  ).html()).toBe("")
})

test('should render an anchor tag when ColorWallContext.colorDetailPageRoot has a value', () => {
  const expectedLink = `/homeowners/color/find-and-explore-colors/paint-colors-by-family/${color.brandKey}${color.colorNumber}-${color.name}`
  expect(mocked(
    <ColorWallContext.Provider
      value={{
        displayDetailsLink: true,
        colorDetailPageRoot: '/homeowners/color/find-and-explore-colors/paint-colors-by-family'
      }}
    >
      <DetailsLink color={color} />
    </ColorWallContext.Provider>
  ).find('a').prop('href')).toEqual(expectedLink)
})

test('should render Link to /active/color-detail/id/brandkey-colorNumber-name by default', () => {
  const expectedLink = `/active/color-detail/${color.id}/${color.brandKey}-${color.colorNumber}-${color.name}`
  expect(mocked(<DetailsLink color={color} />).find(Link).prop('to')).toEqual(expectedLink)
})

test('should render FormattedMessage component', () => {
  expect(mocked(<DetailsLink color={color} />).find(FormattedMessage).exists()).toBeTruthy()
})

test('should render FormattedMessage component with id defined as constant formattedMessageId', () => {
  const formattedMessageId = 'VIEW_DETAILS'
  expect(mocked(<DetailsLink color={color} />).find(FormattedMessage).prop('id')).toEqual(formattedMessageId)
})
