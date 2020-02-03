// @flow
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Switch, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import Search from '../Search/Search'
import SearchBar from '../Search/SearchBar'
import ColorWall from './ColorWall/ColorWall'
import ColorWallToolbar from './ColorWall/ColorWallToolbar'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorWallContext, { colorWallContextDefault, colorWallA11yContextDefault, type ColorWallA11yContextProps } from 'src/components/Facets/ColorWall/ColorWallContext'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import extendIfDefined from '../../shared/helpers/extendIfDefined'
import GenericOverlay from '../Overlays/GenericOverlay/GenericOverlay'
import at from 'lodash/at'
import useEffectAfterMount from '../../shared/hooks/useEffectAfterMount'
import { resetActiveColor, updateColorStatuses } from '../../store/actions/loadColors'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import { FormattedMessage } from 'react-intl'

type Props = FacetPubSubMethods & FacetBinderMethods & {
  colorDetailPageRoot?: string,
  colorWallBgColor?: string,
  displayAddButton?: boolean,
  displayDetailsLink?: boolean,
  resetOnUnmount?: boolean
}

export const EVENTS = {
  emitColor: 'PRISM/out/emitColor',
  colorsLoaded: 'PRISM/out/colorsLoaded',
  decorateColors: 'PRISM/in/decorateColors',
  loading: 'PRISM/in/loading'
}

const searchBarNoLabel = () => <div className='color-wall-wrap__chunk'>
  <FormattedMessage id='SEARCH.FIND_A_COLOR'>
    {(label: string) => (
      <SearchBar showCancelButton label={label} showLabel={false} />
    )}
  </FormattedMessage>
</div>

const ColorWallContain = () => <ColorWall contain />
const SearchContain = () => <Search contain />
const CWToolbar = () => <div className='color-wall-wrap__chunk'>
  <ColorWallToolbar isFamilyPage={false} />
</div>

export const ColorWallPage = (props: Props) => {
  const { displayAddButton, displayDetailsLink, colorWallBgColor, subscribe, publish, unsubscribeAll, colorDetailPageRoot, resetOnUnmount } = props
  const dispatch = useDispatch()

  // -----------------------------------------------------
  // accept and process color decoration from host
  useEffect(() => subscribe(EVENTS.decorateColors, handleColorDecoration), [])
  const handleColorDecoration = useCallback((decoratedColors) => dispatch(updateColorStatuses(decoratedColors)), [])
  const colorMap = useSelector(state => at(state, 'colors.items.colorMap')[0])
  useEffect(() => {
    if (colorMap) {
      publish(EVENTS.colorsLoaded, colorMap)
    }
  }, [colorMap])

  // -----------------------------------------------------
  // handle emitting selected color to host
  const emitColor = useSelector(state => at(state, 'colors.emitColor')[0])
  // on color select AFTER initial mount
  useEffectAfterMount(() => {
    const color = emitColor && emitColor.color
    if (color) {
      // resetWall(true)
      publish(EVENTS.emitColor, color)
    }
  }, [(emitColor && emitColor.timestamp)])

  // -----------------------------------------------------
  // handle host demanding appearance of loading
  const [isLoading, updateLoading] = useState(false)
  useEffect(() => subscribe(EVENTS.loading, updateLoading), [])

  // -----------------------------------------------------
  // build color wall context and a11y state
  const [a11yState, updateA11yState] = useState(colorWallA11yContextDefault)
  const updateA11y = useCallback((data: ColorWallA11yContextProps) => updateA11yState({
    ...a11yState,
    ...data
  }), [a11yState])
  const cwContext = useMemo(() => extendIfDefined({}, colorWallContextDefault, a11yState, {
    colorDetailPageRoot,
    colorWallBgColor,
    displayAddButton,
    displayDetailsLink,
    updateA11y
  }), [colorDetailPageRoot, colorWallBgColor, displayAddButton, displayDetailsLink, updateA11y, a11yState])

  // -----------------------------------------------------
  // handle unmounting
  useEffect(() => () => {
    // unsubscribe from everything on unmount
    unsubscribeAll()
    if (resetOnUnmount) {
      // and reset the color wall's status by resetting active color
      dispatch(resetActiveColor())
    }
  }, [])

  return (
    <ColorWallContext.Provider value={cwContext}>
      <ColorWallRouter>
        <div className='color-wall-wrap'>
          <Switch>
            <Route path='(.*)?/search/:query' component={searchBarNoLabel} />
            <Route path='(.*)?/search' component={searchBarNoLabel} />
            <Route path='(.*)?/section/:section/family/:family' component={CWToolbar} />
            <Route path='(.*)?/section/:section/family/' component={CWToolbar} />
            <Route path='(.*)?/family/:family/' component={CWToolbar} />
            <Route path='(.*)?/family/' component={CWToolbar} />
            <Route component={CWToolbar} />
          </Switch>
          <Switch>
            <Route path='(.*)?/search/:query' component={SearchContain} />
            <Route path='(.*)?/search/' component={SearchContain} />
            <Route component={ColorWallContain} />
          </Switch>
          {isLoading ? <GenericOverlay type={GenericOverlay.TYPES.LOADING} semitransparent /> : null}
        </div>
      </ColorWallRouter>
    </ColorWallContext.Provider>
  )
}

ColorWallPage.defaultProps = {
  ...facetPubSubDefaultProps,
  ...facetBinderDefaultProps,
  resetOnUnmount: true
}

export default facetBinder(ColorWallPage, 'ColorWallFacet')
