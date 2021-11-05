import React from 'react'
import { BASE_SWATCH_SIZE, CHUNK_SPACING } from './constants'

const ColorContext = React.createContext({
  colors: {},
  activeColor: null,
  swatchSize: BASE_SWATCH_SIZE,
  chunkSpacing: CHUNK_SPACING,
  maxWidth: Infinity,
  width: Infinity,
  maxHeight: Infinity,
  height: Infinity
})

export default ColorContext
