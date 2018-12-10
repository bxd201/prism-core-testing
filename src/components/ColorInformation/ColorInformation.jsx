// @flow
import React, { PureComponent, Fragment } from 'react'
import { connect } from 'react-redux'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

import './ColorInformation.scss'

type Props = {
  activeColor: Color | void,
  sceneIsDisplayedHandler: Function,
  sceneIsMaximizedHandler: Function
}

class ColorInformation extends PureComponent<Props> {
  static baseClass = 'color-info'

  render () {
    const { activeColor, sceneIsDisplayedHandler, sceneIsMaximizedHandler } = this.props

    return (
      <Fragment>
        <section className={ColorInformation.baseClass}>
          <div className={`${ColorInformation.baseClass}__main-info`} style={{ backgroundColor: activeColor.hex }}>
            <h1 className={`${ColorInformation.baseClass}__name-number`}>
              <span className={`${ColorInformation.baseClass}__number`}>SW 6286</span>
              <span className={`${ColorInformation.baseClass}__name`}>Mature Grape</span>
            </h1>
            <h2 className={`${ColorInformation.baseClass}__type`}>
              Interior/Exterior
            </h2>
            <h3 className={`${ColorInformation.baseClass}__rack-location`}>
              Location Number: 101-C7
            </h3>
            <ul className={`${ColorInformation.baseClass}__strip`}>
              <li className={`${ColorInformation.baseClass}__strip-location`}><span className={`${ColorInformation.baseClass}__strip-location-name`}>131</span></li>
              <li className={`${ColorInformation.baseClass}__strip-color`}><span className={`${ColorInformation.baseClass}__strip-color-name`}>Color Name</span></li>
              <li className={`${ColorInformation.baseClass}__strip-color`}><span className={`${ColorInformation.baseClass}__strip-color-name`}>Color Name</span></li>
              <li className={`${ColorInformation.baseClass}__strip-color`}><span className={`${ColorInformation.baseClass}__strip-color-name`}>Color Name</span></li>
              <li className={`${ColorInformation.baseClass}__strip-color`}><span className={`${ColorInformation.baseClass}__strip-color-name`}>Color Name</span></li>
              <li className={`${ColorInformation.baseClass}__strip-color`}><span className={`${ColorInformation.baseClass}__strip-color-name`}>Color Name</span></li>
              <li className={`${ColorInformation.baseClass}__strip-color`}><span className={`${ColorInformation.baseClass}__strip-color-name`}>Color Name</span></li>
              <li className={`${ColorInformation.baseClass}__strip-color`}><span className={`${ColorInformation.baseClass}__strip-color-name`}>Color Name</span></li>
              <li className={`${ColorInformation.baseClass}__strip-color`}><span className={`${ColorInformation.baseClass}__strip-color-name`}>Color Name</span></li>
            </ul>
            <button className={`${ColorInformation.baseClass}__scene-display-toggle color-info__scene-painter-toggle`} onClick={sceneIsDisplayedHandler}><div className={`${ColorInformation.baseClass}__scene-toggle-copy`}>Toggle Scene Painter Display</div></button>
            <button className={`${ColorInformation.baseClass}__scene-maximize-toggle color-info__scene-painter-toggle`} onClick={sceneIsMaximizedHandler}><div className={`${ColorInformation.baseClass}__scene-toggle-copy`}>Toggle Scene Painter Maximize</div></button>
          </div>

          <div className={`${ColorInformation.baseClass}__additional-info`}>
            <Tabs>
              <TabList className={`${ColorInformation.baseClass}__tab-list`} style={{ backgroundColor: activeColor.hex }}>
                <Tab className={`${ColorInformation.baseClass}__tab`}><div className={`${ColorInformation.baseClass}__tab-copy`}>Coordinating Colors</div></Tab>
                <Tab className={`${ColorInformation.baseClass}__tab`}><div className={`${ColorInformation.baseClass}__tab-copy`}>Similar Colors</div></Tab>
                <Tab className={`${ColorInformation.baseClass}__tab`}><div className={`${ColorInformation.baseClass}__tab-copy`}>Details</div></Tab>
              </TabList>
              <TabPanel className={`${ColorInformation.baseClass}__tab-panel`}>
                <h5 className='visually-hidden'>Coordinating Colors</h5>
                <ul className={`${ColorInformation.baseClass}__coord-colors`}>
                  <li className={`${ColorInformation.baseClass}__coord-color`}>
                    <p className={`${ColorInformation.baseClass}__coord-color-number`}>sw 10273</p>
                    <p className={`${ColorInformation.baseClass}__coord-color-name`}>Gaunlet Grey</p>
                  </li>
                  <li className={`${ColorInformation.baseClass}__coord-color`}>
                    <p className={`${ColorInformation.baseClass}__coord-color-number`}>SW 1027</p>
                    <p className={`${ColorInformation.baseClass}__coord-color-name`}>Palisides Precious Purple</p>
                  </li>
                  <li className={`${ColorInformation.baseClass}__coord-color`}>
                    <p className={`${ColorInformation.baseClass}__coord-color-number`}>SW 1027</p>
                    <p className={`${ColorInformation.baseClass}__coord-color-name`}>Burn</p>
                  </li>
                </ul>
              </TabPanel>
              <TabPanel className={`${ColorInformation.baseClass}__tab-panel`}>
                <h5 className='visually-hidden'>Similar Colors</h5>
                <ul className={`${ColorInformation.baseClass}__similar-colors`}>
                  <li className={`${ColorInformation.baseClass}__similar-color`}>
                    <p className={`${ColorInformation.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
                  </li>
                  <li className={`${ColorInformation.baseClass}__similar-color`}>
                    <p className={`${ColorInformation.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
                  </li>
                  <li className={`${ColorInformation.baseClass}__similar-color`}>
                    <p className={`${ColorInformation.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
                  </li>
                  <li className={`${ColorInformation.baseClass}__similar-color`}>
                    <p className={`${ColorInformation.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
                  </li>
                  <li className={`${ColorInformation.baseClass}__similar-color`}>
                    <p className={`${ColorInformation.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
                  </li>
                  <li className={`${ColorInformation.baseClass}__similar-color`}>
                    <p className={`${ColorInformation.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
                  </li>
                  <li className={`${ColorInformation.baseClass}__similar-color`}>
                    <p className={`${ColorInformation.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
                  </li>
                  <li className={`${ColorInformation.baseClass}__similar-color`}>
                    <p className={`${ColorInformation.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
                  </li>
                </ul>
              </TabPanel>
              <TabPanel className={`${ColorInformation.baseClass}__tab-panel color-info__tab-panel-details`}>
                <h5 className='visually-hidden'>Details</h5>
                <a className={`${ColorInformation.baseClass}__family-link`} href=''>View All Orange Paint Colors </a>
                <ul className={`${ColorInformation.baseClass}__visual-specifications`}>
                  <li className={`${ColorInformation.baseClass}__visual-specification`}>
                    <dl>
                      <dt className={`${ColorInformation.baseClass}__description-term`}>R:</dt>
                      <dd className={`${ColorInformation.baseClass}__description-definition`}>197</dd>
                      <dt className={`${ColorInformation.baseClass}__description-term`}>G:</dt>
                      <dd className={`${ColorInformation.baseClass}__description-definition`}>102</dd>
                      <dt className={`${ColorInformation.baseClass}__description-term`}>B:</dt>
                      <dd className={`${ColorInformation.baseClass}__description-definition`}>57</dd>
                    </dl>
                  </li>
                  <li className={`${ColorInformation.baseClass}__visual-specification`}>
                    <dl>
                      <dt className={`${ColorInformation.baseClass}__description-term`}>Hex Value:</dt>
                      <dd className={`${ColorInformation.baseClass}__description-definition`}>#c56639</dd>
                    </dl>
                  </li>
                  <li className={`${ColorInformation.baseClass}__visual-specification`}>
                    <dl>
                      <dt className={`${ColorInformation.baseClass}__description-term`}>LRV:</dt>
                      <dd className={`${ColorInformation.baseClass}__description-definition`}>22</dd>
                    </dl>
                  </li>
                </ul>
                <dl>
                  <dt className={`${ColorInformation.baseClass}__description-term`}>Color Collections:</dt>
                  <dd className={`${ColorInformation.baseClass}__description-definition`}>Inbe Tweens</dd>
                </dl>
              </TabPanel>
            </Tabs>
          </div>
        </section>
      </Fragment>
    )
  }
}

const mapDispatchToProps: Function = (dispatch) => {
  return {
  }
}

export default connect(null, mapDispatchToProps)(ColorInformation)
