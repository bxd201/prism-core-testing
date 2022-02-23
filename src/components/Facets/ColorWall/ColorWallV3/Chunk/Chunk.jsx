import React, { useContext, useState, useEffect, useRef } from 'react'
import ColorWallPropsContext from '../ColorWallPropsContext'
import { computeChunk } from '../sharedReducersAndComputers'
import Swatch from './Swatch'
import './Chunk.scss'

function Chunk (props) {
  const { data = {}, updateWidth, updateHeight, id = '' } = props // eslint-disable-line
  const ctx = useContext(ColorWallPropsContext)
  const { addChunk, activeSwatchId, swatchRenderer } = ctx
  const [ width, setWidth ] = useState(0)
  const [ height, setHeight ] = useState(0)
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

    if (typeof refIndex === 'undefined') {
      const newIndex = swatchRefs.current.push({ el, id }) - 1
      swatchRefsMap.current[id] = newIndex
    } else {
      swatchRefs.current[refIndex] = { el, id }
    }
  }

  return <div ref={thisEl} title={`Chunk, w ${width}, h ${height}`}
    className={`cwv3__chunk`}
    style={{ padding: `${vertSpace}px ${horzSpace}px` }}>
    {data?.children?.map((row, i) => {
      return <div className='cwv3__chunk__row' key={i}>
        {row.map((childId, ii) => (
          <Swatch
            id={childId}
            ref={_el => addToSwatchRefs(_el, childId)}
            key={`${i}_${ii}`}
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
