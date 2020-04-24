// @flow
import React, { useState } from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { Route, Redirect, useLocation } from 'react-router-dom'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'src/constants/globals'
import { facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import GenericMessage from '../Messages/GenericMessage'
import { FormattedMessage } from 'react-intl'
import type { ColorMap, Color, ColorId } from 'src/shared/types/Colors.js.flow'
import findKey from 'lodash/findKey'
import kebabCase from 'lodash/kebabCase'
import { loadColors } from 'src/store/actions/loadColors'
import HeroLoader from '../Loaders/HeroLoader/HeroLoader'

const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`

type Props = {
  colorSEO: string,
  publish: (string, any) => void,
  subscribe: (string, Function) => void,
}

export const ColorDetailsPage = ({ colorSEO, publish, subscribe }: Props) => {
  loadColors('sherwin')(useDispatch())
  const [familyLink, setFamilyLink] = useState('not set')
  const location = useLocation()
  const colorMap: ColorMap = useSelector(state => state.colors.items.colorMap, shallowEqual)

  if (!colorMap) return <HeroLoader />

  subscribe('prism-family-link', setFamilyLink)

  const colorId: ?ColorId = findKey(colorMap, { colorNumber: colorSEO.match(/\d+/)[0] })
  if (!colorId) {
    return (
      <GenericMessage type={GenericMessage.TYPES.ERROR}>
        <FormattedMessage id='UNSPECIFIED_COLOR' />
      </GenericMessage>
    )
  }

  const { brandKey, name, colorNumber }: Color = colorMap[colorId]
  return (
    <>
      <Redirect to={`${colorDetailsBaseUrl}/${colorId}/${brandKey}-${colorNumber}-${kebabCase(name)}`} />
      {location.pathname !== '/' && (
        <Route path={`${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`}>
          <ColorDetails
            familyLink={familyLink}
            onColorChanged={newColor => publish('prism-new-color', newColor)}
            onSceneChanged={newScene => publish('prism-new-scene', newScene)}
            onVariantChanged={newVariant => publish('prism-new-variant', newVariant)}
            onColorChipToggled={newPosition => publish('prism-color-chip-toggled', newPosition)}
          />
        </Route>
      )}
    </>
  )
}

ColorDetailsPage.defaultProps = { ...facetBinderDefaultProps, ...facetPubSubDefaultProps }

export default facetBinder(ColorDetailsPage, 'ColorDetailsFacet')
