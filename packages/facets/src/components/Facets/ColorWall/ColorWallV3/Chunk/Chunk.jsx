import React, { useContext, useState, useEffect, useRef } from 'react'
import { useRouteMatch } from 'react-router-dom'
import ColorWallPropsContext from '../ColorWallPropsContext'
import { computeChunk } from '../sharedReducersAndComputers'
import Swatch from './Swatch'
import './Chunk.scss'
import isSomething from 'src/shared/utils/isSomething.util'

function Chunk (props) {
  const { data = {}, updateWidth, updateHeight, id = '' } = props // eslint-disable-line
  const ctx = useContext(ColorWallPropsContext)
  const { params } = useRouteMatch()
  const { addChunk, activeSwatchId, swatchRenderer, getPerimeterLevel } = ctx
  const [ , setWidth ] = useState(0)
  const [ , setHeight ] = useState(0)
  const [ swatchWidth, setSwatchWidth ] = useState(0)
  const [ swatchHeight, setSwatchHeight ] = useState(0)
  const [ horzSpace, setHorzSpace ] = useState(0)
  const [ vertSpace, setVertSpace ] = useState(0)
  const thisEl = useRef()
  const swatchRefs = useRef([])
  const swatchRefsMap = useRef({})

  useEffect(() => {
    const results = computeChunk(data, ctx)

    if (results) {
      const {
        horizontalSpace,
        innerHeight,
        innerWidth,
        outerHeight,
        outerWidth,
        swatchHeight,
        swatchWidth,
        verticalSpace
      } = results

      setSwatchWidth(swatchWidth)
      setHorzSpace(horizontalSpace)
      setSwatchHeight(swatchHeight)
      setVertSpace(verticalSpace)
      setWidth(innerWidth)
      updateWidth(outerWidth)
      setHeight(innerHeight)
      updateHeight(outerHeight)
    }
  }, [data, ctx])

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

  return <div ref={thisEl}
    className={`cwv3__chunk${activeSwatchId ? 'cwv3__chunk--no-focus' : ''}`}
    style={{ padding: `${vertSpace}px ${horzSpace}px` }}>
    {data?.children?.map((row, i) => {
      // TODO: remove dependence on route matching; all display variation should be handled through the API and data
      return <div className={`cwv3__chunk__row ${params.family ? 'cwv3__chunk__row__family' : ''}`} key={i}>
        {row.map((childId, ii) => (
          <Swatch
            id={childId}
            ref={_el => addToSwatchRefs(_el, childId)}
            key={`${i}_${ii}`}
            perimeterLevel={getPerimeterLevel(childId)}
            renderer={swatchRenderer}
            active={activeSwatchId === childId}
            width={swatchWidth}
            height={swatchHeight} />
        ))}
      </div>
    })}
  </div>
}

export default Chunk
