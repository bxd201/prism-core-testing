// @flow
import React, { useRef, useEffect, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import has from 'lodash/has'
import flattenDeep from 'lodash/flattenDeep'
import intersection from 'lodash/intersection'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { FormattedMessage } from 'react-intl'
import * as GA from 'src/analytics/GoogleAnalytics'
import ColorChipMaximizer from './ColorChipMaximizer'
import ColorInfo from './ColorInfo'
import ColorViewer from './ColorViewer'
import ColorStrip from './ColorStrip/ColorStrip'
import CoordinatingColors from './CoordinatingColors/CoordinatingColors'
import SimilarColors from './SimilarColors/SimilarColors'
import SceneManager from '../../SceneManager/SceneManager'
import { paintAllMainSurfaces } from '../../../store/actions/scenes'
import { varValues } from 'src/shared/variableDefs'
import type { ColorMap, Color, FamilyStructure } from '../../../shared/types/Colors.js.flow'
import 'src/scss/convenience/visually-hidden.scss'
import './ColorDetails.scss'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'

const baseClass = 'color-info'

type Props = {
  onColorChanged?: {} => void,
  onSceneChanged?: string => void,
  onVariantChanged?: string => void,
  onColorChipToggled?: boolean => void,
  familyLink?: string
}

export const ColorDetails = ({ onColorChanged, onSceneChanged, onVariantChanged, onColorChipToggled, familyLink }: Props) => {
  const { colorId } = useParams()
  const dispatch = useDispatch()
  const toggleSceneDisplayScene = useRef(null)
  const toggleSceneHideScene = useRef(null)
  const colors: ColorMap = useSelector(state => state.colors.items.colorMap)
  const structure: FamilyStructure = useSelector(state => state.colors.structure)
  const scenesLoaded: boolean = useSelector(state => !state.scenes.loadingScenes)
  // grab the color by color number from the URL
  const activeColor: Color | typeof undefined = has(colors, colorId) ? colors[colorId] : undefined

  useEffect(() => {
    if (activeColor) {
      GA.pageView(`color-detail/${activeColor.brandKey} ${activeColor.colorNumber} - ${activeColor.name}`)
      onColorChanged && onColorChanged(activeColor)
    }
  }, [activeColor])

  useEffect(() => { // paint all the main surfaces on load of the CDP
    scenesLoaded && activeColor && dispatch(paintAllMainSurfaces(activeColor))
  }, [scenesLoaded, activeColor])

  const optionsPanelProps = useMemo(() => {
    // default props only contain color
    let props = {
      color: activeColor
    }

    // if we have structure and color data...
    if (structure && activeColor && familyLink) {
      const allFams = flattenDeep(structure.map(s => s.families))
      const { colorFamilyNames } = activeColor
      // see if our active color's families exist in all families; if yes, allow showing the family link
      if (intersection(allFams, colorFamilyNames).length > 0) {
        props = {
          ...props,
          familyLink
        }
      }
    }

    return props
  }, [ structure, activeColor, familyLink ])

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
        <ColorChipMaximizer color={activeColor} onToggle={onColorChipToggled} />
        <div className={`color-detail__scene-wrapper color-detail__scene-wrapper--displayed`}>
          <SceneManager
            maxActiveScenes={1}
            interactive={false}
            mainColor={activeColor}
            onSceneChanged={onSceneChanged}
            onVariantChanged={onVariantChanged}
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
          <div className={MAIN_INFO_CLASSES.join(' ')} style={{ backgroundColor: activeColor.hex }}>
            <ColorViewer color={activeColor} />
            <ColorStrip key={activeColor.id} colors={colors} color={activeColor} />
          </div>
          <div className={`${baseClass}__additional-info`}>
            <Tabs onSelect={index => {
              const tabNames = ['View Coord Color Section', 'View Similar Color Section', 'View Color Info Section']
              GA.event({ category: 'Color Detail', action: tabNames[index], label: tabNames[index] })
            }}>
              <TabList className={`${baseClass}__tab-list`} style={{ backgroundColor: activeColor.hex }}>
                {activeColor.coordinatingColors && (
                  <Tab className={`coordinating-colors-tab ${baseClass}__tab ${activeColor.isDark ? `${baseClass}__tab--dark-color` : ''}`}>
                    <div className={`${baseClass}__tab-copy`}>
                      <FormattedMessage id='COORDINATING_COLORS' />
                    </div>
                  </Tab>
                )}
                <Tab className={`similar-colors-tab ${baseClass}__tab ${activeColor.isDark ? `${baseClass}__tab--dark-color` : ''}`}>
                  <div className={`${baseClass}__tab-copy`}>
                    <FormattedMessage id='SIMILAR_COLORS' />
                  </div>
                </Tab>
                <Tab className={`color-info-tab ${baseClass}__tab ${activeColor.isDark ? `${baseClass}__tab--dark-color` : ''}`}>
                  <div className={`${baseClass}__tab-copy`}>
                    <FormattedMessage id='DETAILS' />
                  </div>
                </Tab>
              </TabList>
              {activeColor.coordinatingColors && (
                <TabPanel className={`${baseClass}__tab-panel`}>
                  <CoordinatingColors colors={colors} color={activeColor} />
                </TabPanel>
              )}
              <TabPanel className={`${baseClass}__tab-panel`}>
                <SimilarColors colors={colors} color={activeColor} />
              </TabPanel>
              <TabPanel className={`${baseClass}__tab-panel color-info__tab-panel-details`}>
                <ColorInfo {...optionsPanelProps} />
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

export default ColorDataWrapper(ColorDetails)
