// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import { filterByFamily } from '../../../actions/loadColors'

import ColorDataWrapper from '../../../helpers/ColorDataWrapper'

import ColorWallSwatchList from './ColorWallSwatchList'
import ColorWallButton from './ColorWallButton'

import './ColorWall.scss'

type Props = {
  colors: Object,
  match: Object,
  filterByFamily: Function,
  family: string,
  hideColorFamilySelector: string
}

class ColorWall extends PureComponent<Props> {
  previewColor = void (0)
  cwRef = void (0)
  allColors = void (0)

  colorFamily (family) {
    return this.props.colors[family]
  }

  get colorFamilies () {
    return this.allColors || (this.allColors = _.flatten(Object.keys(this.props.colors).map(family => {
      return this.colorFamily(family)
    })))
  }

  render () {
    const { colors, match: { params }, filterByFamily, family, hideColorFamilySelector } = this.props
    const colorFamilyKeys = ['All', ...Object.keys(colors)]

    const ColorWallButtons = colorFamilyKeys.map(key => {
      return <ColorWallButton key={key} family={key} selectFamily={filterByFamily} current={family} routeCurrent={params.family} />
    })

    const ColorWallColors = (family === 'All') ? this.colorFamilies : this.colorFamily(family)

    return (
      <React.Fragment>
        <div className='color-wall-buttons'>
          {/* TODO: Temporary string comparison logic until we have the configurations coming down as a service instead of through props. */}
          {(hideColorFamilySelector !== 'true') && ColorWallButtons}
        </div>
        <div className='color-wall-swatches' ref={this.cwRef}>
          <ColorWallSwatchList colors={ColorWallColors} active={params.colorNumber} />
        </div>
      </React.Fragment>
    )
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    filterByFamily: (family) => {
      dispatch(filterByFamily(family))
    }
  }
}

export default ColorDataWrapper(withRouter(connect(null, mapDispatchToProps)(ColorWall)))
