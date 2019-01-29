/* eslint-disable */
// @flow
import React, { PureComponent } from 'react'
import { Route, Redirect, withRouter, Switch } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { includes } from 'lodash'

import ColorWallLocationBuffer from '../ColorWall/ColorWallLocationBuffer'
import ColorDetails from '../ColorDetails/ColorDetails'
import ColorDataWrapper from '../../../helpers/ColorDataWrapper'
import BackToColorWall from './BackToColorWall'
import { varValues } from 'variables'
import { DEFAULT_CONFIGURATIONS, ConfigurationContextProvider } from '../../../contexts/ConfigurationContext'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'

import './ColorListingPage.scss'

const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`
const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`

// this is very vague because react-router doesn't have the ability to match /section/x/family/y/color/z and /section/x/color/z with the same route
// we're handling the URL-parsing logic manually in ColorWallComponent below
const colorWallUrlPattern = `${colorWallBaseUrl}(/.*)?`

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..
const RootRedirect = () => {
  return <Redirect to={colorWallBaseUrl} />
}

// customizing the ColorWall config with ColorListingPage's specific settings
const ColorWallConfigurations = {
  ColorWall: {
    displayAddButton: false,
    displayInfoButton: false,
    displayViewDetails: true
  }
}
const Configurations = Object.assign({}, DEFAULT_CONFIGURATIONS, ColorWallConfigurations)

// since the CDP component won't have any color information if we go to it directly, we need to wrap it
// in the ColorDataWrapper HOC to ensure it has color data prior to rendering it.
const ColorDetailsWithData = ColorDataWrapper(ColorDetails)
const ColorDetailsComponent = (props) => {
  // need a wrapping element that isn't a Fragment in order to get the transition classes applied to the group
  return (
    <div>
      <BackToColorWall />
      <ColorDetailsWithData {...props} />
    </div>
  )
}

// overriding the default configuration with updated CW ones to hide the info and add buttons on the swatch
// also performing manual route matching here
const ColorWallComponent = (props: Object) => {
  const { match, ...other } = props
  const captured = match.params[0]

  // we may be manually overriding the match prop if we've matched ANYTHING after the base color wall URL, so let's clone it
  let newMatch = Object.assign({}, match)

  // if we have a match for our first param (assuming the match pattern continues to be .*)
  if (captured) {
    // ... then define section, family, and color props to populate a new params object with; the old one is useless to us
    const section = new RegExp(`/${ROUTE_PARAMS.SECTION}/([^/]*)`).exec(captured)
    const family = new RegExp(`/${ROUTE_PARAMS.FAMILY}/([^/]*)`).exec(captured)
    const color = new RegExp(`/${ROUTE_PARAMS.COLOR}/([^/]*)/([^/]*)`).exec(captured)

    Object.assign(newMatch, {
      params: {
        [ROUTE_PARAM_NAMES.SECTION]: section ? section[1] : void (0),
        [ROUTE_PARAM_NAMES.FAMILY]: family ? family[1] : void (0),
        [ROUTE_PARAM_NAMES.COLOR_ID]: color ? color[1] : void (0),
        [ROUTE_PARAM_NAMES.COLOR_SEO]: color ? color[2] : void (0)
      }
    })
  }

  return (
    <ConfigurationContextProvider value={Configurations}>
      <ColorWallLocationBuffer match={newMatch} {...other} />
    </ConfigurationContextProvider>
  )
}

type ColorListingPageProps = {
  location: Object
}

type ColorListingPageState = {
  prevPathname?: string,
  toDetails: boolean,
  toWall: boolean
}

class ColorListingPage extends PureComponent<ColorListingPageProps, ColorListingPageState> {
  state: ColorListingPageState = {
    prevPathname: void (0),
    toDetails: false,
    toWall: false
  }

  render () {
    const { location } = this.props
    const { prevPathname, toWall, toDetails } = this.state
    const pathname = location.pathname
    let transitionClassNames = 'cdp-slide'

    if (toWall) {
      transitionClassNames = 'cdp-slide-to-wall cdp-slide'
    } else if (toDetails) {
      transitionClassNames = 'cdp-slide-to-details cdp-slide'
    }

    // grabbing the first half of the path to use as a key so we only actually trigger
    // a CSS transition when /active/color-wall/ changes to /active/color/ and vice-versa
    const key = location.pathname.split('/').slice(2, 3).join()

    return (
      <TransitionGroup className='color-wall-transitioner'>
        <CSSTransition key={key}
          classNames={transitionClassNames}
          timeout={varValues.colorWall.transitionTime * 1.2}>
          <Switch location={location}>
            <Route path='/' exact component={RootRedirect} />
            <Route path={colorWallUrlPattern} component={ColorWallComponent} />
            <Route path={`${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact render={ColorDetailsComponent} />
          </Switch>
        </CSSTransition>
      </TransitionGroup>
    )
  }

  static getDerivedStateFromProps (props: ColorListingPageProps, state: ColorListingPageState) {
    const { prevPathname } = state
    const { location: { pathname: newPropsPathname } } = props

    if (newPropsPathname !== prevPathname) {
      let newProps = {
        prevPathname: newPropsPathname
      }

      if (includes(newPropsPathname, colorDetailsBaseUrl) && includes(prevPathname, colorWallBaseUrl)) {
        // going TO color details FROM color wall; slide in from right
        // transitionClassNames = 'zong-slide-in'
        // thingy = 'going TO color details'
        newProps = Object.assign({}, newProps, {
          toDetails: true,
          toWall: false
        })
        // transitionClassNames = ''
      } else if (includes(newPropsPathname, colorWallBaseUrl) && includes(prevPathname, colorDetailsBaseUrl)) {
        // going TO color wall FROM color details; slide in from left
        // transitionClassNames = 'zong-slide-out'
        // thingy = 'going TO color wall'
        newProps = Object.assign({}, newProps, {
          toDetails: false,
          toWall: true
        })
      }

      return newProps

    }

    return null
  }
}

export default withRouter(ColorListingPage)
