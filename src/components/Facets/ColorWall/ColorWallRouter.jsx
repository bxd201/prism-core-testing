// @flow
import React, { useContext } from 'react'
import type { Node } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import ConfigurationContext from '../../../contexts/ConfigurationContext/ConfigurationContext'
import { loadColors } from '../../../store/actions/loadColors'
import kebabCase from 'lodash/kebabCase'
import HeroLoaderExpanded from 'src/components/Loaders/HeroLoader/HeroLoaderExpanded'

type Props = { children: Node, redirect?: boolean }
export default ({ children, redirect = true }: Props) => {
  useDispatch()(loadColors(useContext(ConfigurationContext).brandId, { language: useIntl().locale }))
  const defaultSection = useSelector(state => state.colors.structure.find(s => s.default))

  return (defaultSection
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
        {redirect && <Redirect to={`/active/color-wall/section/${kebabCase(defaultSection.name)}`} />}
      </Switch>
    )
    : <HeroLoaderExpanded />
  )
}
