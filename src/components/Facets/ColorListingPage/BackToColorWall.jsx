// @flow
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { generateColorWallPageUrl } from '../../../shared/helpers/ColorUtils'

type StateProps = {
  family?: string,
  section?: string
}

type OwnProps = {}

type Props = StateProps & OwnProps

// TODO: Needs styling
class BackToColorWall extends PureComponent<Props> {
  render () {
    const { section, family } = this.props

    // this will degrade gracefully if section and/or family do(es) not exist in redux down to the root color wall URL
    const colorWallUrl = generateColorWallPageUrl(section, family)

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
    section: state.colors.family.section
  }
}

export default connect(mapStateToProps, null)(BackToColorWall)
