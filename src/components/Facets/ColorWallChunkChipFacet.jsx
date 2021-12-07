// @flow
import React, { useMemo, useState } from 'react'
import { Route } from 'react-router-dom'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import ColorWall from './ColorWall/ColorWall'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import extendIfDefined from 'src/shared/helpers/extendIfDefined'
import GenericOverlay from 'src/components/Overlays/GenericOverlay/GenericOverlay'
import translateBooleanFlexibly from 'src/shared/utils/translateBooleanFlexibly.util'
import type { Color } from 'src/shared/types/Colors.js.flow'

type Props = {
  chunkClickable?: boolean,
  chunkMiniMap?: boolean,
  colorDetailPageRoot?: (Color) => string,
  colorNumOnBottom?: boolean,
  colorWallBgColor?: string,
  colorWallPageRoot?: (string) => string,
  displayDetailsLink?: boolean
}

export const ColorWallPage = (props: Props) => {
  const {
    chunkClickable,
    chunkMiniMap,
    colorDetailPageRoot,
    colorNumOnBottom = true,
    colorWallBgColor,
    colorWallPageRoot,
    displayDetailsLink = false
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

  return (
    <ColorWallContext.Provider value={cwContext}>
      <ColorWallRouter>
        <div className='color-wall-wrap' style={{ paddingBottom: '50%' }}>
          <Route component={ColorWall} />
          {isLoading ? <GenericOverlay type={GenericOverlay.TYPES.LOADING} semitransparent /> : null}
        </div>
      </ColorWallRouter>
    </ColorWallContext.Provider>
  )
}

export default facetBinder(ColorWallPage, 'ColorWallChunkChipFacet')
