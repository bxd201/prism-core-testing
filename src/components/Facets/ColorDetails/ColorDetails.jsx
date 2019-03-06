// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import has from 'lodash/has'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { injectIntl, FormattedMessage } from 'react-intl'
import ReactGA from 'react-ga'
import { LiveMessage } from 'react-aria-live'

import ColorChipMaximizer from './ColorChipMaximizer'
import ColorInfo from './ColorInfo'
import ColorViewer from './ColorViewer'
import ColorStrip from './ColorStrip/ColorStrip'
import CoordinatingColors from './CoordinatingColors/CoordinatingColors'
import SimilarColors from './SimilarColors/SimilarColors'
import SceneManager from '../../SceneManager/SceneManager'
import type { ColorMap, Color } from '../../../shared/types/Colors'
import { ROUTE_PARAM_NAMES } from 'constants/globals'

import { paintAllMainSurfaces } from '../../../store/actions/scenes'
import { varValues } from 'variables'
import './ColorDetails.scss'

type StateProps = {
  match: any,
  colors: ColorMap,
  scenesLoaded: boolean,
  paintAllMainSurfaces: Function
}

type State = {
  sceneIsDisplayed: boolean,
  chipIsMaximized: boolean,
  a11yMessage: string,
  a11yAssertMessage: string
}

type ComponentProps = {
  intl: intlShape
}

type Props = StateProps & ComponentProps

class ColorDetails extends PureComponent<Props, State> {
  static baseClass = 'color-info'

  state: State = {
    sceneIsDisplayed: true,
    chipIsMaximized: false,
    a11yMessage: '',
    a11yAssertMessage: ''
  }

  constructor (props: Props) {
    super(props)

    this.toggleSceneDisplay = this.toggleSceneDisplay.bind(this)
    this.reportTabSwitchToGA = this.reportTabSwitchToGA.bind(this)
    this.toggleSceneDisplayScene = React.createRef()
    this.toggleSceneHideScene = React.createRef()
  }

  render () {
    const { match: { params }, colors } = this.props
    const { sceneIsDisplayed, a11yMessage, a11yAssertMessage } = this.state

    // TODO: Color Details won't be a top level component, so this may not be valid so temporarily not rendering until it has colors
    if (!colors) {
      return null
    }

    // grab the color by color number from the URL
    const activeColor = this.getColorById(params[ROUTE_PARAM_NAMES.COLOR_ID])
    if (!activeColor) {
      console.info(`ColorDetails: ${params[ROUTE_PARAM_NAMES.COLOR_ID]} is not a valid color ID`)
      return null
    }

    // perform some css class logic & scaffolding instead of within the DOM itself
    let contrastingTextColor = varValues.colors.black

    const MAIN_INFO_CLASSES = [
      `${ColorDetails.baseClass}__main-info`
    ]
    const SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES = [
      `${ColorDetails.baseClass}__display-toggle-button`,
      `${ColorDetails.baseClass}__scene-display-toggle-button`
    ]
    const ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES = SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.slice()
    ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__scene-display-toggle-button--alt`)

    if (sceneIsDisplayed) {
      SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--active`)
      ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--active`)
    }
    if (activeColor.isDark) {
      contrastingTextColor = varValues.colors.white
      SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--dark-color`)
      ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--dark-color`)
      MAIN_INFO_CLASSES.push(`${ColorDetails.baseClass}__main-info--dark-color`)
    }

    return (
      <React.Fragment>
        <div className='color-detail-view'>
          <ColorChipMaximizer color={activeColor} />
          <div className={`color-detail__scene-wrapper ${sceneIsDisplayed ? ` color-detail__scene-wrapper--displayed` : ''}`}>
            <SceneManager maxActiveScenes={1} interactive={false} mainColor={activeColor} />
          </div>
          <div className='color-detail__info-wrapper'>
            <button className={SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.join(' ')} onClick={this.toggleSceneDisplay} ref={this.toggleSceneDisplayScene}>
              <FontAwesomeIcon className={`${ColorDetails.baseClass}__display-toggles-icon ${ColorDetails.baseClass}__display-toggles-icon--scene`} icon={['fal', 'home']} color={contrastingTextColor} />
              <div className={`${ColorDetails.baseClass}__scene-toggle-copy`}>
                <FormattedMessage id='DISPLAY_SCENE_PAINTER' />
              </div>
            </button>
            <button className={ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.join(' ')} onClick={this.toggleSceneDisplay} ref={this.toggleSceneHideScene}>
              <FontAwesomeIcon className={`${ColorDetails.baseClass}__display-toggles-icon ${ColorDetails.baseClass}__display-toggles-icon--scene`} icon={['fas', 'home']} color={contrastingTextColor} />
              <div className={`${ColorDetails.baseClass}__scene-toggle-copy`}>
                <FormattedMessage id='HIDE_SCENE_PAINTER' />
              </div>
            </button>
            <div className={MAIN_INFO_CLASSES.join(' ')} style={{ backgroundColor: activeColor.hex }}>
              <ColorViewer color={activeColor} />
              <ColorStrip key={activeColor.id} colors={colors} color={activeColor} />
            </div>
            <div className={`${ColorDetails.baseClass}__additional-info`}>
              <Tabs onSelect={this.reportTabSwitchToGA}>
                <TabList className={`${ColorDetails.baseClass}__tab-list`} style={{ backgroundColor: activeColor.hex }}>
                  <Tab className={`${ColorDetails.baseClass}__tab ${activeColor.isDark ? `${ColorDetails.baseClass}__tab--dark-color` : ''}`}>
                    <div className={`${ColorDetails.baseClass}__tab-copy`}>
                      <FormattedMessage id='COORDINATING_COLORS' />
                    </div>
                  </Tab>
                  <Tab className={`${ColorDetails.baseClass}__tab ${activeColor.isDark ? `${ColorDetails.baseClass}__tab--dark-color` : ''}`}>
                    <div className={`${ColorDetails.baseClass}__tab-copy`}>
                      <FormattedMessage id='SIMILAR_COLORS' />
                    </div>
                  </Tab>
                  <Tab className={`${ColorDetails.baseClass}__tab ${activeColor.isDark ? `${ColorDetails.baseClass}__tab--dark-color` : ''}`}>
                    <div className={`${ColorDetails.baseClass}__tab-copy`}>
                      <FormattedMessage id='DETAILS' />
                    </div>
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
        {/* All screen reader live region messaging goes here */}
        <LiveMessage message={`You are now on the ${activeColor.name} color detail page.`} aria-live='polite' />
        <LiveMessage message={a11yMessage} aria-live='polite' clearOnUnmount='true' />
        <LiveMessage message={a11yAssertMessage} aria-live='assertive' clearOnUnmount='true' />
      </React.Fragment>
    )
  }

  componentDidMount () {
    const { match: { params } } = this.props
    const color = this.getColorById(params[ROUTE_PARAM_NAMES.COLOR_ID])

    ReactGA.set({ dimension1: 'sherwinWilliamsCAmainSite' }, ['GAtrackerPRISM'])
    ReactGA.pageview(`color-detail/${color.brandKey} ${color.colorNumber} - ${color.name}`, ['GAtrackerPRISM'])
  }

  componentDidUpdate () {
    const { match: { params }, scenesLoaded } = this.props

    // paint all the main surfaces on load of the CDP
    const color = this.getColorById(params[ROUTE_PARAM_NAMES.COLOR_ID])
    if (scenesLoaded && color) {
      this.props.paintAllMainSurfaces(color)
    }
  }

  getColorById (colorId) {
    const { colors } = this.props

    // check if the colors object has the id
    if (!has(colors, colorId)) {
      return null
    }
    return colors[colorId]
  }

  toggleSceneDisplay () {
    const translatedMessages = this.props.intl.messages

    // Testing different combinations of ara-assertive messages, timeouts, and intially clearing state.a11yMessage indicated that all three measures were need in order for th SR to consistently announce events. I'm not happy either.
    if (this.state.sceneIsDisplayed) {
      this.setState({ sceneIsDisplayed: false, a11yAssertMessage: '' },
        () => {
          if (this.toggleSceneDisplayScene) this.toggleSceneDisplayScene.current.focus()

          setTimeout(() => {
            this.setState({ a11yAssertMessage: translatedMessages.SCENE_HIDDEN })
          }, 500)
        }
      )
    } else {
      this.setState({ sceneIsDisplayed: true, a11yAssertMessage: '' },
        () => {
          if (this.toggleSceneHideScene) this.toggleSceneHideScene.current.focus()

          setTimeout(() => {
            this.setState({ a11yAssertMessage: translatedMessages.SCENE_DISPLAYED })
          }, 500)
        }
      )
    }
  }

  reportTabSwitchToGA (index) {
    const tabNames = ['View Coord Color Section', 'View Similar Color Section', 'View Color Info Section']
    const tabReportingName = tabNames[index]

    ReactGA.event({
      category: 'Color Detail',
      action: tabReportingName,
      label: tabReportingName
    }, ['GAtrackerPRISM'])
  }
}

const mapStateToProps = (state, props) => {
  const { colors, scenes } = state

  return {
    colors: colors.items.colorMap,
    scenesLoaded: !scenes.loadingScenes
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    paintAllMainSurfaces: (color: Color) => {
      dispatch(paintAllMainSurfaces(color))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(injectIntl(ColorDetails)))
