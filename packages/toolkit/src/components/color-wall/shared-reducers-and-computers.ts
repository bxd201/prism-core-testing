import { colorWallStructuralPropsDefault } from './color-wall-props-context'
import { BASE_SWATCH_SIZE } from './constants'
import { getCumulativeTitleContainerSize } from './wall-utils'
import { Dimensions } from './types'

export const initialState = {
  outerWidth: 0,
  outerHeight: 0,
  widths: {},
  heights: {}
}

interface ChunkDimensions extends Omit<Dimensions, 'heights' | 'widths'> {
  swatchWidth: number
  horizontalSpace: number
  swatchHeight: number
  verticalSpace: number
  innerWidth: number
  innerHeight: number
}

export function computeChunk(data, ctx = colorWallStructuralPropsDefault): ChunkDimensions {
  const { props: selfProps = {}, childProps = {}, children, titles = [] } = data
  const { spaceH = 0, spaceV = 0 } = selfProps
  const { height: swatchHeightScale = 1, width: swatchWidthScale = 1 } = childProps
  const { scale, isWrapped } = ctx

  if (children.length && swatchWidthScale > 0 && swatchHeightScale > 0 && BASE_SWATCH_SIZE > 0 && scale > 0) {
    const sWidth = swatchWidthScale * BASE_SWATCH_SIZE * scale
    const thisHorzSpace = spaceH * BASE_SWATCH_SIZE * scale

    const _width: number = children
      .map((c) => c.reduce((accum: number) => accum + sWidth, 0))
      .reduce((accum, next) => Math.max(accum, next), 0)

    const sHeight = swatchHeightScale * BASE_SWATCH_SIZE * scale
    const thisVertSpace = spaceV * BASE_SWATCH_SIZE * scale
    const titlesHeight = getCumulativeTitleContainerSize(
      titles.filter(titleFilterGenerator(isWrapped)).map(({ level }) => level),
      scale
    )

    const _height =
      (children
        .map((c) => {
          return c.reduce((accum) => Math.max(accum, sHeight), 0)
        })
        .reduce((accum: number, next: number) => accum + next, 0) as number) + titlesHeight

    return {
      swatchWidth: sWidth,
      horizontalSpace: thisHorzSpace,
      swatchHeight: sHeight,
      verticalSpace: thisVertSpace,
      innerWidth: _width,
      innerHeight: _height,
      outerWidth: _width + 2 * thisHorzSpace,
      outerHeight: _height + 2 * thisVertSpace
    }
  }

  return null
}
export function reducerColumn(state, action): Dimensions {
  const { type, amt, index } = action

  switch (type) {
    case 'reset':
      return initialState

    case 'width': {
      const newWidths = { ...state.widths, [index]: amt }
      const width = Math.max.apply(
        undefined,
        Object.keys(newWidths).map((key) => newWidths[key])
      )
      const newState = { ...state, outerWidth: width, widths: newWidths }
      return newState
    }

    case 'height': {
      const newHeights = { ...state.heights, [index]: amt }
      const height = Object.keys(newHeights)
        .map((key) => newHeights[key])
        .reduce((accum: number, next: number) => accum + next, 0)
      const newState = { ...state, outerHeight: height, heights: newHeights }
      return newState
    }

    default:
      throw new Error('No type provided to reducerColumn')
  }
}
export function computeColumn(data, ctx = colorWallStructuralPropsDefault): Dimensions {
  const { scale, isWrapped } = ctx
  const { children, props = {}, titles = [] } = data
  const { spaceH = 0, spaceV = 0 } = props

  if (children) {
    const childrenDims = children
      .map((child) => {
        if (child.type === 'CHUNK') {
          return computeChunk(child, ctx)
        } else if (child.type === 'ROW') {
          return computeRow(child, ctx)
        }

        return null
      })
      .filter(Boolean)
    const titlesHeight = getCumulativeTitleContainerSize(
      titles.filter(titleFilterGenerator(isWrapped)).map(({ level }) => level),
      scale
    )
    const padH = scale * BASE_SWATCH_SIZE * spaceH
    const padV = scale * BASE_SWATCH_SIZE * spaceV
    const state1 = childrenDims
      .map((child, i) => ({
        type: 'width',
        amt: child.outerWidth,
        index: i
      }))
      .reduce(reducerColumn, initialState)
    const state2: Dimensions = childrenDims
      .map((child, i) => ({
        type: 'height',
        amt: child.outerHeight,
        index: i
      }))
      .reduce(reducerColumn, state1)
    const state3 = {
      ...state2,
      outerWidth: state2.outerWidth + padH * 2,
      outerHeight: state2.outerHeight + titlesHeight + padV * 2
    }

    return state3
  }

  return null
}
export function reducerRow(state, action): Dimensions {
  const { type, amt, index } = action

  switch (type) {
    case 'reset':
      return initialState

    case 'width': {
      const newWidths = { ...state.widths, [index]: amt }
      const width = Object.keys(newWidths)
        .map((key) => newWidths[key])
        .reduce((accum: number, next: number) => accum + next, 0)
      const newState = { ...state, outerWidth: width, widths: newWidths }
      return newState
    }

    case 'height': {
      const newHeights = { ...state.heights, [index]: amt }
      const height = Math.max.apply(
        undefined,
        Object.keys(newHeights).map((key) => newHeights[key])
      )
      const newState = { ...state, outerHeight: height, heights: newHeights }
      return newState
    }

    default:
      throw new Error('No type provided to reducerRow')
  }
}
export function computeRow(data, ctx = colorWallStructuralPropsDefault): Dimensions {
  const { scale, isWrapped } = ctx
  const { children, props = {}, titles = [] } = data
  const { spaceH = 0, spaceV = 0, wrap } = props
  const appropriateReducer = isWrapped && wrap ? reducerColumn : reducerRow

  if (!children) {
    return null
  }
  const childrenDims = children
    .map((child) => {
      if (child.type === 'CHUNK') {
        return computeChunk(child, ctx)
      } else if (child.type === 'COLUMN') {
        return computeColumn(child, ctx)
      }

      return null
    })
    .filter(Boolean)
  const titlesHeight = getCumulativeTitleContainerSize(
    titles.filter(titleFilterGenerator(isWrapped)).map(({ level }) => level),
    scale
  )
  const padH = scale * BASE_SWATCH_SIZE * spaceH
  const padV = scale * BASE_SWATCH_SIZE * spaceV
  const state1 = childrenDims
    .map((child, i) => ({
      type: 'width',
      amt: child.outerWidth,
      index: i
    }))
    .reduce(appropriateReducer, initialState)
  const state2: Dimensions = childrenDims
    .map((child, i) => ({
      type: 'height',
      amt: child.outerHeight,
      index: i
    }))
    .reduce(appropriateReducer, state1)
  const state3 = {
    ...state2,
    outerWidth: state2.outerWidth + padH * 2,
    outerHeight: state2.outerHeight + titlesHeight + padV * 2
  }
  return state3
}
export function computeWall(data, ctx = colorWallStructuralPropsDefault): Dimensions {
  const { children, props = {} } = data
  const { wrap } = props
  const { isWrapped } = ctx
  const appropriateReducer = isWrapped && wrap ? reducerColumn : reducerRow

  if (children) {
    const childrenDims = children
      .map((child) => {
        if (child.type === 'CHUNK') {
          return computeChunk(child, ctx)
        } else if (child.type === 'COLUMN') {
          return computeColumn(child, ctx)
        }

        return null
      })
      .filter(Boolean)
    const state1 = childrenDims
      .map((child, i) => ({
        type: 'width',
        amt: child.outerWidth,
        index: i
      }))
      .reduce(appropriateReducer, initialState)
    const state2 = childrenDims
      .map((child, i) => ({
        type: 'height',
        amt: child.outerHeight,
        index: i
      }))
      .reduce(appropriateReducer, state1)
    return state2
  }

  return null
}

function titleFilterGenerator(isWrapped: boolean) {
  return function titleFilter(title) {
    const { hideWhenWrapped = false } = title
    if (hideWhenWrapped && isWrapped) {
      return false
    }
    return true
  }
}
