// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import kebabCase from 'lodash/kebabCase'

const DetailsLink = (props: Object) => {
  const { config, detailsLink, color, ...other } = props

  // TODO: Future scope, the below shouldn't be driven by a data attribute, but should come in from the config as a eval capable string that
  // a utility method perhaps can handle per brand.
  if (config.colorDetailPageRoot) {
    return (
      <a href={`${config.colorDetailPageRoot}/${color.brandKey}${color.colorNumber}-${kebabCase(color.name)}`} {...other}>
        <FormattedMessage id='VIEW_DETAILS' />
      </a>
    )
  }

  if (config.displayDetailsLink && detailsLink) {
    return (
      <Link to={detailsLink} {...other}>
        <FormattedMessage id='VIEW_DETAILS' />
      </Link>
    )
  }

  return null
}

export default DetailsLink
