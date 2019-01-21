import React from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

// TODO: Needs styling
const BackToColorWall = (props) => {
  return (
    <React.Fragment>
      <Link to='/active/color-wall'><FormattedMessage id='BACK_TO_COLOR_WALL' /></Link>
    </React.Fragment>
  )
}

export default BackToColorWall
