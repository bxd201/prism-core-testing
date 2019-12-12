// @flow
import React, { useEffect, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import Search from '../Search/Search'
import SearchBar from '../Search/SearchBar'
import ColorWall from './ColorWall/ColorWall'
import ColorWallToolbar from './ColorWall/ColorWallToolbar'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import extendIfDefined from '../../shared/helpers/extendIfDefined'
import GenericOverlay from '../Overlays/GenericOverlay/GenericOverlay'
import at from 'lodash/at'
import useEffectAfterMount from '../../shared/hooks/useEffectAfterMount'
import { resetActiveColor } from '../../store/actions/loadColors'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import { FormattedMessage } from 'react-intl'

type Props = FacetPubSubMethods & FacetBinderMethods & {
  colorDetailPageRoot: string,
  colorWallBgColor?: string,
  displayAddButton?: boolean
}

export const EVENTS = {
  emitColor: 'PRISM/out/change/emitColor',
  loading: 'PRISM/in/loading'
}

const searchBarNoLabel = () => <div className='color-wall-wrap__chunk'>
  <FormattedMessage id='SEARCH.FIND_A_COLOR'>
    {(label: string) => (
      <SearchBar showCancelButton label={label} showLabel={false} />
    )}
  </FormattedMessage>
</div>

export const ColorWallPage = (props: Props) => {
  const { displayAddButton, colorWallBgColor, subscribe, publish, unsubscribeAll, colorDetailPageRoot } = props

  const emitColor = useSelector(state => at(state, 'colors.emitColor')[0])
  const [isLoading, updateLoading] = useState(false)
  const dispatch = useDispatch()

  // on mount
  useEffect(() => {
    subscribe(EVENTS.loading, updateLoading)
  }, [])

  // on unmount
  useEffect(() => () => {
    // unsubscribe from everything on unmount
    unsubscribeAll()
    // and reset the color wall's status by resetting active color
    dispatch(resetActiveColor())
  }, [])

  // on color select AFTER initial mount
  useEffectAfterMount(() => {
    const color = emitColor && emitColor.color
    if (color) {
      // resetWall(true)
      publish(EVENTS.emitColor, color)
    }
  }, [(emitColor && emitColor.timestamp)])

  return (
    <ColorWallContext.Provider value={extendIfDefined({}, colorWallContextDefault, {
      colorDetailPageRoot,
      colorWallBgColor,
      displayAddButton
    })}>
      <ColorWallRouter>
        <div className='color-wall-wrap'>
          <Switch>
            <Route path='(.*)?/search/:query' component={searchBarNoLabel} />
            <Route path='(.*)?/search' component={searchBarNoLabel} />
            <Route path='(.*)?/section/:section/family/:family' component={ColorWallToolbar} />
            <Route path='(.*)?/section/:section/family/' component={ColorWallToolbar} />
            <Route path='(.*)?/family/:family/' component={ColorWallToolbar} />
            <Route path='(.*)?/family/' component={ColorWallToolbar} />
            <Route component={ColorWallToolbar} />
          </Switch>
          <Switch>
            <Route path='(.*)?/search/:query' component={Search} />
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
  ...facetBinderDefaultProps
}

export default facetBinder(ColorWallPage, 'ColorWallFacet')
