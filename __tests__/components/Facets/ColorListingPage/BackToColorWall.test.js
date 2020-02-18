import React from 'react'
import { BackToColorWall } from 'src/components/Facets/ColorListingPage/BackToColorWall'
import * as Colors from '__mocks__/data/color/Colors'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

describe('BackToColorWall', () => {
  let backToColorWall

  beforeAll(() => {
    // eslint-disable-next-line no-undef
    backToColorWall = mocked(<BackToColorWall color={Colors.getColor()} />)
  })

  it('should rendring format message component', () => expect(backToColorWall.find(FormattedMessage)).toBeTruthy())

  it('should rendring Link correctly', () => expect(backToColorWall.find(Link)).toBeTruthy())
})
