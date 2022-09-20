// @flow
import React, { useContext, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useDispatch } from 'react-redux'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { cloneDeep } from 'lodash/lang'
import * as GA from 'src/analytics/GoogleAnalytics'
import ColorWallContext from 'src/components/Facets/ColorWall/ColorWallContext'
import HeroLoader from 'src/components/Loaders/HeroLoader/HeroLoader'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import ConfigurationContext, {
  type ConfigurationContextType
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'
import type { SceneStatus } from 'src/shared/types/Scene'
import 'src/providers/fontawesome/fontawesome'
import type { Color } from '../../../shared/types/Colors.js.flow'
import { toggleColorDetailsPage } from '../../../store/actions/scenes'
import { Content } from '../ColorWall/ColorSwatch/ColorSwatch'
import ColorChipMaximizer from './ColorChipMaximizer'
import { type ColorDetailsCTAData, ColorDetailsCTAs } from './ColorDetailsCTAs'
import ColorDetailsScenes from './ColorDetailsScenes'
import ColorInfo from './ColorInfo'
import ColorStrip from './ColorStrip'
import ColorViewer from './ColorViewer'
import CoordinatingColors from './CoordinatingColors'
import SimilarColors from './SimilarColors'
import 'src/scss/convenience/visually-hidden.scss'
import './ColorDetails.scss'

const baseClass = 'color-info'
const mainInfoClass = `${baseClass}__main-info`

type Props = {
  onColorChanged?: (Color) => void,
  onSceneChanged?: (SceneStatus) => void,
  onVariantChanged?: (string) => void,
  onColorChipToggled?: (boolean) => void,
  familyLink?: string,
  loading?: boolean,
  colorFromParent?: Color,
  initialVariantName?: string,
  callsToAction?: ColorDetailsCTAData[]
}

type ColorMessage = {
  ...Color,
  doNotBroadcast?: boolean
}

export const ColorDetails = ({
  onColorChanged,
  onSceneChanged,
  onVariantChanged,
  onColorChipToggled,
  familyLink,
  loading,
  colorFromParent = {},
  initialVariantName,
  callsToAction = []
}: Props) => {
  const dispatch = useDispatch()
  const { brandId }: ConfigurationContextType = useContext(ConfigurationContext)
  const [color, setColor] = useState<ColorMessage>(colorFromParent) // in some case we add an extra prop to a color obj that tells the pub method to not fire
  const [tabIndex, setTabIndex] = useState<number>(0)
  const [isMaximized, setMaximized] = useState(false)

  useEffect(() => {
    if (colorFromParent && colorFromParent.id !== color.id) {
      const _color = cloneDeep(colorFromParent)
      _color.doNotBroadcast = true
      setColor(_color)
    }
  }, [colorFromParent])

  useEffect(() => {
    dispatch(toggleColorDetailsPage())
    return () => {
      dispatch(toggleColorDetailsPage())
    }
  }, [])

  useEffect(() => {
    if (color) {
      GA.pageView(`color-detail/${color.brandKey} ${color.colorNumber} - ${color.name}`, GA_TRACKER_NAME_BRAND[brandId])
    }
    if (onColorChanged && !color?.doNotBroadcast) {
      onColorChanged(color)
    }
    // force tab change to first tab if there is no coordinating colors tab
    color.coordinatingColors || setTabIndex(0)
  }, [color])

  const AddColorBtn = ({ style }: { style?: $Shape<CSSStyleDeclaration> }) => {
    const { colorDetailsAddColor } = useContext<ConfigurationContextType>(ConfigurationContext)

    if (!colorDetailsAddColor) return null

    return (
      <div className={`${mainInfoClass}--add`} style={style}>
        <ColorWallContext.Provider value={{ displayAddButton: true }}>
          <Content msg='' color={color} isMaximized={isMaximized} style={{ position: 'relative' }} />
        </ColorWallContext.Provider>
      </div>
    )
  }

  if (loading) {
    return <HeroLoader />
  }

  return (
    <>
      <div className='color-detail-view'>
        <ColorChipMaximizer
          addColorBtn={(style) => <AddColorBtn style={style} isMaximized={isMaximized} />}
          color={color}
          isMaximized={isMaximized}
          setMaximized={setMaximized}
          onToggle={onColorChipToggled}
        />
        <div className={'color-detail__scene-wrapper color-detail__scene-wrapper--displayed'}>
          <ColorDetailsScenes color={color} isMaximized={isMaximized} intitialVariantName={initialVariantName} />
        </div>
        <div className='color-detail__info-wrapper'>
          <div
            className={`${mainInfoClass}${color.isDark ? ` ${mainInfoClass}--dark-color` : ''}`}
            style={{ backgroundColor: color.hex }}
          >
            <ColorViewer color={color} />
            <ColorStrip key={color.id} color={color} onColorChanged={setColor} />
            {!isMaximized ? <AddColorBtn /> : null}
          </div>

          {callsToAction?.length ? (
            <ColorDetailsCTAs className='color-detail__ctas color-detail__ctas--mobile' data={callsToAction} />
          ) : null}

          <div className={`${baseClass}__additional-info`}>
            <Tabs
              selectedIndex={tabIndex}
              onSelect={(index) => {
                const tabNames = ['View Coord Color Section', 'View Similar Color Section', 'View Color Info Section']
                GA.event(
                  { category: 'Color Detail', action: tabNames[index], label: tabNames[index] },
                  GA_TRACKER_NAME_BRAND[brandId]
                )
                setTabIndex(index)
              }}
            >
              <TabList className={`${baseClass}__tab-list`} style={{ backgroundColor: color.hex }}>
                {color?.coordinatingColors?.coord1ColorId && (
                  <Tab
                    className={`coordinating-colors-tab ${baseClass}__tab ${
                      color.isDark ? `${baseClass}__tab--dark-color` : ''
                    }`}
                  >
                    <div className={`${baseClass}__tab-copy`}>
                      <FormattedMessage id='COORDINATING_COLORS' />
                    </div>
                  </Tab>
                )}
                <Tab
                  className={`similar-colors-tab ${baseClass}__tab ${
                    color.isDark ? `${baseClass}__tab--dark-color` : ''
                  }`}
                >
                  <div className={`${baseClass}__tab-copy`}>
                    <FormattedMessage id='SIMILAR_COLORS' />
                  </div>
                </Tab>
                <Tab
                  className={`color-info-tab ${baseClass}__tab ${color.isDark ? `${baseClass}__tab--dark-color` : ''}`}
                >
                  <div className={`${baseClass}__tab-copy`}>
                    <FormattedMessage id='DETAILS' />
                  </div>
                </Tab>
              </TabList>
              {color?.coordinatingColors?.coord1ColorId && (
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

      {callsToAction?.length ? (
        <ColorDetailsCTAs className='color-detail__ctas color-detail__ctas--desktop' data={callsToAction} />
      ) : null}
    </>
  )
}

export default ColorDataWrapper(ColorDetails)
