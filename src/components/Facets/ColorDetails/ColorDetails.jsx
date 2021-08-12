// @flow
import React, { useContext, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useDispatch } from 'react-redux'
import ColorWallContext from 'src/components/Facets/ColorWall/ColorWallContext'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { FormattedMessage } from 'react-intl'
import * as GA from 'src/analytics/GoogleAnalytics'
import ColorChipMaximizer from './ColorChipMaximizer'
import ColorViewer from './ColorViewer'
import ColorStrip from './ColorStrip'
import ColorDetailsScenes from './ColorDetailsScenes'
import ColorInfo from './ColorInfo'
import CoordinatingColors from './CoordinatingColors'
import SimilarColors from './SimilarColors'
import { Content } from '../ColorWall/ColorSwatch/ColorSwatch'
import { toggleColorDetailsPage } from '../../../store/actions/scenes'
import { varValues } from 'src/shared/withBuild/variableDefs'
import type { Color } from '../../../shared/types/Colors.js.flow'
import type { SceneStatus } from 'src/shared/types/Scene'
import 'src/scss/convenience/visually-hidden.scss'
import './ColorDetails.scss'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'
import HeroLoader from 'src/components/Loaders/HeroLoader/HeroLoader'
import { ColorDetailsCTAs, type ColorDetailsCTAData } from './ColorDetailsCTAs'

const baseClass = 'color-info'

type Props = {
  onColorChanged?: Color => void,
  onSceneChanged?: SceneStatus => void,
  onVariantChanged?: string => void,
  onColorChipToggled?: boolean => void,
  familyLink?: string,
  loading?: boolean,
  initialColor?: Color,
  initialVariantName?: string,
  callsToAction?: ColorDetailsCTAData[]
}

export const ColorDetails = ({ onColorChanged, onSceneChanged, onVariantChanged, onColorChipToggled, familyLink, loading, initialColor, initialVariantName, callsToAction = [] }: Props) => {
  const dispatch = useDispatch()
  const { colorDetailsAddColor } = useContext<ConfigurationContextType>(ConfigurationContext)
  const toggleSceneDisplayScene = useRef(null)
  const toggleSceneHideScene = useRef(null)
  const [color: Color, setColor: Color => void] = useState(initialColor)
  const [tabIndex: number, setTabIndex: number => void] = useState(0)

  useEffect(() => {
    dispatch(toggleColorDetailsPage())
    return () => { dispatch(toggleColorDetailsPage()) }
  }, [])

  useEffect(() => {
    color && GA.pageView(`color-detail/${color.brandKey} ${color.colorNumber} - ${color.name}`)
    onColorChanged && onColorChanged(color)
    // force tab change to first tab if there is no coordinating colors tab
    color.coordinatingColors || setTabIndex(0)
  }, [color])

  if (loading) {
    return <HeroLoader />
  }

  // perform some css class logic & scaffolding instead of within the DOM itself
  let contrastingTextColor = varValues._colors.black
  const MAIN_INFO_CLASSES = [`${baseClass}__main-info`]
  const SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES = [`${baseClass}__display-toggle-button`, `${baseClass}__scene-display-toggle-button`]
  const ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES = SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES
  ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__scene-display-toggle-button--alt`)
  SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--active`)
  ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--active`)
  if (color.isDark) {
    contrastingTextColor = varValues._colors.white
    SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--dark-color`)
    ALT_SCENE_DISPLAY_TOGGLE_BUTTON_CLASSES.push(`${baseClass}__display-toggle-button--dark-color`)
    MAIN_INFO_CLASSES.push(`${baseClass}__main-info--dark-color`)
  }

  return (
    <>
      <div className='color-detail-view'>
        <ColorChipMaximizer color={color} onToggle={onColorChipToggled} />
        <div className={`color-detail__scene-wrapper color-detail__scene-wrapper--displayed`}>
          <ColorDetailsScenes color={color} intitialVariantName={initialVariantName} />
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
            {colorDetailsAddColor && <div className={`${baseClass}__main-info--add`}>
              <ColorWallContext.Provider value={{ displayAddButton: true }}>
                <Content msg='' color={color} style={{ position: 'relative' }} />
              </ColorWallContext.Provider>
            </div>}
          </div>

          {callsToAction?.length ? <ColorDetailsCTAs className='color-detail__ctas color-detail__ctas--mobile' data={callsToAction} /> : null}

          <div className={`${baseClass}__additional-info`}>
            <Tabs
              selectedIndex={tabIndex}
              onSelect={index => {
                const tabNames = ['View Coord Color Section', 'View Similar Color Section', 'View Color Info Section']
                GA.event({ category: 'Color Detail', action: tabNames[index], label: tabNames[index] })
                setTabIndex(index)
              }}
            >
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

      {callsToAction?.length ? <ColorDetailsCTAs className='color-detail__ctas color-detail__ctas--desktop' data={callsToAction} /> : null}
    </>
  )
}

export default ColorDataWrapper(ColorDetails)
