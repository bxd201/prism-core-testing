/* eslint-disable */
import React, { useReducer } from 'react'
import Row, { computeRow } from '../Row/Row'
import Chunk, { computeChunk } from '../Chunk/Chunk'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { initialState, reducerColumn } from '../sharedReducersAndComputers'
import './Column.scss'

function Column (props) {
  const { data, updateWidth, updateHeight, id = '' } = props
  const [{ outerWidth, outerHeight }, dispatch] = useReducer(reducerColumn, initialState)

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

  return <div className='cwv3__col' style={{ minWidth: outerWidth, minHeight: outerHeight }}>
    {data?.children?.map((child, i) => {
      if (child.type === 'ROW') {
        return <Row data={child} id={`${id}_${i}`} key={i} updateWidth={v => dispatch({ type: 'width', amt: v, index: i })} updateHeight={v => dispatch({ type: 'height', amt: v })} />
      } else if (child.type === 'CHUNK') {
        return <Chunk data={child} id={`${id}_${i}`} key={i} updateWidth={v => dispatch({ type: 'width', amt: v, index: i })} updateHeight={v => dispatch({ type: 'height', amt: v })} />
      }
    })}
  </div>
}

export default Column
