import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import isSomething from '../../utils/isSomething'
import { ColorWallPropsContext, ColorWallStructuralPropsContext } from './color-wall-props-context'
import ColorWallSwatch from './color-wall-swatch'
import { computeChunk } from './shared-reducers-and-computers'
import Titles from './title'
import { ChunkShape } from './types'
import { getAlignment, parseColorId } from './wall-utils'

interface ChunkProps {
  data: ChunkShape
  id: string
  updateHeight: (height: any) => void
  updateWidth: (width: any) => void
}

function Chunk({ data, id = '', updateHeight, updateWidth }: ChunkProps): JSX.Element {
  const { titles, props: chunkProps = {} } = data
  const { align = 'start' } = chunkProps
  const ctx = useContext(ColorWallPropsContext)
  const structuralCtx = useContext(ColorWallStructuralPropsContext)
  const {
    animateActivation,
    activeSwatchContentRenderer,
    activeSwatchId,
    addChunk,
    chunkClickable,
    colorWallConfig,
    getPerimeterLevel,
    isZoomed,
    setActiveSwatchId,
    colorResolver,
    swatchRenderer,
    swatchBgRenderer
  } = ctx
  const [horzSpace, setHorzSpace] = useState(0)
  const [vertSpace, setVertSpace] = useState(0)
  const [swatchWidth, setSwatchWidth] = useState(0)
  const [swatchHeight, setSwatchHeight] = useState(0)
  const chunkRef = useRef<HTMLElement>()
  const swatchRefs = useRef([])
  const swatchRefsMap = useRef<Record<string, number>>({})

  useEffect(() => {
    const results = computeChunk(data, structuralCtx)

    if (results) {
      const { horizontalSpace, outerHeight, outerWidth, verticalSpace, swatchHeight, swatchWidth } = results
      setHorzSpace(horizontalSpace)
      setVertSpace(verticalSpace)
      updateWidth(outerWidth)
      updateHeight(outerHeight)
      setSwatchHeight(swatchHeight)
      setSwatchWidth(swatchWidth)
    }
  }, [data, structuralCtx])

  useEffect(() => {
    addChunk({
      chunkRef,
      swatchesRef: swatchRefs,
      id: id,
      data: data
    })
  }, [])

  const addToSwatchRefs = useCallback(
    (id: string | number) =>
      (swatches: HTMLButtonElement[]): void => {
        const refIndex = swatchRefsMap.current[id]
        if (isSomething(refIndex)) {
          swatchRefs.current[refIndex] = {
            swatches,
            id
          }
        } else {
          swatchRefsMap.current[id] =
            swatchRefs.current.push({
              swatches,
              id
            }) - 1
        }
      },
    []
  )

  const chunkClickableProps = chunkClickable && {
    onClick: () => chunkClickable(id),
    role: 'button',
    tabIndex: 0
  }

  return (
    <section
      ref={chunkRef}
      className={`flex flex-col items-stretch ${isZoomed ? 'focus-within:outline-none' : ''}`}
      data-testid='wall-chunk'
      style={{
        padding: `${vertSpace}px ${horzSpace}px`
      }}
      {...chunkClickableProps}
    >
      {titles?.length && !colorWallConfig?.titleImage ? <Titles data={titles} /> : null}
      {data.children.map((row, rowIndex: number) => (
        <div
          className={`flex flex-nowrap items-center w-full relative ${getAlignment(align)}`}
          data-testid={'wall-chunk-row'}
          key={rowIndex}
        >
          {row.map(
            (childId: number | string, colIndex: number): JSX.Element => (
              <ColorWallSwatch
                animateActivation={animateActivation}
                active={activeSwatchId === childId}
                activeSwatchContentRenderer={activeSwatchContentRenderer}
                backgroundRenderer={swatchBgRenderer}
                color={colorResolver(parseColorId(childId))}
                foregroundRenderer={swatchRenderer}
                height={swatchHeight}
                id={childId}
                key={`${childId}-${colIndex}`}
                handleMakeActive={() => !chunkClickable && setActiveSwatchId(childId)}
                perimeterLevel={getPerimeterLevel(childId)} // TODO: toggle in here for bloomEnabled?
                setRefs={addToSwatchRefs(childId)}
                width={swatchWidth}
              />
            )
          )}
        </div>
      ))}
    </section>
  )
}

export default Chunk
