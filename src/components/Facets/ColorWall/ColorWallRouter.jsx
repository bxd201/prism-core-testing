// @flow
import React, { useContext, useEffect } from 'react'
import type { Node } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import ConfigurationContext from '../../../contexts/ConfigurationContext/ConfigurationContext'
import { loadColors } from '../../../store/actions/loadColors'
import kebabCase from 'lodash/kebabCase'
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
        <Route path='/active/color-wall/section/:section/family/:family/color/:colorId/:colorName/search/'>{children}</Route>
        <Route path='/active/color-wall/section/:section/family/:family/color/:colorId/:colorName'>{children}</Route>
        <Route path='/active/color-wall/section/:section/family/:family/search/'>{children}</Route>
        <Route path='/active/color-wall/section/:section/family/:family'>{children}</Route>
        <Route path='/active/color-wall/section/:section/family'>{children}</Route>
        <Route path='/active/color-wall/section/:section/color/:colorId/:colorName/family/'>{children}</Route>
        <Route path='/active/color-wall/section/:section/color/:colorId/:colorName/search/'>{children}</Route>
        <Route path='/active/color-wall/section/:section/color/:colorId/:colorName'>{children}</Route>
        <Route path='/active/color-wall/section/:section/search/'>{children}</Route>
        <Route path='/active/color-wall/section/:section'>{children}</Route>
        {redirect && <Redirect to={`/active/color-wall/section/${kebabCase(defaultSection === undefined ? reduxSection.name : defaultSection)}`} />}
      </Switch>
    )
    : <Propper vPosition={Propper.V_POSITION.CENTER} propSize={`${proppingPct}%`}>
      <HeroLoaderExpanded />
    </Propper>
  )
}
