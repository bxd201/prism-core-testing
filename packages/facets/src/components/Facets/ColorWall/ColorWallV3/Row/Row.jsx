/* eslint-disable */
import React, { useReducer } from 'react'
import Column, { computeColumn } from '../Column/Column'
import Chunk, { computeChunk } from '../Chunk/Chunk'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { initialState, reducerRow } from '../sharedReducersAndComputers'
import './Row.scss'

function Row (props) {
  const { data, updateWidth, updateHeight, id = '' } = props
  const [{ outerWidth, outerHeight }, dispatch] = useReducer(reducerRow, initialState)

  useEffectAfterMount(() => {
    if (!isNaN(outerWidth)) {
      updateWidth(outerWidth)
    }
  }, [outerWidth])

  useEffectAfterMount(() => {
    if (!isNaN(outerHeight)) {
      updateHeight(outerHeight)
    }
  }, [outerHeight])

  return <div className='cwv3__row' title={`Row, w ${outerWidth}, h ${outerHeight}`} style={{ minWidth: outerWidth, minHeight: outerHeight }}>
    {data?.children?.map((child, i) => {
      if (child.type === 'ROW') {
        return <Column data={child} id={`${id}_${i}`} key={i} updateWidth={v => dispatch({ type: 'width', amt: v, index: i })} updateHeight={v => dispatch({ type: 'height', amt: v })} />
      } else if (child.type === 'CHUNK') {
        return <Chunk data={child} id={`${id}_${i}`} key={i} updateWidth={v => dispatch({ type: 'width', amt: v, index: i })} updateHeight={v => dispatch({ type: 'height', amt: v })} />
      }
    })}
  </div>
}

export default Row
