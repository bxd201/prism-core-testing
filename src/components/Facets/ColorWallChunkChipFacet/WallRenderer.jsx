// @flow
import React, { useContext, useEffect, useRef, useState } from 'react'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import noop from 'lodash/noop'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { loadColors } from '../../../store/actions/loadColors'
import { Row, Col, Swatch, Wall, Chunk } from './GridParts'
import { BASE_SWATCH_SIZE, CHUNK_SPACING } from './constants'
import ColorWallContext, { type ColorWallContextProps } from '../ColorWall/ColorWallContext'

function makeGrid (w = 1, h = 1, doFill = noop, colors = []) {
  return new Array(h).fill(null).map((arr, yI) => new Array(w).fill(null).map((it, xI) => {
    return doFill(xI, yI, colors[xI + yI * w])
  }))
}

type WallRendererProps = {
  maxWidth?: number,
  maxHeight?: number
}

function WallRenderer ({ maxWidth = Infinity, maxHeight = Infinity }: WallRendererProps) {
  const dispatch = useDispatch()
  const { inactiveColorRouteBuilderRef }: ColorWallContextProps = useContext(ColorWallContext)
  const { brandId } = useContext(ConfigurationContext)
  const { items: { colorMap, chunksLayout } }: ColorsState = useSelector(state => state.colors)
  const [wall, setWall] = useState(null)
  const { locale } = useIntl()
  const swatchPropsRef = useRef({
    size: BASE_SWATCH_SIZE,
    spacing: CHUNK_SPACING
  })

  const onChunkClicked = color => {
    inactiveColorRouteBuilderRef && inactiveColorRouteBuilderRef.current && inactiveColorRouteBuilderRef.current(color)
  }

  useEffect(() => {
    if (!locale || !brandId) return
    dispatch(loadColors(brandId, { language: locale }))
  }, [ locale, brandId ])

  useEffect(() => {
    if (!colorMap || !chunksLayout) return

    const { chunks } = chunksLayout

    if (brandId === 'valspar') {
      const shapeValspar = new Wall([
        new Row([
          new Col([
            new Row([
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[1].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[1].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[2].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[2].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[3].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[3].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[4].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[4].chunk[0][0]]))
              ], null, true, swatchPropsRef)
            ], null, true, swatchPropsRef),
            new Row([
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[5].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[5].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[6].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[6].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[7].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[7].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[8].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[8].chunk[0][0]]))
              ], null, true, swatchPropsRef)
            ], null, true, swatchPropsRef),
            new Row([
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[9].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[9].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[10].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[10].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[11].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[11].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[12].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[12].chunk[0][0]]))
              ], null, true, swatchPropsRef)
            ], null, true, swatchPropsRef),
            new Row([
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[13].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[13].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[14].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[14].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[15].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[15].chunk[0][0]]))
              ], null, true, swatchPropsRef),
              new Col([
                new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[16].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[16].chunk[0][0]]))
              ], null, true, swatchPropsRef)
            ], null, true, swatchPropsRef)
          ], null, false, swatchPropsRef),
          new Col([
            new Row([
              new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[17].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[17].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[19].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[19].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(12, 7, (x, y, color) => new Swatch(undefined, color, swatchPropsRef), chunks[18].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[18].chunk[0][0]]))
            ], null, true, swatchPropsRef)
          ], null, true, swatchPropsRef)
        ], null, false, swatchPropsRef)
      ], swatchPropsRef)

      setWall(shapeValspar)
    } else if (brandId === 'hgsw') {
      let basicRef, largeRef

      const shapeHgsw = new Wall([
        new Row([
          new Col([
            new Row([
              new Chunk(makeGrid(21, 3, (xI, yI, color) => {
                if (xI === 0 && yI === 0) {
                  basicRef = new Swatch(undefined, color, swatchPropsRef)
                  return basicRef
                }
                return new Swatch(undefined, color, swatchPropsRef)
              }, chunks[1].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[1].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(21, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[1].chunk[1].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[1].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(15, 3, (xI, yI, color) => {
                if (xI === 0 && yI === 0) {
                  largeRef = new Swatch(undefined, color, swatchPropsRef)
                  return largeRef
                }
                return new Swatch(undefined, color, swatchPropsRef)
              }, chunks[5].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[5].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(15, 3, (xI, yI, color) => new Swatch(largeRef, color, swatchPropsRef), chunks[5].chunk[1].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[5].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(21, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[6].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[6].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(21, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[6].chunk[1].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[6].chunk[0][0]]))
            ], null, true, swatchPropsRef)
          ], null, true, swatchPropsRef),
          new Col([
            new Row([
              new Chunk(makeGrid(13, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[2].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[2].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(13, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[2].chunk[1].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[2].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(10, 3, (xI, yI, color) => new Swatch(largeRef, color, swatchPropsRef), chunks[9].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[9].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(10, 3, (xI, yI, color) => new Swatch(largeRef, color, swatchPropsRef), chunks[9].chunk[1].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[9].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(13, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[7].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[7].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(13, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[7].chunk[1].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[7].chunk[0][0]]))
            ], null, true, swatchPropsRef)
          ], null, true, swatchPropsRef),
          new Col([
            new Row([
              new Chunk(makeGrid(21, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[3].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[3].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(21, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[3].chunk[1].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[3].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(15, 3, (xI, yI, color) => new Swatch(largeRef, color, swatchPropsRef), chunks[4].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[4].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(15, 3, (xI, yI, color) => new Swatch(largeRef, color, swatchPropsRef), chunks[4].chunk[1].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[4].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(21, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[8].chunk[0].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[8].chunk[0][0]]))
            ], null, true, swatchPropsRef),
            new Row([
              new Chunk(makeGrid(21, 3, (xI, yI, color) => new Swatch(basicRef, color, swatchPropsRef), chunks[8].chunk[1].map(id => colorMap[id])), null, () => onChunkClicked(colorMap[chunks[8].chunk[0][0]]))
            ], null, true, swatchPropsRef)
          ], null, true, swatchPropsRef)
        ], null, false, swatchPropsRef)
      ], swatchPropsRef)

      setWall(shapeHgsw)
    }
  }, [colorMap, brandId, chunksLayout])

  return <div>
    {wall
      // this container needs to be responsible for forming the "window" in which the color wall exists
      ? wall.render({ maxWidth: maxWidth })
      : null}
  </div>
}

export default WallRenderer
