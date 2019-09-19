import React from 'react'
import { shallow } from 'enzyme'
import PaintScene from 'src/components/PaintScene/PaintScene'

const defaultProps = {
  imageUrl: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=1311}&qlt=92',
  imageRotationAngle: 0,
  lpActiveColor: {
    'colorNumber': '7008',
    'coordinatingColors': {
      'coord2ColorId': '11203',
      'coord1ColorId': '2996'
    },
    'description': [
      'Diluted',
      'Wan',
      'Dazzling'
    ],
    'id': 'bright-2689',
    'isExterior': true,
    'isInterior': true,
    'name': 'Alabaster',
    'lrv': 82.215,
    'brandedCollectionNames': [
      'Color Forecast',
      'Senior Living Color Collection',
      'Pottery Barn Fall/Winter 2018',
      'Pottery Barn Fall/Winter 2018'
    ],
    'colorFamilyNames': [
      'White & Pastel'
    ],
    'brandKey': 'SW',
    'red': 237,
    'green': 234,
    'blue': 224,
    'hue': 0.128205128205128,
    'saturation': 0.26530612244897983,
    'lightness': 0.903921568627451,
    'hex': '#edeae0',
    'isDark': false,
    'storeStripLocator': '255-C2',
    'similarColors': [
      '2857',
      '11364',
      '2682',
      '2872',
      '2768',
      '2767',
      '2690',
      '2686',
      '2071',
      '1593'
    ]
  }
}

// eslint-disable-next-line no-unused-vars
const createPaintScene = (props = {}) => {
  return shallow(<PaintScene {...defaultProps} {...props} />)
}
