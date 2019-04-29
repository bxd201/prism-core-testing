// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import isUndefined from 'lodash/isUndefined'

import { filterByFamily, filterBySection, makeActiveColorById, resetActiveColor } from '../../../store/actions/loadColors'
import { compareKebabs } from '../../../shared/helpers/StringUtils'
import type { Color } from '../../../shared/types/Colors'
import { ROUTE_PARAM_NAMES } from 'constants/globals'

import ColorWall from './ColorWall'
import ColorWallContext from './ColorWallContext'

type StateProps = {
  family?: string,
  section?: string,
  color?: Color,
  displayDetailsLink?: boolean,
  displayInfoButton?: boolean,
  displayAddButton?: boolean
}

type DispatchProps = {
  filterByFamily: Function,
  filterBySection: Function,
  makeActiveColorById: Function
}

type OwnProps = {
  match: any
}

type Props = StateProps & DispatchProps & OwnProps

class ColorWallLocationBuffer extends Component<Props> {
  render () {
    // scaffolding out some ColorWall specific provider values that can be overwritten as need be by any
    // component using the <ColorWallRouteComponent /> via props
    const { displayAddButton, displayDetailsLink, displayInfoButton } = this.props
    const cwProviderValues = {
      displayDetailsLink: (!isUndefined(displayDetailsLink)) ? displayDetailsLink : false,
      displayInfoButton: (!isUndefined(displayInfoButton)) ? displayInfoButton : true,
      displayAddButton: (!isUndefined(displayAddButton)) ? displayAddButton : true
    }

    return (
      <ColorWallContext.Provider value={cwProviderValues}>
        <ColorWall />
      </ColorWallContext.Provider>
    )
  }

  componentDidMount () {
    const { match: { params }, section: reduxSection, family: reduxFamily, color: reduxColor } = this.props
    const section = params[ROUTE_PARAM_NAMES.SECTION]
    const family = params[ROUTE_PARAM_NAMES.FAMILY]
    const colorId = params[ROUTE_PARAM_NAMES.COLOR_ID]

    if (!compareKebabs(section, reduxSection)) {
      this.props.filterBySection(section)
    }

    // if our current navigational family does not match what redux is providing for family...
    if (!compareKebabs(family, reduxFamily)) {
      // ... filter by this new nav family in redux
      this.props.filterByFamily(family)
    }

    if (!compareKebabs(colorId, reduxColor && reduxColor.id)) {
      this.props.makeActiveColorById(colorId)
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const { match: { params } } = this.props
    const { match: { params: nextParams } } = nextProps

    const section = params[ROUTE_PARAM_NAMES.SECTION]
    const family = params[ROUTE_PARAM_NAMES.FAMILY]
    const colorId = params[ROUTE_PARAM_NAMES.COLOR_ID]

    const nextSection = nextParams[ROUTE_PARAM_NAMES.SECTION]
    const nextFamily = nextParams[ROUTE_PARAM_NAMES.FAMILY]
    const nextColorId = nextParams[ROUTE_PARAM_NAMES.COLOR_ID]

    if (nextSection !== section) {
      this.props.filterBySection(nextSection)
    }

    // if nav family's next state does not match the existing state...
    if (nextFamily !== family) {
      // ... tell redux to filter by this new family
      this.props.filterByFamily(nextFamily)
    }

    if (nextColorId !== colorId) {
      this.props.makeActiveColorById(nextColorId)
    }

    // after initial render, NEVER re-render this component
    return false
  }
}

const mapStateToProps = (state, props) => {
  return {
    color: state.colors.colorWallActive,
    family: state.colors.family,
    section: state.colors.section
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    filterByFamily: (family) => {
      dispatch(filterByFamily(family))
    },
    filterBySection: (section: string) => {
      dispatch(filterBySection(section))
    },
    makeActiveColorById: (id: string | void) => {
      if (id) {
        dispatch(makeActiveColorById(id))
      } else {
        dispatch(resetActiveColor())
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ColorWallLocationBuffer)
