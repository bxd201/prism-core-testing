// @flow
import React, { useContext, useEffect } from 'react'
import type { Node } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import ConfigurationContext from '../../../contexts/ConfigurationContext/ConfigurationContext'
import { loadColors } from '../../../store/actions/loadColors'
import HeroLoaderExpanded from 'src/components/Loaders/HeroLoader/HeroLoaderExpanded'
import Propper from 'src/components/Propper/Propper'

// kind of a magic number for the time being
// the color wall is fixed at 475px at the moment, with a max width of 990 on SW.com
// because of that, this gives us a percentage roughly equal to its aspect ratio
const proppingPct = 475 / 990 * 100

type Props = { children: Node, redirect?: boolean, defaultSection?: string }
export default ({ children, redirect = true, defaultSection }: Props) => {
  const dispatch = useDispatch()
  const reduxSection = useSelector(state => state.colors.structure.find(s => s.default))
  const { brandId } = useContext(ConfigurationContext)
  const { locale } = useIntl()

  useEffect(() => {
    if (!locale || !brandId) return
    dispatch(loadColors(brandId, { language: locale }))
  }, [ locale, brandId ])

  return (reduxSection
    ? (
      <Switch>
        <Route path={'/color-chunk/:section'}>{children}</Route>
        <Route path={'/color-locator/:colorNumber'}>{children}</Route>
        <Route path={'/color-locator/'}>{children}</Route>
        {redirect && <Redirect to={`/color-locator/`} />}
      </Switch>
    )
    : <Propper vPosition={Propper.V_POSITION.CENTER} propSize={`${proppingPct}%`}>
      <HeroLoaderExpanded />
    </Propper>
  )
}
