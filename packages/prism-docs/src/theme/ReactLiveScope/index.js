import React from 'react'
import Prism, { CircleLoader, ColorsIcon, ColorPin, ImageColorPicker, LivePalette, SpinnerLoader } from '@prism/toolkit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { filter, shuffle, values } from 'lodash'
import colorsData from './mocked-endpoints/colors.json'
import '@prism/toolkit/dist/index.css'
import axios from 'axios'

const fontAwesomeImports = {
  faInfo,
  faPlusCircle,
  faTrash,
  FontAwesomeIcon
}

const lodashImports = {
  filter,
  shuffle,
  values
}

const mockedEndpointsImports = {
  colorsData
}

const prismToolkitImports = {
  CircleLoader,
  ColorsIcon,
  ColorPin,
  ImageColorPicker,
  LivePalette,
  SpinnerLoader,
  Prism
}

// Add react-live imports you need here
const ReactLiveScope = {
  ...fontAwesomeImports,
  ...lodashImports,
  ...mockedEndpointsImports,
  ...prismToolkitImports,
  ...React,
  axios,
  React
}

export default ReactLiveScope
