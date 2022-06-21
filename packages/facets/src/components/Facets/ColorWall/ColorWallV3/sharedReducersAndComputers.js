// @flow
import { colorWallStructuralPropsDefault } from './ColorWallPropsContext'
import { BASE_SWATCH_SIZE } from './constants'
import { getOuterHeightAll } from './Title/Title'

export const initialState = { outerWidth: 0, outerHeight: 0, widths: {}, heights: {} }

export function computeChunk (data = {}, ctx = colorWallStructuralPropsDefault) {
  const { props: selfProps = {}, childProps = {}, children, titles = [] } = data
  const { spaceH = 0, spaceV = 0 } = selfProps
  const { height: swatchHeightScale = 1, width: swatchWidthScale = 1 } = childProps
  const { scale } = ctx

  if (children.length && swatchWidthScale > 0 && swatchHeightScale > 0 && BASE_SWATCH_SIZE > 0 && scale > 0) {
    const sWidth = swatchWidthScale * BASE_SWATCH_SIZE * scale
    const thisHorzSpace = spaceH * BASE_SWATCH_SIZE * scale

    const _width = children.map(c => c.reduce((accum, next) => accum + sWidth, 0)).reduce((accum, next) => Math.max(accum, next), 0)

    const sHeight = swatchHeightScale * BASE_SWATCH_SIZE * scale
    const thisVertSpace = spaceV * BASE_SWATCH_SIZE * scale

    const titlesHeight = getOuterHeightAll(titles.map(({ level }) => level), scale)

    const _height = children.map(c => {
      return c.reduce((accum, next) => Math.max(accum, sHeight), 0)
    }).reduce((accum, next) => accum + next, 0) + titlesHeight

    return {
      swatchWidth: sWidth,
      horizontalSpace: thisHorzSpace,
      swatchHeight: sHeight,
      verticalSpace: thisVertSpace,
      innerWidth: _width,
      innerHeight: _height,
      outerWidth: _width + (2 * thisHorzSpace),
      outerHeight: _height + (2 * thisVertSpace)
    }
  }

  return null
}

export function reducerColumn (state, action) {
  const { type, amt, index } = action

  switch (type) {
    case 'reset':
      return initialState
    case 'width': {
      const newWidths = { ...state.widths, [index]: amt }
      const width = Math.max.apply(undefined, Object.keys(newWidths).map(key => newWidths[key]))
      const newState = {
        ...state,
        outerWidth: width,
        widths: newWidths
      }
      return newState
    }
    case 'height': {
      const newHeights = { ...state.heights, [index]: amt }
      const height = Object.keys(newHeights).map(key => newHeights[key]).reduce((accum, next) => accum + next, 0)
      const newState = {
        ...state,
        outerHeight: height,
        heights: newHeights
      }
      return newState
    }
    default:
      throw new Error()
  }
}

export function computeColumn (data = {}, ctx = colorWallStructuralPropsDefault) {
  const { scale } = ctx
  const { children, props = {}, titles = [] } = data
  const { spaceH = 0, spaceV = 0 } = props

  if (children) {
    const childrenDims = children.map((child, i) => {
      if (child.type === 'CHUNK') {
        return computeChunk(child, ctx)
      } else if (child.type === 'ROW') {
        return computeRow(child, ctx)
      }
      return null
    }).filter(Boolean)

    const titlesHeight = getOuterHeightAll(titles.map(({ level }) => level), scale)
    const padH = scale * BASE_SWATCH_SIZE * spaceH
    const padV = scale * BASE_SWATCH_SIZE * spaceV
    const state1 = childrenDims.map((child, i) => ({ type: 'width', amt: child.outerWidth, index: i })).reduce(reducerColumn, initialState)
    const state2 = childrenDims.map((child, i) => ({ type: 'height', amt: child.outerHeight, index: i })).reduce(reducerColumn, state1)
    const state3 = {
      ...state2,
      outerWidth: state2.outerWidth + (padH * 2),
      outerHeight: state2.outerHeight + titlesHeight + (padV * 2)
    }

    return state3
  }

  return null
}

export function reducerRow (state, action) {
  const { type, amt, index } = action

  switch (type) {
    case 'reset':
      return initialState
    case 'width': {
      const newWidths = { ...state.widths, [index]: amt }
      const width = Object.keys(newWidths).map(key => newWidths[key]).reduce((accum, next) => accum + next, 0)
      const newState = {
        ...state,
        outerWidth: width,
        widths: newWidths
      }
      return newState
    }
    case 'height': {
      const newHeights = { ...state.heights, [index]: amt }
      const height = Math.max.apply(undefined, Object.keys(newHeights).map(key => newHeights[key]))
      const newState = {
        ...state,
        outerHeight: height,
        heights: newHeights
      }
      return newState
    }
    default:
      throw new Error()
  }
}

export function computeRow (data = {}, ctx = colorWallStructuralPropsDefault) {
  const { scale, isWrapped } = ctx
  const { children, props = {}, titles = [] } = data
  const { spaceH = 0, spaceV = 0, wrap } = props
  const appropriateReducer = isWrapped && wrap ? reducerColumn : reducerRow

  if (children) {
    const childrenDims = children.map((child, i) => {
      if (child.type === 'CHUNK') {
        return computeChunk(child, ctx)
      } else if (child.type === 'COLUMN') {
        return computeColumn(child, ctx)
      }
      return null
    }).filter(Boolean)

    const titlesHeight = getOuterHeightAll(titles.map(({ level }) => level), scale)
    const padH = scale * BASE_SWATCH_SIZE * spaceH
    const padV = scale * BASE_SWATCH_SIZE * spaceV
    const state1 = childrenDims.map((child, i) => ({ type: 'width', amt: child.outerWidth, index: i })).reduce(appropriateReducer, initialState)
    const state2 = childrenDims.map((child, i) => ({ type: 'height', amt: child.outerHeight, index: i })).reduce(appropriateReducer, state1)
    const state3 = {
      ...state2,
      outerWidth: state2.outerWidth + (padH * 2),
      outerHeight: state2.outerHeight + titlesHeight + (padV * 2)
    }

    return state3
  }

  return null
}

export function computeWall (data, ctx = colorWallStructuralPropsDefault) {
  const { children, props = {} } = data
  const { wrap } = props
  const { isWrapped } = ctx
  const appropriateReducer = isWrapped && wrap ? reducerColumn : reducerRow

  if (children) {
    const childrenDims = children.map((child, i) => {
      if (child.type === 'CHUNK') {
        return computeChunk(child, ctx)
      } else if (child.type === 'COLUMN') {
        return computeColumn(child, ctx)
      }
      return null
    }).filter(Boolean)

    const state1 = childrenDims.map((child, i) => ({ type: 'width', amt: child.outerWidth, index: i })).reduce(appropriateReducer, initialState)
    const state2 = childrenDims.map((child, i) => ({ type: 'height', amt: child.outerHeight, index: i })).reduce(appropriateReducer, state1)

    return state2
  }

  return null
}
