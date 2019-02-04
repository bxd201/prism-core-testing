// @flow
import React from 'react'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'

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
    const section = new RegExp(`/${ROUTE_PARAMS.SECTION}/([^/]*)`).exec(captured)
    const family = new RegExp(`/${ROUTE_PARAMS.FAMILY}/([^/]*)`).exec(captured)
    const color = new RegExp(`/${ROUTE_PARAMS.COLOR}/([^/]*)/([^/]*)`).exec(captured)

    newMatch.params = {
      [ROUTE_PARAM_NAMES.SECTION]: section ? section[1] : void (0),
      [ROUTE_PARAM_NAMES.FAMILY]: family ? family[1] : void (0),
      [ROUTE_PARAM_NAMES.COLOR_ID]: color ? color[1] : void (0),
      [ROUTE_PARAM_NAMES.COLOR_SEO]: color ? color[2] : void (0)
    }
  }

  return <ColorWallLocationBuffer match={newMatch} {...other} />
}

export default ColorWallRouteComponent
