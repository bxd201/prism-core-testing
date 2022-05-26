/* eslint-disable */
import React, { useReducer, useContext } from 'react'
import Row, { computeRow } from '../Row/Row'
import Chunk, { computeChunk } from '../Chunk/Chunk'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { initialState, reducerColumn } from '../sharedReducersAndComputers'
import { BASE_SWATCH_SIZE, ColorWallStructuralPropsContext } from '../ColorWallPropsContext'
import { getAlignment } from '../cwv3Utils'
import './Column.scss'

function Column (props) {
  const { data = {}, updateWidth, updateHeight, id = '' } = props
  const { children, props: colProps = {} } = data
  const { spaceH = 0, spaceV = 0, align } = colProps
  const { scale } = useContext(ColorWallStructuralPropsContext)
  const [{ outerWidth, outerHeight }, dispatch] = useReducer(reducerColumn, initialState)
  const padH = scale * BASE_SWATCH_SIZE * spaceH
  const padV = scale * BASE_SWATCH_SIZE * spaceV

  useEffectAfterMount(() => {
    if (!isNaN(outerWidth)) {
      updateWidth(outerWidth + (2 * padH))
    }
  }, [outerWidth, padH])

  useEffectAfterMount(() => {
    if (!isNaN(outerHeight)) {
      updateHeight(outerHeight + (2 * padV))
    }
  }, [outerHeight, padV])

  return <div
    className={`cwv3__col ${getAlignment('cwv3__col', align)}`}
    style={{ minWidth: outerWidth, minHeight: outerHeight, padding: `${padV}px ${padH}px` }}>
    {children?.map((child, i) => {
      if (child.type === 'ROW') {
        return <Row
          data={child}
          id={`${id}_${i}`}
          key={i}
          updateWidth={v => dispatch({ type: 'width', amt: v, index: i })}
          updateHeight={v => dispatch({ type: 'height', amt: v, index: i })} />
      } else if (child.type === 'CHUNK') {
        return <Chunk
          data={child}
          id={`${id}_${i}`}
          key={i}
          updateWidth={v => dispatch({ type: 'width', amt: v, index: i })}
          updateHeight={v => dispatch({ type: 'height', amt: v, index: i })} />
      }
    })}
  </div>
}

export default Column
