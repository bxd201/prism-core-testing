// @flow
import React, { useContext, useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { ColorWallPropsContext, ColorWallStructuralPropsContext } from '../ColorWallPropsContext'
import { computeChunk } from '../sharedReducersAndComputers'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import { getAlignment } from '../cwv3Utils'
import './Chunk.scss'
import Titles from '../Title/Title'
import { Swatch } from '../Swatch/Swatch'
import isSomething from '../../../../../shared/utils/isSomething.util'

type ChunkProps = {
  data: {
    children: any,
    titles: any,
    props: any,
    childProps: any
  },
  id: string,
  updateHeight: any => void,
  updateWidth: any => void,
}

function Chunk ({ data = {}, id = '', updateHeight, updateWidth }: ChunkProps) {
  const { titles, props: chunkProps = {} } = data
  const { align } = chunkProps
  const ctx = useContext(ColorWallPropsContext)
  const structuralCtx = useContext(ColorWallStructuralPropsContext)
  const { scale } = structuralCtx
  const { colorWall: { colorSwatch = {} } }: ConfigurationContextType = useContext(ConfigurationContext)
  const { houseShaped = false } = colorSwatch
  const { items: { colorMap } }: ColorsState = useSelector(state => state.colors)
  const { params } = useRouteMatch()
  const { addChunk, activeSwatchId, isZoomed, swatchContentRefs } = ctx
  const [ , setWidth ] = useState(0)
  const [ , setHeight ] = useState(0)
  const [ horzSpace, setHorzSpace ] = useState(0)
  const [ vertSpace, setVertSpace ] = useState(0)
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
        verticalSpace
      } = results
      setHorzSpace(horizontalSpace)
      setVertSpace(verticalSpace)
      setWidth(innerWidth)
      updateWidth(outerWidth)
      setHeight(innerHeight)
      updateHeight(outerHeight)
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

  const addToSwatchRefs = (el, id) => {
    const refIndex = swatchRefsMap.current[id]

    if (isSomething(refIndex)) {
      swatchRefs.current[refIndex] = { el, id }
    } else {
      const newIndex = swatchRefs.current.push({ el, id }) - 1
      swatchRefsMap.current[id] = newIndex
    }
  }

  return (
    <div
      ref={thisEl}
      className={`cwv3__chunk ${houseShaped && isZoomed ? 'cwv3__chunk--no-focus' : ''}`}
      style={{ padding: `${vertSpace}px ${horzSpace}px` }}
    >
      {titles && titles.length
        ? <Titles data={titles} referenceScale={scale} />
        : null}
      {data.children.map((row, i) => (
        // TODO: remove dependence on route matching; all display variation should be handled through the API and data
        <div className={`cwv3__chunk__row ${getAlignment('cwv3__chunk__row', align)} ${params.family ? 'cwv3__chunk__row__family' : ''}`} key={i}>
          {row.map((childId, ii) => {
            const active = activeSwatchId === childId
            const color = colorMap[childId]

            return (
              <Swatch
                key={`${i}_${ii}`}
                active={active}
                houseShaped={houseShaped}
                data={data}
                color={color}
                id={childId}
                onRef={_el => addToSwatchRefs({ current: [_el, ...swatchContentRefs.current] }, childId)}
                style={{ padding: `${vertSpace}px ${horzSpace}px` }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Chunk
