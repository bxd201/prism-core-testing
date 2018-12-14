// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { flatten, filter } from 'lodash'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { FormattedMessage } from 'react-intl'

import ColorInfo from './ColorInfo/ColorInfo'
import ColorViewer from './ColorViewer/ColorViewer'
import ColorStrip from './ColorStrip/ColorStrip'
import CoordinatingColors from './CoordinatingColors/CoordinatingColors'
import SimilarColors from './SimilarColors/SimilarColors'
import SceneManager from '../../SceneManager/SceneManager'

import './ColorDetails.scss'

class ColorDetails extends PureComponent<Props> {
  static baseClass = 'color-info'

  state = {
    sceneIsDisplayed: true,
    chipIsMaximized: false
  }

  constructor (props) {
    super(props)

    this.toggleSceneDisplay = this.toggleSceneDisplay.bind(this)
    this.toggleChipMaximized = this.toggleChipMaximized.bind(this)
  }

  render () {
    const { match: { params }, colors } = this.props
    const { sceneIsDisplayed, chipIsMaximized } = this.state

    // grab the color by color number from the URL
    const activeColor = this.getColorByColorNumber(params.colorNumber)

    // perform some css class logic & scaffolding instead of within the DOM itself
    let SWATCH_CLASSES = [
      `${ColorDetails.baseClass}__max-chip`
    ]
    let DISPLAY_TOGGLES_WRAPPER = [
      `${ColorDetails.baseClass}__display-toggles-wrapper`
    ]
    if (chipIsMaximized) {
      SWATCH_CLASSES.push(`${ColorDetails.baseClass}__max-chip--maximized`)
      DISPLAY_TOGGLES_WRAPPER.push(`${ColorDetails.baseClass}__display-toggles-wrapper--chip--maxed`)
    }

    return (
      <div className='color-detail-view'>
        <div className={SWATCH_CLASSES.join(' ')} style={{ backgroundColor: activeColor.hex }} />
        <div className={DISPLAY_TOGGLES_WRAPPER.join(' ')}>
          {/* TODO: Temporary buttons to toggle scene painter display/maximizing - copy values should be coming from the current state, not be static */}
          <button className={`${ColorDetails.baseClass}__max-chip-toggle color-info__max-chip-toggle`} onClick={this.toggleChipMaximized}>
            <div className={`${ColorDetails.baseClass}__scene-toggle-copy`}>Toggle Chip Maximize</div>
          </button>
          <button className={`${ColorDetails.baseClass}__scene-display-toggle`} onClick={this.toggleSceneDisplay}>
            <div className={`${ColorDetails.baseClass}__scene-toggle-copy`}>Toggle Scene Painter Display</div>
          </button>
        </div>
        <div className={`color-detail__scene-wrapper ${sceneIsDisplayed ? ` color-detail__scene-wrapper--displayed` : ''}`}>
          <SceneManager />
        </div>
        <div className='color-detail__info-wrapper'>
          <div className={`${ColorDetails.baseClass}__main-info`} style={{ backgroundColor: activeColor.hex }}>
            <ColorViewer color={activeColor} />
            <ColorStrip key={activeColor.id} colors={colors} color={activeColor} />
          </div>
          <div className={`${ColorDetails.baseClass}__additional-info`}>
            <Tabs>
              <TabList className={`${ColorDetails.baseClass}__tab-list`} style={{ backgroundColor: activeColor.hex }}>
                <Tab className={`${ColorDetails.baseClass}__tab`}>
                  <div className={`${ColorDetails.baseClass}__tab-copy`}><FormattedMessage id='COORDINATING_COLORS' /></div>
                </Tab>
                <Tab className={`${ColorDetails.baseClass}__tab`}>
                  <div className={`${ColorDetails.baseClass}__tab-copy`}><FormattedMessage id='SIMILAR_COLORS' /></div>
                </Tab>
                <Tab className={`${ColorDetails.baseClass}__tab`}>
                  <div className={`${ColorDetails.baseClass}__tab-copy`}><FormattedMessage id='DETAILS' /></div>
                </Tab>
              </TabList>
              <TabPanel className={`${ColorDetails.baseClass}__tab-panel`}>
                <CoordinatingColors colors={colors} color={activeColor} />
              </TabPanel>
              <TabPanel className={`${ColorDetails.baseClass}__tab-panel`}>
                <SimilarColors colors={colors} color={activeColor} />
              </TabPanel>
              <TabPanel className={`${ColorDetails.baseClass}__tab-panel color-info__tab-panel-details`}>
                <ColorInfo color={activeColor} />
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
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

  toggleSceneDisplay () {
    this.setState({ sceneIsDisplayed: !this.state.sceneIsDisplayed })
  }

  toggleChipMaximized () {
    this.setState({ chipIsMaximized: !this.state.chipIsMaximized })
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
