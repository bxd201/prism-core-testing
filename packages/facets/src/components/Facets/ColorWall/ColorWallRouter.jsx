// @flow
import React, { useContext, useEffect, useState } from 'react'
import type { Node } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import ConfigurationContext from '../../../contexts/ConfigurationContext/ConfigurationContext'
import { filterBySection, loadColors } from '../../../store/actions/loadColors'
import kebabCase from 'lodash/kebabCase'
import HeroLoaderExpanded from 'src/components/Loaders/HeroLoader/HeroLoaderExpanded'
import Propper from 'src/components/Propper/Propper'
import { ROUTES_ENUM } from '../ColorVisualizerWrapper/routeValueCollections'

// kind of a magic number for the time being
// the color wall is fixed at 475px at the moment, with a max width of 990 on SW.com
// because of that, this gives us a percentage roughly equal to its aspect ratio
const proppingPct = 475 / 990 * 100

type Props = { children: Node, redirect?: boolean, defaultSection?: string }
export default ({ children, redirect = true, defaultSection }: Props) => {
  const dispatch = useDispatch()
  // TODO: update this based on cwv3 flag to use groups instead of structure
  const {
    groups, section: reduxCurrentSection, structure, cwv3, status: { requestComplete, error }
  } = useSelector(state => state.colors)

  const reduxDefaultSection = (() => {
    if ((!cwv3 && (!structure || structure.length === 0)) || (cwv3 && (!groups || groups.length === 0))) {
      return null
    }

    return cwv3 ? groups.find(s => s.default) : structure.find(s => s.default)
  })()

  const { brandId } = useContext(ConfigurationContext)
  const { locale } = useIntl()
  const [redirectSection, setRedirectSection] = useState('')

  useEffect(() => {
    if (!locale || !brandId) return
    dispatch(loadColors(brandId, { language: locale }))
  }, [ locale, brandId ])

  // STEP 1 -- finds default section based on data or props override for redirect section
  useEffect(() => {
    if (reduxDefaultSection) {
      const _section = kebabCase(defaultSection === undefined ? reduxDefaultSection.name : defaultSection)
      setRedirectSection(_section)
    }
  }, [defaultSection, reduxDefaultSection])

  // STEP 2 -- will filter by redirect section if no current redux section exists
  useEffect(() => {
    if (redirectSection && !reduxCurrentSection) {
      dispatch(filterBySection(redirectSection))
    }
  }, [reduxCurrentSection, redirectSection])

  return (requestComplete && !error
    ? (
      <Switch>
        <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section/family/:family/color/:colorId/:colorName/search/'}>{children}</Route>
        <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section/family/:family/color/:colorId/:colorName'}>{children}</Route>
        <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section/family/:family/search/'}>{children}</Route>
        <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section/family/:family'}>{children}</Route>
        <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section/family'}>{children}</Route>
        <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section/color/:colorId/:colorName/family/'}>{children}</Route>
        <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section/color/:colorId/:colorName/search/'}>{children}</Route>
        <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section/color/:colorId/:colorName'}>{children}</Route>
        <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section/search/'}>{children}</Route>
        <Route path={ROUTES_ENUM.COLOR_WALL + '/section/:section'}>{children}</Route>
        {redirect && <Redirect to={ROUTES_ENUM.COLOR_WALL + `/section/${redirectSection}`} />}
      </Switch>
    )
    : <Propper vPosition={Propper.V_POSITION.CENTER} propSize={`${proppingPct}%`}>
      <HeroLoaderExpanded />
    </Propper>
  )
}
