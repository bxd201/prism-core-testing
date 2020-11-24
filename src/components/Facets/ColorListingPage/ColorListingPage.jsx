import React from 'react'
import facetBinder from 'src/facetSupport/facetBinder'
import { Switch, Route, useParams, useLocation } from 'react-router-dom'
import { ColorWallPage } from '../ColorWallFacet'
import BackToColorWall from './BackToColorWall'
import { ColorDetailsPage } from 'src/components/Facets/ColorDetailsFacet'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import './ColorListingPage.scss'

const ColorDetailsUrlParser = () => (
  <div className='inline-color-details'>
    <BackToColorWall />
    <ColorDetailsPage colorSEO={useParams().colorSEO} />
  </div>
)

export default facetBinder(() => {
  const location = useLocation()
  return (
    <div className='transition-wrapper'>
      <SwitchTransition mode='out-in'>
        <CSSTransition key={location.pathname.indexOf('color-detail')} addEndListener={(node, done) => node.addEventListener('transitionend', done, false)}>
          <Switch location={location}>
            <Route path='/active/color-detail/:colorId/:colorSEO' component={ColorDetailsUrlParser} />
            <Route render={() => <ColorWallPage resetOnUnmount={false} displayDetailsLink displayAddButton={false} />} />
          </Switch>
        </CSSTransition>
      </SwitchTransition>
    </div>
  )
}, 'ColorListingPage')
