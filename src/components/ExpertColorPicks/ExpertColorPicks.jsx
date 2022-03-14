// @flow
import React, { useCallback, useMemo, useState, useEffect, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
    <CardMenu menuTitle={at(messages, 'EXPERT_COLOR_PICKS')[0]}>
      {(setCardShowing) => (
        <div className='expert-color-picks__wrapper'>
          {categories.length > 0 && <ColorCollectionsTab collectionsSelectLabel={cvw.expertColorPicks?.collectionsSelectLabel} collectionTabs={tabs} tabIdShow={tabId} showTab={setTabId} />}
          <div className='expert-color-picks__collections-list'>
            {expertColorPicks.length > 0 && <Carousel
              BaseComponent={expertColorPicks[0].colorDefs.length === 1 ? ColorSwatchWrapper : ColorStripButtonWrapper}
              btnRefList={[]}
              defaultItemsPerView={8}
              isInfinity={false}
              key='expertcolorpicks'
              data={expertColorPicksByCategory}
              tabId={tabId}
              setTabId={setTabId}
              setInitialPosition={setPosition}
              initPosition={initPosition}
              getSummaryData={collectionSummaryData => setCardShowing(<ExpertColorDetails expertColors={collectionSummaryData} />)}
            />}
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

const ColorSwatchWrapper = ({ data }: any) => {
  const color = data.colorDefs[0]

  return (
    <ColorWallContext.Provider value={{ displayAddButton: true, displayInfoButton: true }}>
      <div className='color-strip-button'>
        <div className='color-strip-button__swatch' role='button' tabIndex='0'>
          <ColorSwatch style={{ position: 'absolute', height: '100px', width: '100%' }} color={color} showContents outline={false} />
        </div>
        <div className='color-strip-button__desc'>{data.description}</div>
      </div>
    </ColorWallContext.Provider>
  )
}

export default ExpertColorPicks
