// @flow
import React, { useMemo } from 'react'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import facetBinder from 'src/facetSupport/facetBinder'
import extendIfDefined from 'src/shared/helpers/extendIfDefined'
import type { Color } from 'src/shared/types/Colors.js.flow'
import translateBooleanFlexibly from 'src/shared/utils/translateBooleanFlexibly.util'
import ColorWallRouter from '../ColorWall/ColorWallRouter'
import ColorWallV3 from '../ColorWall/ColorWallV3'

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
  const cwContext = useMemo(
    () =>
      extendIfDefined({}, colorWallContextDefault, {
        autoHeight: translateBooleanFlexibly(autoHeight),
        chunkClickable: translateBooleanFlexibly(chunkClickable),
        chunkMiniMap: translateBooleanFlexibly(chunkMiniMap),
        colorDetailPageRoot,
        colorWallBgColor,
        colorWallPageRoot,
        displayDetailsLink: translateBooleanFlexibly(displayDetailsLink),
        isChipLocator: true,
        leftHandDisplay: translateBooleanFlexibly(leftHandDisplay)
      }),
    [
      autoHeight,
      chunkClickable,
      chunkMiniMap,
      colorDetailPageRoot,
      colorWallBgColor,
      colorWallPageRoot,
      displayDetailsLink,
      leftHandDisplay
    ]
  )

  return (
    <ColorWallContext.Provider value={cwContext}>
      <ColorWallRouter defaultSection={undefined}>
        {wallBanner && <img src={wallBanner} style={{ maxWidth: '100%', margin: '0 auto .5em' }} />}
        <ColorWallV3 />
      </ColorWallRouter>
    </ColorWallContext.Provider>
  )
}

export default facetBinder(ColorWallChunkChipFacet, 'ColorWallChunkChipFacet')
