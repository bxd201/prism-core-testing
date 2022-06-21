// @flow
import React, { useReducer, useContext } from 'react'
import Row from '../Row/Row'
import Chunk from '../Chunk/Chunk'
import Titles, { getOuterHeightAll } from '../Title/Title'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { initialState, reducerColumn } from '../sharedReducersAndComputers'
import { ColorWallStructuralPropsContext } from '../ColorWallPropsContext'
import { BASE_SWATCH_SIZE } from '../constants'
import { getAlignment } from '../cwv3Utils'
import './Column.scss'

type ColProps = {
  data: any,
  updateWidth: (number) => void,
  updateHeight: (number) => void,
  id: string
}

function Column (props: ColProps) {
  const { data = {}, updateWidth, updateHeight, id = '' } = props
  const { children, props: colProps = {}, titles = [] } = data
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
    const titlesHeight = getOuterHeightAll(titles.map(({ level }) => level), scale)
    if (!isNaN(outerHeight)) {
      updateHeight(outerHeight + titlesHeight + (2 * padV))
    }
  }, [outerHeight, padV])

  return <div
    className={`cwv3__col ${getAlignment('cwv3__col', align)}`}
    style={{ minWidth: outerWidth, minHeight: outerHeight, padding: `${padV}px ${padH}px` }}>
    {titles && titles.length
      ? <Titles data={titles} referenceScale={scale} />
      : null}
    {children && children.length && children.map((child, i) => {
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
