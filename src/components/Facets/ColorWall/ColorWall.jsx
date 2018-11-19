// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { isPlainObject } from 'lodash'

import ColorDataWrapper from '../../../helpers/ColorDataWrapper'

import StandardColorWall from './StandardColorWall'
import SherwinColorWall from './SherwinColorWall'

import { type Color } from '../../../shared/types/Colors'

import './ColorWall.scss'

type Props = {
  colors: Object
}

class ColorWall extends PureComponent<Props> {
  render () {
    const { colors } = this.props

    // not sure if this is a great way to test if this is a sherwin colorset, but non-sw colors should come in as a flat array
    // but, sherwin colors will come in broken out by color families. If so, we'll just return the sherwin color family component
    // for now until we determine a better solution for handling that.
    const isSherwinColorWall = isPlainObject(colors)
    if (isSherwinColorWall) {
      return (
        <div className='sw-colorwall'>
          <SherwinColorWall />
        </div>
      )
    }

    return (
      <div className='standard-colorwall'>
        <StandardColorWall colors={colors} />
      </div>
    )
  }
}

export default ColorDataWrapper(connect(null, null)(ColorWall))
