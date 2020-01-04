/* eslint-disable */
// @flow
import React, { useMemo } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'

import ButtonBar from '../../GeneralButtons/ButtonBar/ButtonBar'

import { generateColorWallPageUrl, fullColorName } from '../../../shared/helpers/ColorUtils'
import { MODE_CLASS_NAMES } from '../ColorWall/shared'
import { type Color } from '../../../shared/types/Colors'
import { urlWorker } from '../../../shared/helpers/URLUtils'
import { ROUTE_PARAMS } from 'constants/globals'
import { useLocation } from 'react-router-dom'

type StateProps = {
  color?: Color,
  family?: string,
  section?: string,
  searchQuery?: string,
  searchActive?: boolean
}

type OwnProps = {}

type Props = StateProps & OwnProps

export function BackToColorWall ({ color, family, section, searchActive, searchQuery }: Props) {
  // this will degrade gracefully if section and/or family and or color do(es) not exist in redux down to the root color wall URL
  const { state } = useLocation()

  const url = useMemo(() => {
    const colorWallUrl = color
      ? generateColorWallPageUrl(section, family, color.id, fullColorName(color.brandKey, color.colorNumber, color.name))
      : generateColorWallPageUrl(section, family)
    const colorWallUrlPlusSearch = searchActive && searchQuery ? urlWorker.set(ROUTE_PARAMS.SEARCH, searchQuery).in(colorWallUrl) : colorWallUrl
    return colorWallUrlPlusSearch
  }, [color, section, family, searchActive, searchQuery])

  const to = useMemo(() => ({
    pathname: url,
    state
  }), [state, url])

  return (
    <div className={MODE_CLASS_NAMES.BASE}>
      <div className={MODE_CLASS_NAMES.COL}>
        <div className={MODE_CLASS_NAMES.CELL}>
          <ButtonBar.Bar>
            <ButtonBar.Button to={to}>
              <FontAwesomeIcon icon={['fal', 'th-large']} pull='left' fixedWidth />
              <FormattedMessage id='BACK_TO_COLOR_WALL' />
            </ButtonBar.Button>
          </ButtonBar.Bar>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state, props) => {
  return {
    family: state.colors.family,
    section: state.colors.section,
    color: state.colors.colorWallActive,
    searchQuery: state.colors.search.query,
    searchActive: state.colors.search.active
  }
}

export default connect(mapStateToProps, null)(BackToColorWall)
