// @flow
import React, { useState } from 'react'
import type { Element } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route, useLocation, useHistory } from 'react-router-dom'
import { ColorCollections } from '../../ColorCollections/ColorCollections'
import ExpertColorPicks from '../../ExpertColorPicks/ExpertColorPicks'
import { ColorWallPage } from '../ColorWallFacet'
import ColorDetails from '../ColorDetails/ColorDetails'
import CompareColor from '../../CompareColor/CompareColor'
import InspiredScene from '../../InspirationPhotos/InspiredSceneNavigator'
import LivePalette from '../../LivePalette/LivePalette'
import ColorVisualizerNav from './ColorVisualizerNav'
import SceneManager from '../../SceneManager/SceneManager'
import SampleScenesWrapper from '../../SampleScenes/SampleScenes'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import { activateOnlyScene, unpaintSceneSurfaces, showWarningModal, unsetActiveScenePolluted } from '../../../store/actions/scenes'
import MyIdeasContainer from '../../MyIdeasContainer/MyIdeasContainer'
import MyIdeaPreview from '../../MyIdeaPreview/MyIdeaPreview'
import Help from '../../Help/Help'
import CVWWarningModal from './WarningModal'
import SaveOptions from '../../SaveOptions/SaveOptions'
import ColorDetailsModal from './ColorDetailsModal/ColorDetailsModal'
import { PreLoadingSVG } from './PreLoadingSVG'
import LandingPage from '../../LandingPage/LandingPage'
import './ColorVisualizer.scss'

export const CVW = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()

  const toggleCompareColor: boolean = useSelector(store => store.lp.toggleCompareColor)
  const colorDetailsModalShowing: boolean = useSelector(store => store.colors.colorDetailsModal.showing)
  const isActiveScenePolluted: boolean = useSelector(store => store.scenes.isActiveScenePolluted)

  const [activeScene: Element, setActiveScene: (Element) => void] = useState(<SceneManager expertColorPicks hideSceneSelector />)
  const [lastActiveComponent: string, setLastActiveComponent: (string) => void] = useState('StockScene')
  const [isLoading: boolean, setIsLoading: boolean => void] = useState(true)

  setTimeout(() => setIsLoading(false), 1000)

  const activateStockScene = (id) => {
    const activate = () => {
      dispatch(unsetActiveScenePolluted())
      dispatch(unpaintSceneSurfaces(id))
      dispatch(activateOnlyScene(id))
      setActiveScene(<SceneManager expertColorPicks hideSceneSelector />)
      history.push('/active')
    }
    isActiveScenePolluted ? dispatch(showWarningModal(activate)) : activate()
  }

  if (isLoading) {
    return <PreLoadingSVG />
  } else if (!window.localStorage.getItem('landingPageShownSession')) {
    return <LandingPage />
  }

  return (
    <div className='cvw__root-container'>
      {toggleCompareColor
        ? <CompareColor />
        : (
          <div className='cvw__root-wrapper'>
            <ColorVisualizerNav setActiveScene={setActiveScene} />
            <ColorDetailsModal />
            <CVWWarningModal />
            <Switch>
              <Route path='/active/color/:colorId/:colorSEO' render={() => <ColorDetails />} />
              <Route path='/active/color-wall(/.*)?' render={() => <ColorWallPage displayAddButton displayInfoButton displayDetailsLink={false} />} />
              <Route path='/active/color-collections' render={() => <ColorCollections isExpertColor={false} {...location.state} />} />
              <Route path='/active/use-our-image' render={() => <SampleScenesWrapper isColorTinted activateScene={activateStockScene} />} />
              <Route path='/active/expert-colors' render={() => <ExpertColorPicks isExpertColor />} />
              <Route path='/active/color-from-image' render={() => <InspiredScene />} />
              <Route path='/active/paint-photo' render={() => <SampleScenesWrapper activateScene={activateStockScene} />} />
              <Route path='/my-ideas-preview' render={() => <MyIdeaPreview openScene={(scene, type) => {
                setActiveScene(scene)
                setLastActiveComponent(type)
              }} />} />
              <Route path='/active/my-ideas' render={() => <MyIdeasContainer />} />
              <Route path='/active/help' render={() => <Help />} />
              <Route>
                <div className={colorDetailsModalShowing ? 'hide-on-small-screens' : ''}>
                  {activeScene}
                </div>
              </Route>
            </Switch>
          </div>
        )
      }
      <div className='cvw__root-container__footer'>
        <div className='cvw__root-container__footer--priority'>
          <LivePalette />
        </div>
        <div className='cvw__root-container__footer--secondary'>
          <SaveOptions activeComponent={lastActiveComponent} />
        </div>
      </div>
    </div>
  )
}

CVW.defaultProps = { ...facetPubSubDefaultProps, ...facetBinderDefaultProps }

export default facetBinder(CVW, 'ColorVisualizerWrapper')
