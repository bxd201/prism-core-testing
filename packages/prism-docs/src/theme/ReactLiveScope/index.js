import React from 'react';
import Prism, { ImageColorPicker, ColorPin } from '@prism/toolkit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/pro-solid-svg-icons'
import '@prism/toolkit/dist/index.css'
import axios from 'axios'

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  FontAwesomeIcon,
  Prism,
  axios,
  ColorPin,
  faTrash,
  ImageColorPicker,
};
export default ReactLiveScope;
