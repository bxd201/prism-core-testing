// @flow
import React from 'react'

import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'
import { urlWorker } from '../../../shared/helpers/URLUtils'
import ColorWallLocationBuffer from './ColorWallLocationBuffer'

/**
 * Generic Color Wall routing component to handle routes within the Color Wall in one place instead of putting this
 * function in various other facet components.
 * @param {*} props
 */
const ColorWallRouteComponent = (props: Object) => {
  const { match, ...other } = props
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

  const searchParams = new URLSearchParams(props.location.search)
  if (searchParams.get('q')) props.history.push('/active/color-wall/search/' + searchParams.get('q'))

  return <ColorWallLocationBuffer match={newMatch} {...other} />
}

export default ColorWallRouteComponent
