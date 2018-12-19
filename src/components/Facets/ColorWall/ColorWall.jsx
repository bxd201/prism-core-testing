// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { kebabCase } from 'lodash'

import { loadColors, makeActiveColor } from '../../../actions/loadColors'
import { add } from '../../../actions/live-palette'
import type { ColorFamilyPayload, ColorMap, Color } from '../../../shared/types/Colors'

// import StandardColorWall from './StandardColorWall'
import SherwinColorWall from './SherwinColorWall'

import './ColorWall.scss'

type Props = {
  colors: ColorFamilyPayload,
  brights: ColorFamilyPayload,
  colorMap: ColorMap,
  colorWallActive: Color,
  loadColors: Function,
  addToLivePalette: Function,
  makeActiveColor: Function,
  loading: boolean,
  family: string,
  defaultFamily: string,
  families?: string[]
}

class ColorWall extends PureComponent<Props> {
  constructor (props) {
    super(props)

    this.navigateToNewFamily = this.navigateToNewFamily.bind(this)
  }

  componentDidMount () {
    this.props.loadColors()
  }

  navigateToNewFamily = function navigateToNewFamily (family) {
    window.location.hash = `/active/color-wall/${kebabCase(family)}`
  }

  render () {
    const { colors, families, family, defaultFamily, brights, colorMap, makeActiveColor, colorWallActive, loading, addToLivePalette } = this.props

    let colorFamily = family || defaultFamily

    if (loading) {
      return <p>Loading...</p>
    }

    // not sure if this is a great way to test if this is a sherwin colorset, but non-sw colors should come in as a flat array
    // but, sherwin colors will come in broken out by color families. If so, we'll just return the sherwin color family component
    // for now until we determine a better solution for handling that.
    // const isSherwinColorWall = isPlainObject(colors)
    if (families) {
      return (
        <React.Fragment>
          <div className='sw-colorwall'>
            <SherwinColorWall
              onActivateColor={makeActiveColor}
              onSelectFamily={this.navigateToNewFamily}
              family={colorFamily}
              families={families}
              colors={colors}
              brights={brights}
              colorMap={colorMap}
              activeColor={colorWallActive}
              addToLivePalette={addToLivePalette}
            />
          </div>
        </React.Fragment>
      )
    }

    return null

    // TODO: Add standard (non-chunked) color functionality back into ColorWall
    // return (
    //   <div className='standard-colorwall'>
    //     <StandardColorWall family={'all'} colors={colors} />
    //   </div>
    // )
  }
}

const mapStateToProps = (state, props) => {
  return {
    colorMap: state.colors.items.colorMap,
    colors: state.colors.items.colors,
    brights: state.colors.items.brights,
    colorWallActive: state.colors.colorWallActive,
    families: state.colors.families,
    family: state.colors.family,
    defaultFamily: state.colors.defaultFamily,
    loading: state.colors.status.loading
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadColors: (options: any) => {
      dispatch(loadColors(options))
    },
    makeActiveColor: (color: Color) => {
      dispatch(makeActiveColor(color))
    },
    addToLivePalette: (color: Color) => {
      dispatch(add(color))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ColorWall)
