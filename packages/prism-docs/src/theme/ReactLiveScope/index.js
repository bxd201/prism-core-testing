import React from 'react'
import Prism, {
  CircleLoader,
  ColorPin,
  ColorsIcon,
  ImageColorPicker,
  ImageRotator,
  ImageUploader,
  LivePalette,
  SpinnerLoader
} from '@prism/toolkit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDotCircle, faInfo, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle, faRedo, faUndo } from '@fortawesome/pro-light-svg-icons'
import { filter, shuffle, values } from 'lodash'
import colorsData from './mocked-endpoints/colors.json'
import portrait2 from './images/portrait2.jpg'
import '@prism/toolkit/dist/index.css'
import axios from 'axios'

const fontAwesomeImports = {
  faDotCircle,
  faInfo,
  faPlusCircle,
  faRedo,
  faTrash,
  faUndo,
  FontAwesomeIcon
}

const imagesImports = {
  portrait2
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
  ColorPin,
  ColorsIcon,
  ImageColorPicker,
  ImageRotator,
  ImageUploader,
  LivePalette,
  Prism,
  SpinnerLoader
}

// Add react-live imports you need here
const ReactLiveScope = {
  ...fontAwesomeImports,
  ...imagesImports,
  ...lodashImports,
  ...mockedEndpointsImports,
  ...prismToolkitImports,
  ...React,
  axios,
  React
}

export default ReactLiveScope
