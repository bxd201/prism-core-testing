// @flow
import cloneDeep from 'lodash/cloneDeep'
import sample from 'lodash/sample'

import type { ColorSetPayload, Color } from '../../../src/shared/types/Colors'

export const Colors: ColorSetPayload = {
  "Red": [
    [
      {
        "colorNumber": "6561",
        "coordinatingColors": {
          "coord2ColorId": 1926,
          "coord1ColorId": 2250,
          "whiteColorId": 2681
        },
        "description": [
          "Subdued",
          "Muted",
          "Brilliant",
          "Radiant"
        ],
        "id": "2248",
        "isExterior": true,
        "isInterior": true,
        "name": "Teaberry",
        "rgb": 15454683,
        "lrv": 68.551,
        "colorFamilyNames": [
          "Red"
        ],
        "brandKey": "SW",
        "red": 235,
        "green": 209,
        "blue": 219,
        "hue": 0.935897435897436,
        "saturation": 0.39393939393939387,
        "lightness": 0.8705882352941177,
        "hex": "#ebd1db",
        "isDark": false,
        "cssrgb": "rgb(235,209,219)",
        "storeStripLocator": "102-C1",
        "similarColors": [
          "2255",
          "2262",
          "2269",
          "2662",
          "2535",
          "2276",
          "2658",
          "1974",
          "2543",
          "2531"
        ]
      },
      {
        "colorNumber": "6568",
        "coordinatingColors": {
          "coord2ColorId": 11244,
          "coord1ColorId": 2687,
          "whiteColorId": 2681
        },
        "description": [
          "Subdued",
          "Muted",
          "Brilliant",
          "Radiant"
        ],
        "id": "2255",
        "isExterior": true,
        "isInterior": true,
        "name": "Lighthearted Pink",
        "rgb": 15586781,
        "lrv": 70.758,
        "brandedCollectionIds": [
          31797,
          31791
        ],
        "brandedCollectionNames": [
          "Pottery Barn Fall/Winter 2018",
          "Pottery Barn Fall/Winter 2018"
        ],
        "colorFamilyNames": [
          "Red"
        ],
        "brandKey": "SW",
        "red": 237,
        "green": 213,
        "blue": 221,
        "hue": 0.9444444444444445,
        "saturation": 0.3999999999999999,
        "lightness": 0.8823529411764706,
        "hex": "#edd5dd",
        "isDark": false,
        "cssrgb": "rgb(237,213,221)",
        "storeStripLocator": "103-C1",
        "similarColors": [
          "2248",
          "2262",
          "2269",
          "2276",
          "1974",
          "1981",
          "2658",
          "1995",
          "2662",
          "1988"
        ]
      }
    ]
  ]
}

export function getColors (): ColorSetPayload {
  return cloneDeep(Colors)
}

export function getColor (): Color | void {
  const colors = getColors()
  const fam1 = Object.keys(colors)[0]
  if (colors[fam1]) {
    return sample(colors[fam1][0])
  }
}
