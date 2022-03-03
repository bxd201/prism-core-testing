import { colorWallPropsDefault, BASE_SWATCH_SIZE } from './ColorWallPropsContext'

export const initialState = { outerWidth: 0, outerHeight: 0, widths: {}, heights: {} }

export function computeChunk (data = {}, ctx = colorWallPropsDefault) {
  const { props: selfProps = {}, childProps = {}, children } = data
  const { spaceH = 0, spaceV = 0 } = selfProps
  const { height: swatchHeightScale = 1, width: swatchWidthScale = 1 } = childProps
  const { scale } = ctx

  if (children.length && swatchWidthScale > 0 && swatchHeightScale > 0 && BASE_SWATCH_SIZE > 0 && scale > 0) {
    const sWidth = swatchWidthScale * BASE_SWATCH_SIZE * scale
    const thisHorzSpace = spaceH * BASE_SWATCH_SIZE * scale

    const _width = children.map(c => c.reduce((accum, next) => accum + sWidth, 0)).reduce((accum, next) => Math.max(accum, next), 0)

    const sHeight = swatchHeightScale * BASE_SWATCH_SIZE * scale
    const thisVertSpace = spaceV * BASE_SWATCH_SIZE * scale

    const _height = children.map(c => {
      return c.reduce((accum, next) => Math.max(accum, sHeight), 0)
    }).reduce((accum, next) => accum + next, 0)

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

export function reducerColumn (state, { type, amt, index }) {
  switch (type) {
    case 'width': {
      const newWidths = { ...state.widths, [index]: amt }
      const newState = {
        ...state,
        outerWidth: Math.max.apply(undefined, Object.keys(newWidths).map(key => newWidths[key])),
        widths: newWidths
      }
      return newState
    }
    case 'height': {
      const newHeights = { ...state.heights, [index]: amt }
      const newState = {
        ...state,
        outerHeight: Object.keys(newHeights).map(key => newHeights[key]).reduce((accum, next) => accum + next, 0),
        heights: newHeights
      }
      return newState
    }
    default:
      throw new Error()
  }
}

export function computeColumn (data) {
  if (data.children) {
    const childrenDims = data.children.map((child, i) => {
      if (child.type === 'CHUNK') {
        return computeChunk(child)
      } else if (child.type === 'ROW') {
        return computeRow(child)
      }
      return null
    }).filter(Boolean)

    const state1 = childrenDims.map((child, i) => ({ type: 'width', amt: child.outerWidth, index: i })).reduce(reducerColumn, initialState)
    const state2 = childrenDims.map((child, i) => ({ type: 'height', amt: child.outerHeight, index: i })).reduce(reducerColumn, state1)

    return state2
  }

  return null
}

export function reducerRow (state, { type, amt, index }) {
  switch (type) {
    case 'width': {
      const newWidths = { ...state.widths, [index]: amt }
      const newState = {
        ...state,
        outerWidth: Object.keys(newWidths).map(key => newWidths[key]).reduce((accum, next) => accum + next, 0),
        widths: newWidths
      }
      return newState
    }
    case 'height': {
      const newHeights = { ...state.heights, [index]: amt }
      const newState = {
        ...state,
        outerHeight: Math.max.apply(undefined, Object.keys(newHeights).map(key => newHeights[key])),
        heights: newHeights
      }
      return newState
    }
    default:
      throw new Error()
  }
}

export function computeRow (data) {
  if (data.children) {
    const childrenDims = data.children.map((child, i) => {
      if (child.type === 'CHUNK') {
        return computeChunk(child)
      } else if (child.type === 'COLUMN') {
        return computeColumn(child)
      }
      return null
    }).filter(Boolean)

    const state1 = childrenDims.map((child, i) => ({ type: 'width', amt: child.outerWidth, index: i })).reduce(reducerRow, initialState)
    const state2 = childrenDims.map((child, i) => ({ type: 'height', amt: child.outerHeight, index: i })).reduce(reducerRow, state1)

    return state2
  }

  return null
}

export function reducerWall (state, { type, amt, index }) {
  switch (type) {
    case 'reset':
      return initialState
    case 'width': {
      const newWidths = { ...state.widths, [index]: amt }
      const newState = {
        ...state,
        width: Object.keys(newWidths).map(key => newWidths[key]).reduce((accum, next) => accum + next, 0),
        widths: newWidths
      }
      return newState
    }
    case 'height': {
      const newHeights = { ...state.heights, [index]: amt }
      const newState = {
        ...state,
        height: Math.max.apply(undefined, Object.keys(newHeights).map(key => newHeights[key])),
        heights: newHeights
      }
      return newState
    }
    default:
      throw new Error()
  }
}

export function computeWall (data) {
  if (data.children) {
    const childrenDims = data.children.map((child, i) => {
      if (child.type === 'CHUNK') {
        return computeChunk(child)
      } else if (child.type === 'COLUMN') {
        return computeColumn(child)
      }
      return null
    }).filter(Boolean)

    const state1 = childrenDims.map((child, i) => ({ type: 'width', amt: child.outerWidth, index: i })).reduce(reducerWall, initialState)
    const state2 = childrenDims.map((child, i) => ({ type: 'height', amt: child.outerHeight, index: i })).reduce(reducerWall, state1)

    return state2
  }

  return null
}
