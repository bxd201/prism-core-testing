// @flow
import type { Node } from 'react'
import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch,useSelector } from 'react-redux'
import { Redirect,Route, Switch } from 'react-router-dom'
import HeroLoaderExpanded from 'src/components/Loaders/HeroLoader/HeroLoaderExpanded'
import Propper from 'src/components/Propper/Propper'
import ConfigurationContext from '../../../contexts/ConfigurationContext/ConfigurationContext'
import { loadColors } from '../../../store/actions/loadColors'

// kind of a magic number for the time being
const proppingPct = 0.5 * 100

type Props = { children: Node, redirect?: boolean, defaultSection?: string }
export default ({ children, redirect = true, defaultSection }: Props) => {
  const dispatch = useDispatch()
  const reduxSection = useSelector(state => state.colors.structure.find(s => s.default))
  const { brandId } = useContext(ConfigurationContext)
  const { locale } = useIntl()

  useEffect(() => {
    if (!locale || !brandId) return
    dispatch(loadColors(brandId, { language: locale }))
  }, [locale, brandId])

  return (reduxSection
    ? (
      <Switch>
        <Route path={'/color-chunk/:section'}>{children}</Route>
        <Route path={'/color-locator/:colorNumber'}>{children}</Route>
        <Route path={'/color-locator/'}>{children}</Route>
        {redirect && <Redirect to={'/color-locator/'} />}
      </Switch>
      )
    : <Propper vPosition={Propper.V_POSITION.CENTER} propSize={`${proppingPct}%`}>
      <HeroLoaderExpanded />
    </Propper>
  )
}
