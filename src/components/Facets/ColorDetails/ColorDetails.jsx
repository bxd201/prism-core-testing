// @flow
import React, { useRef, useEffect, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import has from 'lodash/has'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { FormattedMessage } from 'react-intl'
import ReactGA from 'react-ga'
import ColorChipMaximizer from './ColorChipMaximizer'
import ColorInfo from './ColorInfo'
import ColorViewer from './ColorViewer'
import ColorStrip from './ColorStrip/ColorStrip'
import CoordinatingColors from './CoordinatingColors/CoordinatingColors'
import SimilarColors from './SimilarColors/SimilarColors'
import SceneManager from '../../SceneManager/SceneManager'
import { paintAllMainSurfaces } from '../../../store/actions/scenes'
import { varValues } from 'variables'
import type { ColorMap, Color } from '../../../shared/types/Colors'
import type { Configuration } from '../../../shared/types/Configuration'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import 'src/scss/convenience/visually-hidden.scss'
import './ColorDetails.scss'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'

const baseClass = 'color-info'

const ColorDetails = ColorDataWrapper(({ onColorChanged }: { onColorChanged: Function }) => {
  const { colorId } = useParams()
  const config: Configuration = useContext(ConfigurationContext)
  const dispatch = useDispatch()
  const toggleSceneDisplayScene = useRef(null)
  const toggleSceneHideScene = useRef(null)
  const colors: ColorMap = useSelector(state => state.colors.items.colorMap)
  const scenesLoaded: boolean = useSelector(state => !state.scenes.loadingScenes)
  // grab the color by color number from the URL
  const activeColor: Color = has(colors, colorId) ? colors[colorId] : null

  useEffect(() => {
    if (activeColor) {
      ReactGA.set({ dimension1: config.ga_domain_id }, ['GAtrackerPRISM'])
      ReactGA.pageview(`color-detail/${activeColor.brandKey} ${activeColor.colorNumber} - ${activeColor.name}`, ['GAtrackerPRISM'])
      onColorChanged(activeColor)
    }
  }, [activeColor])

  useEffect(() => { // paint all the main surfaces on load of the CDP
    scenesLoaded && activeColor && dispatch(paintAllMainSurfaces(activeColor))
  }, [scenesLoaded, activeColor])

  if (!activeColor) {
    console.info(`ColorDetails: ${colorId} is not a valid color ID`)
    return null
  }

  // perform some css class logic & scaffolding instead of within the DOM itself
  let contrastingTextColor = varValues.colors.black
  const MAIN_INFO_CLASSES = [`${baseClass}__main-info`]
  const SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES = [`${baseClass}__display-toggle-button`, `${baseClass}__scene-display-toggle-button`]
  const ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES = SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.slice()
  ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__scene-display-toggle-button--alt`)
  SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--active`)
  ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--active`)
  if (activeColor.isDark) {
    contrastingTextColor = varValues.colors.white
    SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--dark-color`)
    ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--dark-color`)
    MAIN_INFO_CLASSES.push(`${baseClass}__main-info--dark-color`)
  }

  return (
    <>
      <div className='color-detail-view'>
        <ColorChipMaximizer color={activeColor} />
        <div className={`color-detail__scene-wrapper color-detail__scene-wrapper--displayed`}>
          <SceneManager maxActiveScenes={1} interactive={false} mainColor={activeColor} />
        </div>
        <div className='color-detail__info-wrapper'>
          <button className={SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.join(' ')} ref={toggleSceneDisplayScene}>
            <FontAwesomeIcon className={`${baseClass}__display-toggles-icon ${baseClass}__display-toggles-icon--scene`} icon={['fal', 'home']} color={contrastingTextColor} />
            <div className={`${baseClass}__scene-toggle-copy visually-hidden`}>
              <FormattedMessage id='DISPLAY_SCENE_PAINTER' />
            </div>
          </button>
          <button className={ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.join(' ')} ref={toggleSceneHideScene}>
            <FontAwesomeIcon className={`${baseClass}__display-toggles-icon ${baseClass}__display-toggles-icon--scene`} icon={['fas', 'home']} color={contrastingTextColor} />
            <div className={`${baseClass}__scene-toggle-copy visually-hidden`}>
              <FormattedMessage id='HIDE_SCENE_PAINTER' />
            </div>
          </button>
          <div className={MAIN_INFO_CLASSES.join(' ')} style={{ backgroundColor: activeColor.hex }}>
            <ColorViewer color={activeColor} />
            <ColorStrip key={activeColor.id} colors={colors} color={activeColor} />
          </div>
          <div className={`${baseClass}__additional-info`}>
            <Tabs onSelect={index => {
              const tabNames = ['View Coord Color Section', 'View Similar Color Section', 'View Color Info Section']
              ReactGA.event({ category: 'Color Detail', action: tabNames[index], label: tabNames[index] }, ['GAtrackerPRISM'])
            }}>
              <TabList className={`${baseClass}__tab-list`} style={{ backgroundColor: activeColor.hex }}>
                <Tab className={`${baseClass}__tab ${activeColor.isDark ? `${baseClass}__tab--dark-color` : ''}`}>
                  <div className={`${baseClass}__tab-copy`}>
                    <FormattedMessage id='COORDINATING_COLORS' />
                  </div>
                </Tab>
                <Tab className={`${baseClass}__tab ${activeColor.isDark ? `${baseClass}__tab--dark-color` : ''}`}>
                  <div className={`${baseClass}__tab-copy`}>
                    <FormattedMessage id='SIMILAR_COLORS' />
                  </div>
                </Tab>
                <Tab className={`${baseClass}__tab ${activeColor.isDark ? `${baseClass}__tab--dark-color` : ''}`}>
                  <div className={`${baseClass}__tab-copy`}>
                    <FormattedMessage id='DETAILS' />
                  </div>
                </Tab>
              </TabList>
              <TabPanel className={`${baseClass}__tab-panel`}>
                <CoordinatingColors colors={colors} color={activeColor} />
              </TabPanel>
              <TabPanel className={`${baseClass}__tab-panel`}>
                <SimilarColors colors={colors} color={activeColor} />
              </TabPanel>
              <TabPanel className={`${baseClass}__tab-panel color-info__tab-panel-details`}>
                <ColorInfo color={activeColor} />
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
})

export default ColorDetails
