// @flow
import React, { useRef, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { FormattedMessage } from 'react-intl'
import * as GA from 'src/analytics/GoogleAnalytics'
import ColorChipMaximizer from './ColorChipMaximizer'
import ColorInfo from './ColorInfo'
import ColorViewer from './ColorViewer'
import ColorStrip from './ColorStrip'
import CoordinatingColors from './CoordinatingColors'
import SimilarColors from './SimilarColors'
import SceneManager from '../../SceneManager/SceneManager'
import { paintAllMainSurfaces, toggleColorDetailsPage } from '../../../store/actions/scenes'
import { varValues } from 'src/shared/variableDefs'
import type { Color } from '../../../shared/types/Colors.js.flow'
import 'src/scss/convenience/visually-hidden.scss'
import './ColorDetails.scss'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'
import HeroLoader from 'src/components/Loaders/HeroLoader/HeroLoader'

const baseClass = 'color-info'

type Props = {
  onColorChanged?: Color => void,
  onSceneChanged?: string => void,
  onVariantChanged?: string => void,
  onColorChipToggled?: boolean => void,
  familyLink?: string,
  loading?: boolean,
  initialColor: Color
}

export const ColorDetails = ({ onColorChanged, onSceneChanged, onVariantChanged, onColorChipToggled, familyLink, loading, initialColor }: Props) => {
  const dispatch = useDispatch()
  const toggleSceneDisplayScene = useRef(null)
  const toggleSceneHideScene = useRef(null)
  const scenesLoaded: boolean = useSelector(state => !state.scenes.loadingScenes)

  const [color: Color, setColor: Color => void] = useState(initialColor)

  useEffect(() => {
    dispatch(toggleColorDetailsPage())
    return () => { dispatch(toggleColorDetailsPage()) }
  }, [])

  useEffect(() => {
    color && GA.pageView(`color-detail/${color.brandKey} ${color.colorNumber} - ${color.name}`)
    onColorChanged && onColorChanged(color)
  }, [color])

  // paint all the main surfaces on load of the CDP
  useEffect(() => { scenesLoaded && color && dispatch(paintAllMainSurfaces(color)) }, [scenesLoaded, color])

  if (loading) {
    return <HeroLoader />
  }

  // perform some css class logic & scaffolding instead of within the DOM itself
  let contrastingTextColor = varValues.colors.black
  const MAIN_INFO_CLASSES = [`${baseClass}__main-info`]
  const SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES = [`${baseClass}__display-toggle-button`, `${baseClass}__scene-display-toggle-button`]
  const ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES = SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES
  ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__scene-display-toggle-button--alt`)
  SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--active`)
  ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--active`)
  if (color.isDark) {
    contrastingTextColor = varValues.colors.white
    SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--dark-color`)
    ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--dark-color`)
    MAIN_INFO_CLASSES.push(`${baseClass}__main-info--dark-color`)
  }

  return (
    <>
      <div className='color-detail-view'>
        <ColorChipMaximizer color={color} onToggle={onColorChipToggled} />
        <div className={`color-detail__scene-wrapper color-detail__scene-wrapper--displayed`}>
          <SceneManager
            maxActiveScenes={1}
            interactive={false}
            mainColor={color}
            onSceneChanged={onSceneChanged}
            onVariantChanged={onVariantChanged}
            isColorDetail
          />
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
          <div className={MAIN_INFO_CLASSES.join(' ')} style={{ backgroundColor: color.hex }}>
            <ColorViewer color={color} />
            <ColorStrip key={color.id} color={color} onColorChanged={setColor} />
          </div>
          <div className={`${baseClass}__additional-info`}>
            <Tabs onSelect={index => {
              const tabNames = ['View Coord Color Section', 'View Similar Color Section', 'View Color Info Section']
              GA.event({ category: 'Color Detail', action: tabNames[index], label: tabNames[index] })
            }}>
              <TabList className={`${baseClass}__tab-list`} style={{ backgroundColor: color.hex }}>
                {color.coordinatingColors && (
                  <Tab className={`coordinating-colors-tab ${baseClass}__tab ${color.isDark ? `${baseClass}__tab--dark-color` : ''}`}>
                    <div className={`${baseClass}__tab-copy`}>
                      <FormattedMessage id='COORDINATING_COLORS' />
                    </div>
                  </Tab>
                )}
                <Tab className={`similar-colors-tab ${baseClass}__tab ${color.isDark ? `${baseClass}__tab--dark-color` : ''}`}>
                  <div className={`${baseClass}__tab-copy`}>
                    <FormattedMessage id='SIMILAR_COLORS' />
                  </div>
                </Tab>
                <Tab className={`color-info-tab ${baseClass}__tab ${color.isDark ? `${baseClass}__tab--dark-color` : ''}`}>
                  <div className={`${baseClass}__tab-copy`}>
                    <FormattedMessage id='DETAILS' />
                  </div>
                </Tab>
              </TabList>
              {color.coordinatingColors && (
                <TabPanel className={`${baseClass}__tab-panel`}>
                  <CoordinatingColors color={color} onColorChanged={setColor} />
                </TabPanel>
              )}
              <TabPanel className={`${baseClass}__tab-panel`}>
                <SimilarColors color={color} onColorChanged={setColor} />
              </TabPanel>
              <TabPanel className={`${baseClass}__tab-panel color-info__tab-panel-details`}>
                <ColorInfo color={color} familyLink={familyLink} />
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

export default ColorDataWrapper(ColorDetails)
