// @flow
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import { Route, Switch, useLocation,useParams } from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import { ColorDetailsPage } from 'src/components/Facets/ColorDetailsFacet'
import facetBinder from 'src/facetSupport/facetBinder'
import ConfigurationContext from '../../../contexts/ConfigurationContext/ConfigurationContext'
import { ColorWallPage } from '../ColorWallFacet'
import BackToColorWall from './BackToColorWall'
import './ColorListingPage.scss'

const ColorWallCDP = () => {
  const { locale } = useIntl()
  const { brandId } = useContext(ConfigurationContext)
  return (
    <div className='inline-color-details'>
      <BackToColorWall />
      <ColorDetailsPage colorSEO={useParams().colorSEO} brand={brandId} language={locale} />
    </div>
  )
}

type ColorListingPageProps = {
  brand: string,
  language: string
}

export default facetBinder((props: ColorListingPageProps) => {
  const location = useLocation()
  return (
    <div className='transition-wrapper'>
      <SwitchTransition mode='out-in'>
        <CSSTransition key={location.pathname.indexOf('color-detail')} addEndListener={(node, done) => node.addEventListener('transitionend', done, false)}>
          <Switch location={location}>
            <Route path='/active/color-detail/:colorId/:colorSEO' render={() => <ColorWallCDP language={props.language} brand={props.brand} />} />
            <Route render={() => <ColorWallPage resetOnUnmount={false} displayDetailsLink displayAddButton={false} />} />
          </Switch>
        </CSSTransition>
      </SwitchTransition>
    </div>
  )
}, 'ColorListingPage')
