/* eslint-disable */
// @flow
import React, { useMemo, useState, useContext, useEffect } from 'react'
import { Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import ColorWall from './ColorWall/ColorWall'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import extendIfDefined from 'src/shared/helpers/extendIfDefined'
import GenericOverlay from 'src/components/Overlays/GenericOverlay/GenericOverlay'
import translateBooleanFlexibly from 'src/shared/utils/translateBooleanFlexibly.util'
import type { Color } from 'src/shared/types/Colors.js.flow'
import { useIntl } from 'react-intl'
import ConfigurationContext from '../../contexts/ConfigurationContext/ConfigurationContext'
import { loadColors } from '../../store/actions/loadColors'
import Router from './ColorWallChunkChipFacet/Router'
import ColorWallAdapter from './ColorWallChunkChipFacet/ColorWallAdapter'

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
  const [isLoading] = useState(false)
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
  const colorMap = useSelector(state => state.colors?.items?.colorMap)

  useEffect(() => {
    if (!locale || !brandId) return
    dispatch(loadColors(brandId, { language: locale }))
  }, [ locale, brandId ])

  return (
    <ColorWallContext.Provider value={cwContext}>
      {/* TODO: it's own loader. we're not using color wall router to handle this stuff */}
      { reduxSection && <Router>
        <ColorWallAdapter wallBanner={wallBanner} />
      </Router>}

      {/* <ColorWall section='clean & bright 1/3' colorId='5' /> } */}
      {/* <ColorWallRouter>
        <div className='color-wall-wrap' style={{ height: '100%', paddingBottom: '50%' }}>
          <Route component={ColorWall} />
          {isLoading ? <GenericOverlay type={GenericOverlay.TYPES.LOADING} semitransparent /> : null}
        </div>
      </ColorWallRouter> */}
    </ColorWallContext.Provider>
  )
}

export default facetBinder(ColorWallChunkChipFacet, 'ColorWallChunkChipFacet')
