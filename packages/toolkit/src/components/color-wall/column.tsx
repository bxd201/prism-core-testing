import React, { useReducer, useContext } from 'react'
import Row from './row'
import Chunk from './chunk'
import Titles from './title'
import useEffectAfterMount from '../../hooks/useEffectAfterMount'
import { initialState, reducerColumn } from './shared-reducers-and-computers'
import { ColorWallStructuralPropsContext } from './color-wall-props-context'
import { BASE_SWATCH_SIZE } from './constants'
import { getCumulativeTitleContainerSize, getAlignment } from './wall-utils'
import { ColumnShape } from './types'

interface ColProps {
  data: ColumnShape
  updateWidth?: (width: number) => void
  updateHeight?: (height: number) => void
  id: string | number
}

function Column(props: ColProps): JSX.Element {
  const { data, updateWidth, updateHeight, id = '' } = props
  const { children, props: colProps = {}, titles = [] } = data
  const { spaceH = 0, spaceV = 0, align = 'justify' } = colProps
  const { scale } = useContext(ColorWallStructuralPropsContext)
  const [{ outerWidth, outerHeight }, dispatch] = useReducer(reducerColumn, initialState)
  const padH = scale * BASE_SWATCH_SIZE * spaceH
  const padV = scale * BASE_SWATCH_SIZE * spaceV

  useEffectAfterMount(() => {
    if (!isNaN(outerWidth)) {
      updateWidth(outerWidth + 2 * padH)
    }
  }, [outerWidth, padH])

  useEffectAfterMount(() => {
    const titlesHeight = getCumulativeTitleContainerSize(
      titles.map(({ level }) => level),
      scale
    )

    if (!isNaN(outerHeight)) {
      updateHeight(outerHeight + titlesHeight + 2 * padV)
    }
  }, [outerHeight, padV])

  return (
    <section
      className={`flex flex-col flex-nowrap items-stretch relative ${getAlignment(align)}`}
      data-testid='wall-column'
      style={{
        minWidth: outerWidth,
        minHeight: outerHeight,
        padding: `${padV}px ${padH}px`
      }}
    >
      {titles?.length ? <Titles data={titles} /> : null}
      {children?.length
        ? // eslint-disable-next-line array-callback-return
          children.map((child, i: number) => {
            if (child.type === 'ROW') {
              return (
                <Row
                  data={child}
                  id={`${id}_${i}`}
                  key={i}
                  updateWidth={(v) =>
                    dispatch({
                      type: 'width',
                      amt: v,
                      index: i
                    })
                  }
                  updateHeight={(v) =>
                    dispatch({
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
                    dispatch({
                      type: 'width',
                      amt: v,
                      index: i
                    })
                  }
                  updateHeight={(v) => {
                    dispatch({
                      type: 'height',
                      amt: v,
                      index: i
                    })
                  }}
                />
              )
            }
          })
        : null}
    </section>
  )
}

export default Column
