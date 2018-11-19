// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { filterByFamily } from '../../../actions/loadColors'

import ColorDataWrapper from '../../../helpers/ColorDataWrapper'

import ColorWallSwatchList from './ColorWallSwatchList'
import ColorWallButton from './ColorWallButton'

type Props = {
  colors: Object,
  brights: Object,
  match: Object,
  filterByFamily: Function,
  family: string
}

class SherwinColorWall extends PureComponent<Props> {
  static COLOR_FAMILIES = [
    'All',
    'Red',
    'Orange',
    'Yellow',
    'Green',
    'Blue',
    'Purple',
    'Neutral',
    'White & Pastel'
  ]

  previewColor = void (0)
  cwRef = void (0)
  allColors = void (0)

  constructor (props) {
    super(props)

    this.colorFamily = this.colorFamily.bind(this)
  }

  colorFamily () {
    const { match: { params }, family, colors, brights } = this.props

    switch (family) {
      case 'All':
        return (
          <React.Fragment>
            {SherwinColorWall.COLOR_FAMILIES.map((colorFamily, colorFamilyIndex) => {
              if (colorFamily === 'All') {
                return null
              }
              return (
                <div key={colorFamily} style={{ width: 'calc(100%/8)' }}>
                  { brights[colorFamily][0] && (
                    // TODO: Of course, we need to fix keys here
                    <div key={`${colorFamily}${colorFamilyIndex}${colorFamilyIndex}`}>
                      <ColorWallSwatchList key={`${colorFamily}${colorFamilyIndex}`} colors={brights[colorFamily][0]} active={params.colorNumber} />
                    </div>
                  )}
                  <hr />
                  {this.props.colors[colorFamily].map((colorChunk, index) => {
                    return (
                      <div key={`${colorFamily}${index}`}>
                        <ColorWallSwatchList key={`${colorFamily}`} colors={colorChunk} active={params.colorNumber} />
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </React.Fragment>
        )

      default:
        return (
          <div key={family} style={{ width: 'calc(100%/8)' }}>
            {colors[family].map((colorChunk, index) => {
              return (
                <React.Fragment>
                  { brights[family][0] && (
                    // TODO: Of course, we need to fix keys here
                    <div key={`${family}${index}${index}`}>
                      <ColorWallSwatchList key={`${family}${index}`} colors={brights[family][0]} active={params.colorNumber} />
                    </div>
                  )}
                  <hr />
                  <div key={`${family}${index}`}>
                    <ColorWallSwatchList key={`${family}`} colors={colorChunk} active={params.colorNumber} />
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        )
    }
  }

  render () {
    const { filterByFamily, family } = this.props

    const ColorWallButtons = SherwinColorWall.COLOR_FAMILIES.map(key => {
      return <ColorWallButton key={key} family={key} selectFamily={filterByFamily} current={family} routeCurrent={family} />
    })

    return (
      <React.Fragment>
        <div className='color-wall-buttons'>
          {ColorWallButtons}
        </div>
        <div style={{ display: 'flex' }}>
          { this.colorFamily() }
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

export default ColorDataWrapper(withRouter(connect(null, mapDispatchToProps)(SherwinColorWall)))
