/* eslint-env jest */
import React from 'react'
import InfoButton from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchButtons/InfoButton'
import { Link } from 'react-router-dom'
import ColorWallContext from 'src/components/Facets/ColorWall/ColorWallContext'

const color = { id: 1, brandKey: 'sw', colorNumber: 1234, name: 'red' }

describe('default InfoButton', () => {
  test('should not render', () => expect(mocked(<InfoButton />).find(InfoButton)).toEqual({}))
})

describe('InfoButton wrapped in ColorWallContext with displayInfoButton = true', () => {
  let infoButton
  beforeAll(() => {
    infoButton = mocked(
      <ColorWallContext.Provider value={{ displayInfoButton: true }}>
        <InfoButton color={color} />
      </ColorWallContext.Provider>
    )
  })

  it('should match snapshot', () => expect(infoButton).toMatchSnapshot())

  it('should render Link component with to prop defined as detailsLinkString constant', () => {
    const expectedLink = `/active/color-detail/${color.id}/${color.brandKey}-${color.colorNumber}-${color.name}`
    expect(infoButton.find(Link).prop('to')).toEqual(expectedLink)
  })
})
