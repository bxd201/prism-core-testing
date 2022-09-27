import React from 'react'
import Prism, {
  Carousel,
  CircleLoader,
  ColorPin,
  ColorsIcon,
  ColorSwatch,
  ImageColorPicker,
  ImageRotator,
  ImageUploader,
  LivePalette,
  SpinnerLoader,
  SimpleTintableScene,
  FastMaskView
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
  Carousel,
  CircleLoader,
  ColorPin,
  ColorsIcon,
  ColorSwatch,
  ImageColorPicker,
  ImageRotator,
  ImageUploader,
  LivePalette,
  Prism,
  SpinnerLoader,
  SimpleTintableScene,
  FastMaskView
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
