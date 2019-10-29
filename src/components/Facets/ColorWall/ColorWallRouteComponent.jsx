// @flow
import React from 'react'
// $FlowIgnore -- flow can't resolve this
import 'url-search-params-polyfill' // TODO: remove when dropping IE11 support

import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'

import { urlWorker } from '../../../shared/helpers/URLUtils'
import WithConfigurationContext from '../../../contexts/ConfigurationContext/WithConfigurationContext'

import ColorWallLocationBuffer from './ColorWallLocationBuffer'
import { type Configuration } from '../../../shared/types/Configuration'
import { type RouterHistory } from 'react-router-dom'

/**
 * Generic Color Wall routing component to handle routes within the Color Wall in one place instead of putting this
 * function in various other facet components.
 * @param {*} props
 */

type Props = {
  displayDetailsLink?: boolean,
  displayInfoLink?: boolean,
  displayAddLink?: boolean,
  config: Configuration,
  location: Location,
  history: RouterHistory,
  match: {
    params: Object
  }
}

const ColorWallRouteComponent = (props: Props) => {
  const { match, history, config, location, ...other } = props
  const captured = match.params[0]

  // we may be manually overriding the match prop if we've matched ANYTHING after the base color wall URL, so let's clone it
  let newMatch = { ...match }

  // if we have a match for our first param (assuming the match pattern continues to be .*)
  if (captured) {
    // ... then define section, family, and color props to populate a new params object with; the old one is useless to us
    newMatch.params = {
      [ROUTE_PARAM_NAMES.SECTION]: urlWorker.get(ROUTE_PARAMS.SECTION).from(captured)[ROUTE_PARAM_NAMES.SECTION],
      [ROUTE_PARAM_NAMES.FAMILY]: urlWorker.get(ROUTE_PARAMS.FAMILY).from(captured)[ROUTE_PARAM_NAMES.FAMILY],
      [ROUTE_PARAM_NAMES.COLOR_ID]: urlWorker.get(ROUTE_PARAMS.COLOR).from(captured)[ROUTE_PARAM_NAMES.COLOR_ID],
      [ROUTE_PARAM_NAMES.COLOR_SEO]: urlWorker.get(ROUTE_PARAMS.COLOR).from(captured)[ROUTE_PARAM_NAMES.COLOR_SEO],
      [ROUTE_PARAM_NAMES.SEARCH]: urlWorker.get(ROUTE_PARAMS.SEARCH).from(captured)[ROUTE_PARAM_NAMES.SEARCH]
    }
  }

  // check if there is a search parameter in the URL, if so, transform into our existing search url format
  const searchParams = new URLSearchParams(window.location.search)
  const paramName = config.searchQueryParameterName
  const searchValue = searchParams.has(paramName) && searchParams.get(paramName)
  if (location.pathname.indexOf(ROUTE_PARAMS.SEARCH) === -1 && searchValue) {
    history.push(`/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}/${ROUTE_PARAMS.SEARCH}/${searchValue}`)
    searchParams.delete(paramName)
  }

  return <ColorWallLocationBuffer match={newMatch} {...other} />
}

export default WithConfigurationContext(React.memo<Props>(ColorWallRouteComponent))
