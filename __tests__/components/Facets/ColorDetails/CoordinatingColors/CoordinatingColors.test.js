/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import CoordinatingColors from 'src/components/Facets/ColorDetails/CoordinatingColors/CoordinatingColors'
import * as Colors from '__mocks__/data/color/Colors'
import CoordinatingColorSwatch from 'src/components/Facets/ColorDetails/CoordinatingColors/CoordinatingColorSwatch'
import { FormattedMessage } from 'react-intl'

const color = Colors.getColor()
const colors = Colors.getAllColors()

const getCoordinatingColors = (props) => {
  return shallow(<CoordinatingColors {...props} />)
}

describe('CoordinatingColors component with props', () => {
  let coordinatingColors
  beforeEach(() => {
    if (!coordinatingColors) {
      coordinatingColors = getCoordinatingColors({ colors: colors, color: color })
    }
  })

  it('CoordinatingColors is rendering', () => {
    expect(coordinatingColors.exists()).toBe(true)
  })

  it('CoordinatingColors is rendering H5 with FormattedMessage', () => {
    expect(coordinatingColors.find('h5.visually-hidden').contains(<FormattedMessage id='COORDINATING_COLORS' />)).toBeTruthy()
  })

  it('CoordinatingColors is rendering CoordinatingColorSwatch under ul', () => {
    expect(coordinatingColors.find('ul.color-info__coord-colors').contains(<CoordinatingColorSwatch />)).toBeTruthy()
  })
})
