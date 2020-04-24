// @flow
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Switch, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import Search from 'src/components/Search/Search'
import SearchBar from 'src/components/Search/SearchBar'
import ColorWall from './ColorWall/ColorWall'
import ColorWallToolbar from './ColorWall/ColorWallToolbar/ColorWallToolbar'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import extendIfDefined from 'src/shared/helpers/extendIfDefined'
import GenericOverlay from 'src/components/Overlays/GenericOverlay/GenericOverlay'
import at from 'lodash/at'
import isArray from 'lodash/isArray'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { resetActiveColor, updateColorStatuses } from 'src/store/actions/loadColors'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import { FormattedMessage } from 'react-intl'
import translateBooleanFlexibly from 'src/shared/utils/translateBooleanFlexibly.util'

type Props = FacetPubSubMethods & FacetBinderMethods & {
  addButtonText?: string,
  colorDetailPageRoot?: string,
  colorWallBgColor?: string,
  displayAddButton?: boolean,
  displayAddButtonText?: boolean,
  displayDetailsLink?: boolean,
  hiddenSections?: string | string[], // as string, "section name 1" or "section name 1|section name 2|etc" will be parsed into an array
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

const SearchContain = () => <Search contain />
const CWToolbar = () => <div className='color-wall-wrap__chunk'>
  <ColorWallToolbar isFamilyPage={false} />
</div>

export const ColorWallPage = (props: Props) => {
  const { addButtonText, displayAddButton = false, displayAddButtonText, displayDetailsLink = true, colorWallBgColor, subscribe, publish, unsubscribeAll, colorDetailPageRoot, resetOnUnmount, hiddenSections } = props
  const dispatch = useDispatch()

  // -----------------------------------------------------
  // accept and process color decoration from host
  useEffect(() => subscribe(EVENTS.decorateColors, handleColorDecoration), [])
  const handleColorDecoration = useCallback((decoratedColors) => dispatch(updateColorStatuses(decoratedColors)), [])
  const colorMap = useSelector(state => at(state, 'colors.items.colorMap')[0])
  useEffect(() => { colorMap && publish(EVENTS.colorsLoaded, colorMap) }, [colorMap])

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
  useEffect(() => {
    subscribe(EVENTS.loading, updateLoading)
    return unsubscribeAll
  }, [])

  // -----------------------------------------------------
  // handle hidden sections
  const processedHiddenSections = useMemo(() => {
    if (typeof hiddenSections === 'string') {
      // hiddenSections is a single pipe-delimited string; break it into an array here before it gets into context
      return hiddenSections.split('|')
    } else if (isArray(hiddenSections)) {
      return hiddenSections
    }

    return []
  }, [ hiddenSections ])

  // -----------------------------------------------------
  // build color wall context and a11y state
  const cwContext = useMemo(() => extendIfDefined({}, colorWallContextDefault, {
    addButtonText,
    colorDetailPageRoot,
    colorWallBgColor,
    displayAddButton: translateBooleanFlexibly(displayAddButton),
    displayAddButtonText: translateBooleanFlexibly(displayAddButtonText),
    displayDetailsLink: translateBooleanFlexibly(displayDetailsLink),
    hiddenSections: processedHiddenSections
  }), [addButtonText, colorDetailPageRoot, colorWallBgColor, displayAddButton, displayAddButtonText, displayDetailsLink])

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
          <nav>
            <Switch>
              <Route path='(.*)?/search/:query' component={searchBarNoLabel} />
              <Route path='(.*)?/search' component={searchBarNoLabel} />
              <Route path='(.*)?/section/:section/family/:family' component={CWToolbar} />
              <Route path='(.*)?/section/:section/family/' component={CWToolbar} />
              <Route path='(.*)?/family/:family/' component={CWToolbar} />
              <Route path='(.*)?/family/' component={CWToolbar} />
              <Route component={CWToolbar} />
            </Switch>
          </nav>
          <Switch>
            <Route path='(.*)?/search/:query' component={SearchContain} />
            <Route path='(.*)?/search/' component={SearchContain} />
            <Route component={ColorWall} />
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
