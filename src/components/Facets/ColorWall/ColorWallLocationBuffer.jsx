// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import isUndefined from 'lodash/isUndefined'

import { filterByFamily, filterBySection, makeActiveColorById, resetActiveColor } from '../../../store/actions/loadColors'
import { updateSearchQuery, toggleSearchMode } from '../../../store/actions/loadSearchResults'
import { compareKebabs } from '../../../shared/helpers/StringUtils'
import type { Color } from '../../../shared/types/Colors'
import type { Configuration } from '../../../shared/types/Configuration'
import { ROUTE_PARAM_NAMES } from 'constants/globals'

import ColorWall from './ColorWall'
import ColorWallContext from './ColorWallContext'
import withConfigurationContext from '../../../contexts/ConfigurationContext/WithConfigurationContext'

type StateProps = {
  family?: string,
  section?: string,
  color?: Color,
  query?: String,
  displayDetailsLink?: boolean,
  displayInfoButton?: boolean,
  displayAddButton?: boolean,
  config: Configuration
}

type DispatchProps = {
  filterByFamily: Function,
  filterBySection: Function,
  makeActiveColorById: Function,
  updateSearchQuery: Function,
  toggleSearchActive: Function
}

type OwnProps = {
  match: {
    [key: string]: any
  }
}

type Props = StateProps & DispatchProps & OwnProps

class ColorWallLocationBuffer extends Component<Props> {
  render () {
    // scaffolding out some ColorWall specific provider values that can be overwritten as need be by any
    // component using the <ColorWallRouteComponent /> via props
    const { displayAddButton, displayDetailsLink, displayInfoButton, config } = this.props
    const cwProviderValues = {
      displayDetailsLink: (!isUndefined(displayDetailsLink)) ? displayDetailsLink : false,
      displayInfoButton: (!isUndefined(displayInfoButton)) ? displayInfoButton : true,
      displayAddButton: (!isUndefined(displayAddButton)) ? displayAddButton : true,
      // TODO: Future scope, the below shouldn't be driven by a data attribute, but should come in from the config as a eval capable string that
      // a utility method perhaps can handle per brand.
      colorDetailPageRoot: (!isUndefined(config.colorDetailPageRoot)) ? config.colorDetailPageRoot : null
    }

    return (
      <ColorWallContext.Provider value={cwProviderValues}>
        <ColorWall />
      </ColorWallContext.Provider>
    )
  }

  componentDidMount () {
    const { match: { params }, section: reduxSection, family: reduxFamily, color: reduxColor, query: reduxQuery } = this.props
    const section = params[ROUTE_PARAM_NAMES.SECTION]
    const family = params[ROUTE_PARAM_NAMES.FAMILY]
    const colorId = params[ROUTE_PARAM_NAMES.COLOR_ID]
    const query = params[ROUTE_PARAM_NAMES.SEARCH]

    if (!compareKebabs(query, reduxQuery)) {
      this.props.updateSearchQuery(query)
    }

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
    const search = params[ROUTE_PARAM_NAMES.SEARCH]

    const nextSection = nextParams[ROUTE_PARAM_NAMES.SECTION]
    const nextFamily = nextParams[ROUTE_PARAM_NAMES.FAMILY]
    const nextColorId = nextParams[ROUTE_PARAM_NAMES.COLOR_ID]
    const nextSearch = nextParams[ROUTE_PARAM_NAMES.SEARCH]

    if (nextSearch !== search) {
      // if our intercepted new search param has a value...
      if (nextSearch) {
        // ... update it w/in Redux
        this.props.updateSearchQuery(nextSearch)
      } else {
        // ... otherwise, we can assume the search term has been REMOVED, therefore we need to toggle search to false w/in redux
        this.props.toggleSearchActive(false)
      }
    }

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
    section: state.colors.section,
    query: state.colors.search.query
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
    },
    updateSearchQuery: (query: string) => {
      dispatch(updateSearchQuery(query))
    },
    toggleSearchActive: (on?: boolean) => {
      dispatch(toggleSearchMode(!!on))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withConfigurationContext(ColorWallLocationBuffer))
