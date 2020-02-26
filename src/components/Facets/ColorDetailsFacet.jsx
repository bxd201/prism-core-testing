// @flow
import React, { useState } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'src/constants/globals'
import { facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import type { ColorMap } from 'src/shared/types/Colors.js.flow'
import findKey from 'lodash/findKey'

const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`

type Props = {
  colorId: string,
  colorSEO: string,
  publish: (string, any) => void,
  subscribe: (string, Function) => void,
}

export const ColorDetailsPage = (props: Props) => {
  const [familyLink, setFamilyLink] = useState('not set')
  props.subscribe('prism-family-link', setFamilyLink)

  const colorMap: ColorMap = useSelector(state => state.colors.items.colorMap)
  const {
    colorSEO = 'sw-6475-country-squire',
    colorId = findKey(colorMap, { colorNumber: colorSEO.split('-')[1] })
  } = props

  return (
    <>
      <Redirect to={`${colorDetailsBaseUrl}/${colorId}/${colorSEO}`} />
      <Switch>
        <Route path={`${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`}>
          <ColorDetails
            familyLink={familyLink}
            onColorChanged={newColor => props.publish('prism-new-color', newColor)}
            onSceneChanged={newScene => props.publish('prism-new-scene', newScene)}
            onVariantChanged={newVariant => props.publish('prism-new-variant', newVariant)}
            onColorChipToggled={newPosition => props.publish('prism-color-chip-toggled', newPosition)}
          />
        </Route>
      </Switch>
    </>
  )
}

ColorDetailsPage.defaultProps = { ...facetBinderDefaultProps, ...facetPubSubDefaultProps }

export default facetBinder(ColorDetailsPage, 'ColorDetailsFacet')
