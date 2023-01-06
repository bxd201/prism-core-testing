import React, { useContext,useReducer } from 'react'
import useEffectAfterMount from '../../hooks/useEffectAfterMount'
import Chunk from './chunk'
import { ColorWallPropsContext, ColorWallStructuralPropsContext } from './color-wall-props-context'
import Column from './column'
import { BASE_SWATCH_SIZE } from './constants'
import { initialState, reducerColumn,reducerRow } from './shared-reducers-and-computers'
import Titles from './title'
import { RowShape } from './types'
import { getAlignment,getCumulativeTitleContainerSize } from './wall-utils'

interface RowProps {
  data: RowShape
  updateWidth: (width: number) => void
  updateHeight: (height: number) => void
  id: string
}

function Row(props: RowProps): JSX.Element {
  const { data, updateWidth, updateHeight, id = '' } = props
  const { children, props: colProps = {}, titles = [] } = data
  const { spaceH = 0, spaceV = 0, align = 'start', wrap } = colProps
  const { colorWallConfig } = useContext(ColorWallPropsContext)
  const { scale, isWrapped } = useContext(ColorWallStructuralPropsContext)
  const [{ outerWidth, outerHeight }, dispatch] = useReducer(reducerRow, initialState)
  const [{ outerWidth: outerWidthWrapped, outerHeight: outerHeightWrapped }, dispatchWrapped] = useReducer(
    reducerColumn,
    initialState
  )
  const padH = scale * BASE_SWATCH_SIZE * spaceH
  const padV = scale * BASE_SWATCH_SIZE * spaceV
  const wrapThisRow = isWrapped && wrap

  function doDispatch(dispatchedData): void {
    if (wrapThisRow) {
      dispatchWrapped(dispatchedData)
    } else {
      dispatch(dispatchedData)
    }
  }

  useEffectAfterMount(() => {
    if (!wrapThisRow && !isNaN(outerWidth)) {
      updateWidth(outerWidth + 2 * padH)
    } else if (wrapThisRow && !isNaN(outerWidthWrapped)) {
      updateWidth(outerWidthWrapped + 2 * padH)
    }
  }, [outerWidth, outerWidthWrapped, padH, wrapThisRow])

  useEffectAfterMount(() => {
    const titlesHeight = getCumulativeTitleContainerSize(
      titles.map(({ level }) => level),
      scale
    )

    if (!wrapThisRow && !isNaN(outerHeight)) {
      updateHeight(outerHeight + titlesHeight + 2 * padV)
    } else if (wrapThisRow && !isNaN(outerHeightWrapped)) {
      updateHeight(outerHeightWrapped + titlesHeight + 2 * padV)
    }
  }, [outerHeight, outerHeightWrapped, padV, wrapThisRow])

  return (
    <section
      className={`flex flex-row items-stretch relative ${getAlignment(align)} ${
        wrapThisRow ? 'flex-wrap' : 'flex-nowrap'
      }`}
      data-testid='wall-row'
      style={{
        minWidth: !wrapThisRow ? outerWidth : null,
        minHeight: !wrapThisRow && !colorWallConfig.forceWrap ? outerHeight : null,
        width: wrapThisRow ? outerWidthWrapped : null,
        height: wrapThisRow ? outerHeightWrapped : null,
        padding: `${padV}px ${padH}px`
      }}
    >
      {titles?.length ? <Titles data={titles} /> : null}
      {children?.length
        ? // eslint-disable-next-line array-callback-return
          children.map((child, i: number) => {
            if (child.type === 'COLUMN') {
              return (
                <Column
                  data={child}
                  id={`${id}_${i}`}
                  key={i}
                  updateWidth={(v) =>
                    doDispatch({
                      type: 'width',
                      amt: v,
                      index: i
                    })
                  }
                  updateHeight={(v) =>
                    doDispatch({
                      type: 'height',
                      amt: v,
                      index: i
                    })
                  }
                />
              )
            } else if (child.type === 'CHUNK') {
              return (
                <Chunk
                  data={child}
                  id={`${id}_${i}`}
                  key={i}
                  updateWidth={(v) =>
                    doDispatch({
                      type: 'width',
                      amt: v,
                      index: i
                    })
                  }
                  updateHeight={(v) =>
                    doDispatch({
                      type: 'height',
                      amt: v,
                      index: i
                    })
                  }
                />
              )
            }
          })
        : null}
    </section>
  )
}

export default Row
