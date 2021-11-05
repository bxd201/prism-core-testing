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

type Props = {
  chunkClickable?: boolean,
  chunkMiniMap?: boolean,
  colorDetailPageRoot?: string,
  colorNumOnBottom?: boolean,
  colorWallBgColor?: string,
  colorWallChunkPageRoot?: string,
  displayDetailsLink?: boolean,
  hideChunkLabel?: boolean
}

export const ColorWallPage = (props: Props) => {
  const baseHostUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))
  const {
    chunkClickable,
    chunkMiniMap,
    colorDetailPageRoot = baseHostUrl,
    colorNumOnBottom = true,
    colorWallBgColor,
    colorWallChunkPageRoot = baseHostUrl,
    displayDetailsLink = false,
    hideChunkLabel
  } = props
  const [isLoading] = useState(false)
  const cwContext = useMemo(() => extendIfDefined({}, colorWallContextDefault, {
    chunkClickable: translateBooleanFlexibly(chunkClickable),
    chunkMiniMap: translateBooleanFlexibly(chunkMiniMap),
    colorDetailPageRoot,
    colorNumOnBottom,
    colorWallBgColor,
    colorWallChunkPageRoot,
    displayDetailsLink: translateBooleanFlexibly(displayDetailsLink),
    hideChunkLabel: translateBooleanFlexibly(hideChunkLabel)
  }), [chunkClickable, chunkMiniMap, colorDetailPageRoot, colorNumOnBottom, colorWallBgColor, colorWallChunkPageRoot, displayDetailsLink, hideChunkLabel])

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
