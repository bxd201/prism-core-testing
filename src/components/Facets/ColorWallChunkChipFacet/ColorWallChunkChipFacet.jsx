// @flow
import React, { useMemo, useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import extendIfDefined from 'src/shared/helpers/extendIfDefined'
import translateBooleanFlexibly from 'src/shared/utils/translateBooleanFlexibly.util'
import type { Color } from 'src/shared/types/Colors.js.flow'
import { useIntl } from 'react-intl'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { loadColors } from 'src/store/actions/loadColors'
import Router from './Router'
import ColorWallAdapter from './ColorWallAdapter'

type Props = {
  chunkClickable?: boolean,
  chunkMiniMap?: boolean,
  colorDetailPageRoot?: (Color) => string,
  colorNumOnBottom?: boolean,
  colorWallBgColor?: string,
  colorWallPageRoot?: (string) => string,
  displayDetailsLink?: boolean,
  wallBanner?: string
}

export const ColorWallChunkChipFacet = (props: Props) => {
  const {
    chunkClickable,
    chunkMiniMap,
    colorDetailPageRoot,
    colorNumOnBottom = true,
    colorWallBgColor,
    colorWallPageRoot,
    displayDetailsLink = false,
    wallBanner
  } = props
  const cwContext = useMemo(() => extendIfDefined({}, colorWallContextDefault, {
    chunkClickable: translateBooleanFlexibly(chunkClickable),
    chunkMiniMap: translateBooleanFlexibly(chunkMiniMap),
    colorDetailPageRoot,
    colorNumOnBottom,
    colorWallBgColor,
    colorWallPageRoot,
    displayDetailsLink: translateBooleanFlexibly(displayDetailsLink)
  }), [chunkClickable, chunkMiniMap, colorDetailPageRoot, colorNumOnBottom, colorWallBgColor, colorWallPageRoot, displayDetailsLink])

  const dispatch = useDispatch()
  const { brandId } = useContext(ConfigurationContext)
  const { locale } = useIntl()

  const reduxSection = useSelector(state => state.colors.structure.find(s => s.default))

  useEffect(() => {
    if (!locale || !brandId) return
    dispatch(loadColors(brandId, { language: locale }))
  }, [ locale, brandId ])

  return (
    <ColorWallContext.Provider value={cwContext}>
      { reduxSection && <Router>
        <ColorWallAdapter wallBanner={wallBanner} />
      </Router>}
    </ColorWallContext.Provider>
  )
}

export default facetBinder(ColorWallChunkChipFacet, 'ColorWallChunkChipFacet')
