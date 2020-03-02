// @flow
import React, { useState } from 'react'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'src/constants/globals'
import { facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import GenericMessage from '../Messages/GenericMessage'
import { FormattedMessage } from 'react-intl'

const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`

type Props = {
  colorId: string,
  colorSEO: string,
  publish: (string, any) => void,
  subscribe: (string, Function) => void,
}

export const ColorDetailsPage = ({ colorId, colorSEO, publish, subscribe }: Props) => {
  const [familyLink, setFamilyLink] = useState('not set')
  subscribe('prism-family-link', setFamilyLink)
  const location = useLocation()

  return colorId && colorSEO
    ? <>
      <Redirect to={`${colorDetailsBaseUrl}/${colorId}/${colorSEO}`} />
      <Switch>
        <Route path={`${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`}>
          {location.pathname !== '/' && (
            <ColorDetails
              familyLink={familyLink}
              onColorChanged={newColor => publish('prism-new-color', newColor)}
              onSceneChanged={newScene => publish('prism-new-scene', newScene)}
              onVariantChanged={newVariant => publish('prism-new-variant', newVariant)}
              onColorChipToggled={newPosition => publish('prism-color-chip-toggled', newPosition)}
            />
          )}
        </Route>
      </Switch>
    </>
    : <GenericMessage type={GenericMessage.TYPES.ERROR}>
      <FormattedMessage id='UNSPECIFIED_COLOR' />
    </GenericMessage>
}

ColorDetailsPage.defaultProps = { ...facetBinderDefaultProps, ...facetPubSubDefaultProps }

export default facetBinder(ColorDetailsPage, 'ColorDetailsFacet')
