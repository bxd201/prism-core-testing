// @flow
import React, { PureComponent, Fragment } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { flatten, filter } from 'lodash'

import ColorViewer from './ColorViewer/ColorViewer'
import ColorStrip from './ColorStrip/ColorStrip'
import CoordinatingColors from './CoordinatingColors/CoordinatingColors'
import SimilarColors from './SimilarColors/SimilarColors'
import SceneManager from '../SceneManager/SceneManager'

class ColorDetails extends PureComponent<Props> {
  render () {
    const { match: { params }, colors } = this.props

    // grab the color by color number from the URL
    const activeColor = this.getColorByColorNumber(params.colorNumber)

    return (
      <Fragment>
        <h3>Color Details Pane</h3>
        <ColorViewer color={activeColor} />
        <ColorStrip key={activeColor.id} colors={colors} color={activeColor} />
        <CoordinatingColors colors={colors} color={activeColor} />
        <SimilarColors colors={colors} color={activeColor} />
        <SceneManager />
      </Fragment>
    )
  }

  getColorByColorNumber (colorNumber) {
    const { colors } = this.props
    const color = filter(colors, color => color.colorNumber === colorNumber)[0]

    if (!color) {
      return null
    }

    return color
  }
}

const mapStateToProps = (state, props) => {
  const { colors } = state

  // TODO: WhooWhee, don't keep this. Need this here to be able to easily grab a color byId.
  const colours = flatten(Object.keys(colors.items).map(fam => colors.items[fam]))

  return {
    colors: colours
  }
}

export default withRouter(connect(mapStateToProps, null)(ColorDetails))
