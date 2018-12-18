// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { filterByFamily } from '../../../actions/loadColors'

import ColorWall from './ColorWall'

type Props = {
  match: Object,
  filterByFamily: Function,
  family?: string
}

class ColorWallLocationBuffer extends Component<Props> {
  render () {
    return <ColorWall />
  }

  componentDidMount () {
    const { match: { params: { family } }, family: reduxFamily } = this.props

    // if our current navigational family does not match what redux is providing for family...
    if (family !== reduxFamily) {
      // ... filter by this new nav family in redux
      this.props.filterByFamily(family)
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const { match: { params: { family } } } = this.props
    const { match: { params: { family: nextFamily } } } = nextProps

    // if nav family's next state does not match the existing state...
    if (nextFamily !== family) {
      // ... tell redux to filter by this new family
      this.props.filterByFamily(nextFamily)
    }

    // after initial render, NEVER re-render this component
    return false
  }
}

const mapStateToProps = (state, props) => {
  return {
    family: state.colors.family
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    filterByFamily: (family) => {
      dispatch(filterByFamily(family))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ColorWallLocationBuffer)
