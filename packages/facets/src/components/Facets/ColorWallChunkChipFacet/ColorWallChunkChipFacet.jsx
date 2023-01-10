// @flow
import React, { useContext, useEffect,useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import facetBinder from 'src/facetSupport/facetBinder'
import extendIfDefined from 'src/shared/helpers/extendIfDefined'
import type { Color } from 'src/shared/types/Colors.js.flow'
import translateBooleanFlexibly from 'src/shared/utils/translateBooleanFlexibly.util'
import { loadColors } from 'src/store/actions/loadColors'
import ColorWallRouter from '../ColorWall/ColorWallRouter'
import ColorWallV3 from '../ColorWall/ColorWallV3'
import '../ColorWall/ColorWall.scss'

type Props = {
  autoHeight?: boolean,
  chunkClickable?: boolean,
  chunkMiniMap?: boolean,
  colorDetailPageRoot?: (Color) => string,
  colorWallBgColor?: string,
  colorWallPageRoot?: (string) => string,
  displayDetailsLink?: boolean,
  leftHandDisplay?: boolean,
  wallBanner?: string
}

export const ColorWallChunkChipFacet = (props: Props) => {
  const {
    autoHeight,
    chunkClickable,
    chunkMiniMap,
    colorDetailPageRoot,
    colorWallBgColor,
    colorWallPageRoot,
    displayDetailsLink = false,
    leftHandDisplay,
    wallBanner
  } = props
  const cwContext = useMemo(() => extendIfDefined({}, colorWallContextDefault, {
    autoHeight: translateBooleanFlexibly(autoHeight),
    chunkClickable: translateBooleanFlexibly(chunkClickable),
    chunkMiniMap: translateBooleanFlexibly(chunkMiniMap),
    colorDetailPageRoot,
    colorWallBgColor,
    colorWallPageRoot,
    displayDetailsLink: translateBooleanFlexibly(displayDetailsLink),
    isChipLocator: true,
    leftHandDisplay: translateBooleanFlexibly(leftHandDisplay)
  }), [autoHeight, chunkClickable, chunkMiniMap, colorDetailPageRoot, colorWallBgColor, colorWallPageRoot, displayDetailsLink, leftHandDisplay])

  const { brandId } = useContext(ConfigurationContext)
  const dispatch = useDispatch()
  const { locale } = useIntl()

  useEffect(() => {
    if (!locale || !brandId) return
    // @todo we could refactor so that comps rely on useColor hook -RS
    dispatch(loadColors(brandId, { language: locale }))
  }, [locale, brandId])

  return (
    <ColorWallContext.Provider value={cwContext}>
      <ColorWallRouter defaultSection={undefined}>
        <div style={{ margin: '0 1em' }}>
          <h1 className='color-wall__title'>Find Chip.</h1>
          <h2 className='color-wall__subtitle'>Click on a section to view colors</h2>
          {wallBanner
            ? <img src={wallBanner} style={{ maxWidth: '100%', margin: '0 auto .5em' }} />
            : null }
          <ColorWallV3 />
        </div>
      </ColorWallRouter>
    </ColorWallContext.Provider>
  )
}

export default facetBinder(ColorWallChunkChipFacet, 'ColorWallChunkChipFacet')
