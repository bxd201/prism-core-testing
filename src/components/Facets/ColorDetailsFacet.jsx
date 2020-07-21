// @flow
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Route, Redirect, useLocation, useHistory } from 'react-router-dom'
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
import { generateColorDetailsPageUrl } from 'src/shared/helpers/ColorUtils'

const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`

type Props = {
  colorSEO: ?string, // ${brandKey}-${colorNumber}-${kebabCase(name)}
  publish: (string, any) => void,
  subscribe: (string, Function) => void,
}

export const ColorDetailsPage = ({ colorSEO, publish, subscribe }: Props) => {
  loadColors('sherwin')(useDispatch())
  const location = useLocation()
  const history = useHistory()
  const [familyLink: string, setFamilyLink: string => void] = useState('')
  const colorMap: ColorMap = useSelector(store => store.colors.items.colorMap)

  if (!colorMap) { return <HeroLoader /> }

  const colorId: ?ColorId = findKey(colorMap, { colorNumber: colorSEO.match(/\d+/)[0] })
  const color: ?Color = colorId ? colorMap[colorId] : undefined

  subscribe('prism-family-link', setFamilyLink)

  return (colorId && color
    ? (
      <>
        <Redirect to={`${colorDetailsBaseUrl}/${colorId}/${color.brandKey}-${color.colorNumber}-${kebabCase(color.name)}`} />
        {location.pathname !== '/' && (
          <Route path={`${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`}>
            <ColorDetails
              familyLink={familyLink}
              initialColor={color}
              onColorChanged={newColor => {
                publish('prism-new-color', newColor)
                history.push(generateColorDetailsPageUrl(newColor))
              }}
              onSceneChanged={newScene => publish('prism-new-scene', newScene)}
              onVariantChanged={newVariant => publish('prism-new-variant', newVariant)}
              onColorChipToggled={newPosition => publish('prism-color-chip-toggled', newPosition)}
            />
          </Route>
        )}
      </>
    )
    : (
      <GenericMessage type={GenericMessage.TYPES.ERROR}>
        <FormattedMessage id='UNSPECIFIED_COLOR' />
      </GenericMessage>
    )
  )
}

ColorDetailsPage.defaultProps = { ...facetBinderDefaultProps, ...facetPubSubDefaultProps }

export default facetBinder(ColorDetailsPage, 'ColorDetailsFacet')
