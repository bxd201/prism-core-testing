// @flow
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { generateColorWallPageUrl, fullColorName } from '../../../shared/helpers/ColorUtils'
import type { Color } from '../../../shared/types/Colors'

type StateProps = {
  color?: Color,
  family?: string,
  section?: string
}

type OwnProps = {}

type Props = StateProps & OwnProps

class BackToColorWall extends PureComponent<Props> {
  render () {
    const { section, family, color } = this.props

    // this will degrade gracefully if section and/or family and or color do(es) not exist in redux down to the root color wall URL
    const colorWallUrl = color
      ? generateColorWallPageUrl(section, family, color.id, fullColorName(color.brandKey, color.colorNumber, color.name))
      : generateColorWallPageUrl(section, family)

    return (
      <div className='color-wall-mode-btns'>
        <div className='color-wall-mode-btns__col'>
          <div className='color-wall-mode-btns__cell'>
            <FormattedMessage id='BACK_TO_COLOR_WALL'>
              {(msg: string) => (
                <Link to={colorWallUrl} className='color-wall-mode-btns__btn'>
                  <FontAwesomeIcon icon={['fal', 'th-large']} pull='left' fixedWidth />
                  {msg}
                </Link>
              )}
            </FormattedMessage>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    family: state.colors.family.family,
    section: state.colors.family.section,
    color: state.colors.colorWallActive
  }
}

export default connect(mapStateToProps, null)(BackToColorWall)
