// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { flatten, filter } from 'lodash'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

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
    sceneIsMaximized: false
  }

  constructor (props) {
    super(props)

    this.toggleSceneDisplay = this.toggleSceneDisplay.bind(this)
    this.toggleSceneMaximized = this.toggleSceneMaximized.bind(this)
  }

  render () {
    const { match: { params }, colors } = this.props
    const { sceneIsDisplayed, sceneIsMaximized } = this.state

    // grab the color by color number from the URL
    const activeColor = this.getColorByColorNumber(params.colorNumber)

    return (
      <div className='color-detail-view'>
        <div className={`color-detail__scene-wrapper ${sceneIsDisplayed ? ` color-detail__scene-wrapper--displayed` : ''}  ${sceneIsMaximized ? ` color-detail__scene-wrapper--maximized` : ''}`}>
          <SceneManager />
        </div>
        <div className='color-detail__info-wrapper'>
          <div className={`${ColorDetails.baseClass}__main-info`} style={{ backgroundColor: activeColor.hex }}>
            <ColorViewer color={activeColor} />
            <ColorStrip key={activeColor.id} colors={colors} color={activeColor} />

            {/* TODO: Temporary buttons to toggle scene painter display/maximizing */}
            <button className={`${ColorDetails.baseClass}__scene-display-toggle color-info__scene-painter-toggle`} onClick={this.toggleSceneDisplay}>
              <div className={`${ColorDetails.baseClass}__scene-toggle-copy`}>Toggle Scene Painter Display</div>
            </button>
            <button className={`${ColorDetails.baseClass}__scene-maximize-toggle color-info__scene-painter-toggle`} onClick={this.toggleSceneMaximized}>
              <div className={`${ColorDetails.baseClass}__scene-toggle-copy`}>Toggle Scene Painter Maximize</div>
            </button>
          </div>
          <div className={`${ColorDetails.baseClass}__additional-info`}>
            <Tabs>
              <TabList className={`${ColorDetails.baseClass}__tab-list`} style={{ backgroundColor: activeColor.hex }}>
                <Tab className={`${ColorDetails.baseClass}__tab`}><div className={`${ColorDetails.baseClass}__tab-copy`}>Coordinating Colors</div></Tab>
                <Tab className={`${ColorDetails.baseClass}__tab`}><div className={`${ColorDetails.baseClass}__tab-copy`}>Similar Colors</div></Tab>
                <Tab className={`${ColorDetails.baseClass}__tab`}><div className={`${ColorDetails.baseClass}__tab-copy`}>Details</div></Tab>
              </TabList>
              <TabPanel className={`${ColorDetails.baseClass}__tab-panel`}>
                <CoordinatingColors colors={colors} color={activeColor} />
              </TabPanel>
              <TabPanel className={`${ColorDetails.baseClass}__tab-panel`}>
                <SimilarColors colors={colors} color={activeColor} />
              </TabPanel>
              <TabPanel className={`${ColorDetails.baseClass}__tab-panel color-info__tab-panel-details`}>
                <h5 className='visually-hidden'>Details</h5>
                {/* <a className={`${ColorDetails.baseClass}__family-link`} href=''>View All Orange Paint Colors </a> */}
                <ul className={`${ColorDetails.baseClass}__visual-specifications`}>
                  <li className={`${ColorDetails.baseClass}__visual-specification`}>
                    <dl>
                      <dt className={`${ColorDetails.baseClass}__description-term`}>R: </dt>
                      <dd className={`${ColorDetails.baseClass}__description-definition`}>{activeColor.red}</dd>
                      <dt className={`${ColorDetails.baseClass}__description-term`}>G: </dt>
                      <dd className={`${ColorDetails.baseClass}__description-definition`}>{activeColor.green}</dd>
                      <dt className={`${ColorDetails.baseClass}__description-term`}>B: </dt>
                      <dd className={`${ColorDetails.baseClass}__description-definition`}>{activeColor.blue}</dd>
                    </dl>
                  </li>
                  <li className={`${ColorDetails.baseClass}__visual-specification`}>
                    <dl>
                      <dt className={`${ColorDetails.baseClass}__description-term`}>Hex Value: </dt>
                      <dd className={`${ColorDetails.baseClass}__description-definition`}>{activeColor.hex}</dd>
                    </dl>
                  </li>
                  <li className={`${ColorDetails.baseClass}__visual-specification`}>
                    <dl>
                      <dt className={`${ColorDetails.baseClass}__description-term`}>LRV: </dt>
                      <dd className={`${ColorDetails.baseClass}__description-definition`}>{Math.round(activeColor.lrv)}</dd>
                    </dl>
                  </li>
                </ul>
                {activeColor.brandedCollectionNames && (
                  <dl>
                    <dt className={`${ColorDetails.baseClass}__description-term`}>Color Collections: </dt>
                    <dd className={`${ColorDetails.baseClass}__description-definition`}>{activeColor.brandedCollectionNames.join(', ')}</dd>
                  </dl>
                )}
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

  toggleSceneMaximized () {
    this.setState({ sceneIsMaximized: !this.state.sceneIsMaximized })
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
