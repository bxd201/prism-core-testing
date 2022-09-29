import React, { useContext, useEffect, useRef,useState } from 'react'
import isSomething from '../../utils/isSomething'
import { ColorWallPropsContext, ColorWallStructuralPropsContext } from './color-wall-props-context'
import { computeChunk } from './shared-reducers-and-computers'
import Titles from './title'
import { ChunkShape } from './types'
import { getAlignment } from './wall-utils'

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
    addChunk,
    activeSwatchId,
    getPerimeterLevel,
    isZoomed,
    setActiveSwatchId,
    swatchContentRefs,
    swatchRenderer
  } = ctx
  const [, setWidth] = useState(0)
  const [, setHeight] = useState(0)
  const [horzSpace, setHorzSpace] = useState(0)
  const [vertSpace, setVertSpace] = useState(0)
  const [swatchWidth, setSwatchWidth] = useState(0)
  const [swatchHeight, setSwatchHeight] = useState(0)
  const thisEl = useRef()
  const swatchRefs = useRef([])
  const swatchRefsMap = useRef({})

  useEffect(() => {
    const results = computeChunk(data, structuralCtx)

    if (results) {
      const {
        horizontalSpace,
        innerHeight,
        innerWidth,
        outerHeight,
        outerWidth,
        verticalSpace,
        swatchHeight,
        swatchWidth
      } = results
      setHorzSpace(horizontalSpace)
      setVertSpace(verticalSpace)
      setWidth(innerWidth)
      updateWidth(outerWidth)
      setHeight(innerHeight)
      updateHeight(outerHeight)
      setSwatchHeight(swatchHeight)
      setSwatchWidth(swatchWidth)
    }
  }, [data, structuralCtx])

  useEffect(() => {
    addChunk({
      chunkRef: thisEl,
      swatchesRef: swatchRefs,
      id: id,
      data: data
    })
  }, [])

  const addToSwatchRefs = (el, id): void => {
    const refIndex = swatchRefsMap.current[id]

    if (isSomething(refIndex)) {
      swatchRefs.current[refIndex] = {
        el,
        id
      }
    } else {
      const newIndex =
        swatchRefs.current.push({
          el,
          id
        }) - 1
      swatchRefsMap.current[id] = newIndex
    }
  }

  return (
    <section
      ref={thisEl}
      className={`flex flex-col items-stretch ${isZoomed ? 'focus-within:outline-none' : ''}`}
      data-testid='wall-chunk'
      style={{
        padding: `${vertSpace}px ${horzSpace}px`
      }}
    >
      {titles?.length ? <Titles data={titles} /> : null}
      {data.children.map((row, i: number) => (
        <div
          className={`flex flex-nowrap items-center w-full relative ${getAlignment(align)}`}
          data-testid={'wall-swatch'}
          key={i}
        >
          {row.map((childId, ii: number): JSX.Element => {
            const active = activeSwatchId === childId
            const perimeterLevel: number = getPerimeterLevel(childId)
            const internalProps = {
              active,
              activeFocus: false,
              id: childId,
              onClick: () => {
                setActiveSwatchId(childId)
                swatchContentRefs.current = []
              },
              onRefSwatch: (_el) => {
                addToSwatchRefs({ current: [_el, ...swatchContentRefs.current] }, childId)
              },
              perimeterLevel,
              style: {
                height: swatchHeight,
                width: swatchWidth
              }
            }
            return swatchRenderer(internalProps)
          })}
        </div>
      ))}
    </section>
  )
}

export default Chunk
