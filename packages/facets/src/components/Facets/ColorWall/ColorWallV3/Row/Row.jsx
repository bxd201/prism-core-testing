// @flow
import React, { useReducer, useContext } from 'react'
import Column from '../Column/Column'
import Chunk from '../Chunk/Chunk'
import Titles, { getOuterHeightAll } from '../Title/Title'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { initialState, reducerRow, reducerColumn } from '../sharedReducersAndComputers'
import { ColorWallStructuralPropsContext } from '../ColorWallPropsContext'
import { BASE_SWATCH_SIZE } from '../constants'
import { getAlignment } from '../cwv3Utils'
import './Row.scss'

type RowProps = {
  data: any,
  updateWidth: (number) => void,
  updateHeight: (number) => void,
  id: string
}

function Row (props: RowProps) {
  const { data = {}, updateWidth, updateHeight, id = '' } = props
  const { children, props: colProps = {}, titles = [] } = data
  const { spaceH = 0, spaceV = 0, align, wrap } = colProps
  const { scale, isWrapped } = useContext(ColorWallStructuralPropsContext)
  const [{ outerWidth, outerHeight }, dispatch] = useReducer(reducerRow, initialState)
  const [{ outerWidth: outerWidthWrapped, outerHeight: outerHeightWrapped }, dispatchWrapped] = useReducer(reducerColumn, initialState)
  const padH = scale * BASE_SWATCH_SIZE * spaceH
  const padV = scale * BASE_SWATCH_SIZE * spaceV
  const wrapThisRow = isWrapped && wrap

  function doDispatch (dispatchedData) {
    if (wrapThisRow) {
      dispatchWrapped(dispatchedData)
    } else {
      dispatch(dispatchedData)
    }
  }

  useEffectAfterMount(() => {
    if (!wrapThisRow && !isNaN(outerWidth)) {
      updateWidth(outerWidth + (2 * padH))
    } else if (wrapThisRow && !isNaN(outerWidthWrapped)) {
      updateWidth(outerWidthWrapped + (2 * padH))
    }
  }, [outerWidth, outerWidthWrapped, padH, wrapThisRow])

  useEffectAfterMount(() => {
    const titlesHeight = getOuterHeightAll(titles.map(({ level }) => level), scale)
    if (!wrapThisRow && !isNaN(outerHeight)) {
      updateHeight(outerHeight + titlesHeight + (2 * padV))
    } else if (wrapThisRow && !isNaN(outerHeightWrapped)) {
      updateHeight(outerHeightWrapped + titlesHeight + (2 * padV))
    }
  }, [outerHeight, outerHeightWrapped, padV, wrapThisRow])

  return <div
    className={`cwv3__row ${getAlignment('cwv3__row', align)} ${wrapThisRow ? 'cwv3__row--wrapped' : ''}`}
    style={{
      minWidth: !wrapThisRow ? outerWidth : null,
      minHeight: !wrapThisRow ? outerHeight : null,
      width: wrapThisRow ? outerWidthWrapped : null,
      height: wrapThisRow ? outerHeightWrapped : null,
      padding: `${padV}px ${padH}px`
    }}>
    {titles && titles.length
      ? <Titles data={titles} referenceScale={scale} />
      : null}
    {children && children.length && children.map((child, i) => {
      if (child.type === 'ROW') {
        return <Column
          data={child}
          id={`${id}_${i}`}
          key={i}
          updateWidth={v => doDispatch({ type: 'width', amt: v, index: i })}
          updateHeight={v => doDispatch({ type: 'height', amt: v, index: i })} />
      } else if (child.type === 'CHUNK') {
        return <Chunk
          data={child}
          id={`${id}_${i}`}
          key={i}
          updateWidth={v => doDispatch({ type: 'width', amt: v, index: i })}
          updateHeight={v => doDispatch({ type: 'height', amt: v, index: i })} />
      }
    })}
  </div>
}

export default Row
