// @flow
import React, { useCallback, useMemo, useState, useEffect, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AutoSizer } from 'react-virtualized'
import CardMenu from 'src/components/CardMenu/CardMenu'
import ExpertColorDetails from './ExpertColorDetails'
import ColorStripButton from 'src/components/ColorStripButton/ColorStripButton'
import Carousel from '../Carousel/Carousel'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import ColorSwatch from '../Facets/ColorWall/ColorSwatch/ColorSwatch'
import { loadExpertColorPicks } from 'src/store/actions/expertColorPicks'
import { fullColorNumber, getContrastYIQ } from 'src/shared/helpers/ColorUtils'
import { useIntl } from 'react-intl'
import at from 'lodash/at'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import ColorWallContext from '../Facets/ColorWall/ColorWallContext'
import './ExpertColorPicks.scss'
import '../ColorStripButton/ColorStripButton.scss'

const ExpertColorPicks = () => {
  const dispatch = useDispatch()
  const { locale } = useIntl()
  const { brandId, cvw = {} } = useContext<ConfigurationContextType>(ConfigurationContext)
  useEffect(() => { loadExpertColorPicks(brandId, { language: locale })(dispatch) }, [])

  const { messages = {} } = useIntl()
  const [initPosition, setPosition] = useState(0)
  const [tabId, setTabId] = useState('tab0')
  const expertColorPicks = useSelector(state => state.expertColorPicks.data)
  const categories = expertColorPicks.map((ecp) => ecp.category?.[0]).filter((category, index, self) => category && self.indexOf(category) === index)
  const expertColorPicksByCategory = expertColorPicks.filter((ecp) => ecp.category?.[0] === categories[tabId.slice(3)])
  const tabs = categories.map((category, index) => ({ id: `tab${index}`, tabName: category }))

  return (
    <CardMenu menuTitle={cvw.expertColorPicks?.title ?? at(messages, 'EXPERT_COLOR_PICKS')[0]}>
      {(setCardShowing) => (
        <div className='expert-color-picks__wrapper'>
          {categories.length > 0 && <ColorCollectionsTab collectionsSelectLabel={cvw.expertColorPicks?.collectionsSelectLabel} collectionTabs={tabs} tabIdShow={tabId} showTab={setTabId} />}
          <div className='expert-color-picks__collections-list'>
            <AutoSizer disableHeight style={{ width: '100%' }}>
              {({ width }) => expertColorPicks.length > 0 && <Carousel
                BaseComponent={expertColorPicks[0].colorDefs.length === 1 ? ColorSwatchWrapper : ColorStripButtonWrapper}
                btnRefList={[]}
                defaultItemsPerView={8}
                isInfinity={false}
                key='expertcolorpicks'
                data={expertColorPicksByCategory}
                tabMap={tabs.map(({ id }) => id)}
                tabId={tabId}
                setTabId={setTabId}
                setInitialPosition={setPosition}
                initPosition={initPosition}
                getSummaryData={collectionSummaryData => setCardShowing(<ExpertColorDetails expertColors={collectionSummaryData} />)}
                width={width}
              />}
            </AutoSizer>
          </div>
        </div>
      )}
    </CardMenu>
  )
}

const ColorStripButtonWrapper = (props: any) => {
  const { data, getSummaryData, onKeyDown, itemNumber, btnRefList } = props
  const clickHandler = useCallback(() => getSummaryData(data), [data])
  const color = data.colorDefs[0]
  const colors = useMemo(() => data.colorDefs.slice(1), [data.colorDefs])
  btnRefList[itemNumber] = React.useRef()

  useEffect(() => {
    if (btnRefList[0].current) {
      btnRefList[0].current.focus()
    }
  }, [btnRefList[0]])

  return (
    <ColorStripButton
      onClick={clickHandler}
      onKeyDown={onKeyDown}
      colors={colors}
      ref={btnRefList[itemNumber]}
    >
      <div
        className='expert-color-pick-button__top-section'
        style={{ backgroundColor: color.hex, color: getContrastYIQ(color.hex) }}
      >
        <div className='expert-color-pick-button__content__wrapper'>
          <div className='expert-color-pick-button__content__wrapper__color-number'>
            {fullColorNumber(color.brandKey, color.colorNumber)}
          </div>
          <div className='expert-color-pick-button__content__wrapper__color-name'>
            {color.name}
          </div>
        </div>
      </div>
    </ColorStripButton>
  )
}

const ColorSwatchWrapper = ({ data, width }: any) => {
  const color = data.colorDefs[0]
  const { colorWall: { colorSwatch = {} } }: ConfigurationContextType = useContext(ConfigurationContext)
  const { houseShaped = false } = colorSwatch
  const baseClass = houseShaped ? 'color-strip-button--house-shaped' : 'color-strip-button'
  const smallScreen = width < 768

  return (
    <ColorWallContext.Provider value={{ displayAddButton: true, displayInfoButton: true }}>
      <div className={baseClass}>
        <div className={`${baseClass}__swatch`} role='button' tabIndex='0'>
          <ColorSwatch
            color={color}
            contentRenderer={(defaultContent) => houseShaped ? <>
              <div className='color-swatch-house-shaped__btns' style={{ marginTop: smallScreen ? '122px' : '166px' }}>{defaultContent[1]}</div>
              <div className='color-swatch-house-shaped__label'>{defaultContent[0]}</div>
              <div className={`${baseClass}__desc`}>{data.description}</div>
            </> : <>{defaultContent}</>}
            gap={houseShaped ? 10 : undefined}
            isClickable={!houseShaped}
            outline={false}
            showContents
            style={houseShaped
              ? smallScreen ? { top: '5%', height: '102px' } : { top: '17%', height: '115px' }
              : { position: 'absolute', width: '100%', height: '100px' }
            }
          />
        </div>
        {!houseShaped && <div className={`${baseClass}__desc`}>{data.description}</div>}
      </div>
    </ColorWallContext.Provider>
  )
}

export default ExpertColorPicks
