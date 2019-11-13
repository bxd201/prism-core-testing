// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { Link } from 'react-router-dom'

type Props = {
  config: Object,
  detailsLink?: string
}

const InfoButton = (props: Props) => {
  const { config, detailsLink, ...other } = props
  if (config.displayInfoButton && detailsLink) {
    return (
      <Link to={detailsLink} {...other}>
        <FontAwesomeIcon icon='info' size='1x' />
      </Link>
    )
  }
  return null
}

export default React.memo<Props>(InfoButton)
