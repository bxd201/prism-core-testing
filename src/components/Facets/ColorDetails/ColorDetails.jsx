// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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

import { varValues } from 'variables'
import './ColorDetails.scss'

type Props = {
  match: any,
  colors: any
}

type State = {
  sceneIsDisplayed: boolean,
  chipIsMaximized: boolean
}

class ColorDetails extends PureComponent<Props> {
  static baseClass = 'color-info'

  state: State = {
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

    const activeColorIsDark = activeColor.isDark

    // perform some css class logic & scaffolding instead of within the DOM itself
    let contrastingTextColor = varValues.colors.black

    let SWATCH_CLASSES = [
      `${ColorDetails.baseClass}__max-chip`
    ]
    let DISPLAY_TOGGLES_WRAPPER = [
      `${ColorDetails.baseClass}__display-toggles-wrapper`
    ]
    let MAIN_INFO_CLASSES = [
      `${ColorDetails.baseClass}__main-info`
    ]

    let SWATCH_SIZE_TOGGLE_BUTTON_CLASSES = [
      `${ColorDetails.baseClass}__display-toggle-button`,
      `${ColorDetails.baseClass}__swatch-size-toggle-button`
    ]
    let ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES = SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.slice()
    ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--alt`)

    let SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES = [
      `${ColorDetails.baseClass}__display-toggle-button`,
      `${ColorDetails.baseClass}__scene-display-toggle-button`
    ]
    let ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES = SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.slice()
    ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__scene-display-toggle-button--alt`)

    if (chipIsMaximized) {
      SWATCH_CLASSES.push(`${ColorDetails.baseClass}__max-chip--maximized`)
      DISPLAY_TOGGLES_WRAPPER.push(`${ColorDetails.baseClass}__display-toggles-wrapper--chip-maximized`)
      SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--active`)
      ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--active`)
    }
    if (sceneIsDisplayed) {
      SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--active`)
      ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--active`)
    }
    if (activeColorIsDark) {
      contrastingTextColor = varValues.colors.white
      SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--dark-color`)
      SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--dark-color`)
      ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--dark-color`)
      ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${ColorDetails.baseClass}__display-toggle-button--dark-color`)
      MAIN_INFO_CLASSES.push(`${ColorDetails.baseClass}__main-info--dark-color`)
    }

    return (
      <div className='color-detail-view'>
        <div className={SWATCH_CLASSES.join(' ')} style={{ backgroundColor: activeColor.hex }} />
        <div className={DISPLAY_TOGGLES_WRAPPER.join(' ')}>
          <button className={SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.join(' ')} onClick={this.toggleChipMaximized}>
            <FontAwesomeIcon className={`${ColorDetails.baseClass}__display-toggles-icon`} icon={['fal', 'arrow-left']} color={contrastingTextColor} /><FontAwesomeIcon icon={['fal', 'arrow-right']} color={contrastingTextColor} />
            <div className={`${ColorDetails.baseClass}__scene-toggle-copy`}><FormattedMessage id='MAXIMIZE_COLOR_SWATCH' /></div>
          </button>
          <button className={ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.join(' ')} onClick={this.toggleChipMaximized}>
            <FontAwesomeIcon className={`${ColorDetails.baseClass}__display-toggles-icon`} icon={['fal', 'arrow-right']} color={contrastingTextColor} /><FontAwesomeIcon icon={['fal', 'arrow-left']} size='lg' color={contrastingTextColor} />
            <div className={`${ColorDetails.baseClass}__scene-toggle-copy`}><FormattedMessage id='RESTORE_COLOR_SWATCH_TO_DEFAULT_SIZE' /></div>
          </button>
        </div>
        <div className={`color-detail__scene-wrapper ${sceneIsDisplayed ? ` color-detail__scene-wrapper--displayed` : ''}`}>
          <SceneManager maxActiveScenes={1} />
        </div>
        <div className='color-detail__info-wrapper'>
          <button className={SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.join(' ')} onClick={this.toggleSceneDisplay}>
            <FontAwesomeIcon className={`${ColorDetails.baseClass}__display-toggles-icon`} icon={['fal', 'home']} color={contrastingTextColor} />
            <div className={`${ColorDetails.baseClass}__scene-toggle-copy`}><FormattedMessage id='DISPLAY_SCENE_PAINTER' /></div>
          </button>
          <button className={ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.join(' ')} onClick={this.toggleSceneDisplay}>
            <FontAwesomeIcon className={`${ColorDetails.baseClass}__display-toggles-icon`} icon={['fas', 'home']} color={contrastingTextColor} />
            <div className={`${ColorDetails.baseClass}__scene-toggle-copy`}><FormattedMessage id='HIDE_SCENE_PAINTER' /></div>
          </button>

          <div className={MAIN_INFO_CLASSES.join(' ')} style={{ backgroundColor: activeColor.hex }}>
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

  toggleSceneDisplay = function toggleSceneDisplay () {
    this.setState({ sceneIsDisplayed: !this.state.sceneIsDisplayed })
  }

  toggleChipMaximized = function toggleChipMaximized () {
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
