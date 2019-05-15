// @flow
import React, { PureComponent } from 'react'
import { Route, Redirect, withRouter, Switch } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import includes from 'lodash/includes'

import ColorWallRouteComponent from '../ColorWall/ColorWallRouteComponent'
import ColorDetails from '../ColorDetails/ColorDetails'
import ColorDataWrapper from '../../../helpers/ColorDataWrapper'
import BackToColorWall from './BackToColorWall'

import { varValues } from 'variables'

import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'

import './ColorListingPage.scss'

const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`
const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`

// this is very vague because react-router doesn't have the ability to match /section/x/family/y/color/z and /section/x/color/z with the same route
// we're handling the URL-parsing logic manually in ColorWallComponent below
const colorWallUrlPattern = `${colorWallBaseUrl}(/.*)?`

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..
export const RootRedirect = () => {
  return <Redirect to={colorWallBaseUrl} />
}

// since the CDP component won't have any color information if we go to it directly, we need to wrap it
// in the ColorDataWrapper HOC to ensure it has color data prior to rendering it.
const ColorDetailsWithData = ColorDataWrapper(ColorDetails)
export const ColorDetailsComponent = (props: any) => {
  // need a wrapping element that isn't a Fragment in order to get the transition classes applied to the group
  return (
    <div>
      <BackToColorWall />
      <ColorDetailsWithData {...props} />
    </div>
  )
}

export const ColorWallComponent = (props: any) => {
  return <ColorWallRouteComponent displayDetailsLink displayInfoButton={false} displayAddButton={false} {...props} />
}

type ColorListingPageProps = {
  location: Object
}

type ColorListingPageState = {
  prevPathname?: string,
  toDetails: boolean,
  toWall: boolean
}

export class ColorListingPage extends PureComponent<ColorListingPageProps, ColorListingPageState> {
  state: ColorListingPageState = {
    prevPathname: void (0),
    toDetails: false,
    toWall: false
  }

  render () {
    const { location } = this.props
    const { toWall, toDetails } = this.state
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
      <React.Fragment>
        {/* Keeping this Route outside of TransitionGroup in order to avoid introducing MaximumUpdateDepth errors upon initial redirect */}
        <Switch location={location}>
          <Route path='/' exact component={RootRedirect} />
        </Switch>
        <TransitionGroup className='color-wall-transitioner'>
          <CSSTransition key={key}
            classNames={transitionClassNames}
            timeout={varValues.colorWall.transitionTime * 1.2}>
            <Switch location={location}>
              <Route path={colorWallUrlPattern} component={ColorWallComponent} />
              <Route path={`${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact component={ColorDetailsComponent} />
            </Switch>
          </CSSTransition>
        </TransitionGroup>
      </React.Fragment>
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
        newProps = Object.assign({}, newProps, {
          toDetails: true,
          toWall: false
        })
        // transitionClassNames = ''
      } else if (includes(newPropsPathname, colorWallBaseUrl) && includes(prevPathname, colorDetailsBaseUrl)) {
        // going TO color wall FROM color details; slide in from left
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
