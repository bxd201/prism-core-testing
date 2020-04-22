// @flow
import { getDeltaE00 } from 'delta-e'
import tinycolor from '@ctrl/tinycolor'

export const throttleDragTime = 5
// we need this two const to make sure cursor always point to the center of preview circle
export const activedPinsHalfWidth = 24

export const getImagesCollectionsData = (tabList: Array<any>, tabId: string): any => {
  let collectionData = []
  let tabMap = {}
  let j = 0

  tabList.forEach((tab: Object) => {
    let collection = allCollectionsData.find((data: any): any => {
      return data.tabId === tab.id
    })
    let i = j
    let eachTabLength = collection && collection.collections.length

    while (i < j + eachTabLength) {
      tabMap[i] = tab.id
      i++
    }
    j += eachTabLength
    const items = collection && collection.collections
    collectionData.push(items)
  })

  const flattenData = collectionData && collectionData.reduce(function (prev: any, curr: any): any {
    return prev.concat<Array<any>, Array<any>>(curr)
  }, [])

  /* The result object will be used for rendering carousel. collectionData is the flatten array, because
    we need rendring carousel in a infinity loop. meanwhile, we need create a map that maping current carousel index to each tab,
    so we can get to know which tab are we in when we play around with carousel
  */
  let result = {
    collectionData: flattenData,
    tabMap: tabMap
  }
  return result
}

export const getRGBInitPins = (acgColors: Array<Object>) => {
  return acgColors.map<Object>((acgColor: any): Object => {
    return {
      rgbArray: [acgColor.r, acgColor.g, acgColor.b],
      rgbValue: `rgb(${acgColor.r},${acgColor.g},${acgColor.b})`,
      translateValueX: acgColor.x,
      translateValueY: acgColor.y
    }
  })
}

export const rgb2lab = (rgb: Array<any>) => {
  let r = rgb[0] / 255
  let g = rgb[1] / 255
  let b = rgb[2] / 255
  let x; let y; let z

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116
  y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116
  z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

export const renderingPins = (initPins: Array<Object>, canvasOffsetWidth: number, canvasOffsetHeight: number, brandColors: Array) => {
  const RGBinitPins = getRGBInitPins(initPins)
  return RGBinitPins.map<Object>((acgColor: any, index: number): Object => {
    const calculateTranslateX = acgColor.translateValueX * canvasOffsetWidth
    const calculateTranslateY = acgColor.translateValueY * canvasOffsetHeight
    const arrayIndex = findBrandColor(acgColor.rgbArray, brandColors)
    const rgbValueBrandColor = 'rgb(' + brandColors[arrayIndex + 2] + ')'
    let isContentLeft = false
    if (calculateTranslateX < canvasOffsetWidth / 2) {
      isContentLeft = true
    }
    return {
      isActiveFlag: (initPins.length - 1 === index),
      colorName: brandColors[arrayIndex],
      colorNumber: brandColors[arrayIndex + 1],
      rgbValue: rgbValueBrandColor,
      pinNumber: index,
      isContentLeft: isContentLeft,
      translateX: calculateTranslateX,
      translateY: calculateTranslateY
    }
  })
}

export const findBrandColorWithDeltaE00 = (currentPixelRGB: Array<number>, brandColors: Array) => {
  let currentPixelInLABarray = rgb2lab(currentPixelRGB)
  let theMostCloseDistance = 100
  let index = 0
  let currentPixelInLAB = { L: currentPixelInLABarray[0], A: currentPixelInLABarray[1], B: currentPixelInLABarray[2] }
  for (let arrayIndex = 0; arrayIndex < brandColors.length; arrayIndex += 6) {
    let thisSWinLAB = { L: brandColors[arrayIndex + 3], A: brandColors[arrayIndex + 4], B: brandColors[arrayIndex + 5] }
    let colorDistance = getDeltaE00(currentPixelInLAB, thisSWinLAB)
    if (colorDistance < theMostCloseDistance) {
      theMostCloseDistance = colorDistance
      index = arrayIndex
    }
  }
  return index
}

export const findBrandColor = (currentPixelRGB: Array<number>, brandColors: Array) => {
  const currentPixelHex = tinycolor(`rgb (${currentPixelRGB[0]}, ${currentPixelRGB[1]}, ${currentPixelRGB[2]})`).toHex()
  let minDistance
  const n = brandColors.length
  let index = 0
  for (let brandColorsIndex = 0; brandColorsIndex < n; brandColorsIndex += 6) {
    const brandColorHex = tinycolor(`rgb (${brandColors[brandColorsIndex + 2]})`).toHex()
    const distance = measureDistance(currentPixelHex, brandColorHex)
    if (typeof minDistance === 'undefined' || distance < minDistance) {
      minDistance = distance
      index = brandColorsIndex
    }
  }
  return index
}

export const measureDistance = (color1: string, color2: string) => {
  const position1 = getChromaLuma(color1)
  const position2 = getChromaLuma(color2)
  const redDelta = position1[0] - position2[0]
  const greenDelta = position1[1] - position2[1]
  const lumaDelta = position1[2] - position2[2]
  const distance = redDelta * redDelta + greenDelta * greenDelta + lumaDelta * lumaDelta
  return distance
}

export const getChromaLuma = (rgbString: string) => {
  const color = tinycolor(rgbString)
  const luminosity = color.getLuminance()
  const colorRgb = color.toRgb()
  const red = colorRgb.r
  const green = colorRgb.g
  const blue = colorRgb.b
  const sum = red + green + blue
  let redChroma
  let greenChroma
  if (sum > 25) {
    redChroma = red / sum
    greenChroma = green / sum
  } else {
    redChroma = 1 / 3
    greenChroma = 1 / 3
  }

  return [redChroma, greenChroma, luminosity]
}

const allCollectionsData = [
  {
    tabId: 'tab1',
    tabName: 'MOST POPULAR',
    collections: [
      {
        id: 'tab1-1',
        img: require('src/images/inspirational-photos/green-thumb/GreenThumb1.jpg'),
        initPins: [
          { r: 91, g: 200, b: 255, x: 0.3769487750556793, y: 0.6694045174537988 },
          { r: 217, g: 251, b: 255, x: 0.43207126948775054, y: 0.1673511293634497 },
          { r: 173, g: 241, b: 255, x: 0.5579064587973274, y: 0.1570841889117043 },
          { r: 206, g: 184, b: 188, x: 0.8184855233853007, y: 0.012320328542094456 },
          { r: 203, g: 147, b: 155, x: 0.1453229398663697, y: 0.057494866529774126 },
          { r: 132, g: 239, b: 255, x: 0.33296213808463254, y: 0.8685831622176592 },
          { r: 59, g: 95, b: 139, x: 0.3368596881959911, y: 0.5677618069815195 },
          { r: 132, g: 201, b: 255, x: 0.26837416481069043, y: 0.5523613963039015 }
        ]
      },
      {
        id: 'tab1-2',
        img: require('src/images/inspirational-photos/green-thumb/GreenThumb2.jpg'),
        initPins: [
          { r: 39, g: 0, b: 20, x: 0.13697104677060135, y: 0.21252566735112938 },
          { r: 79, g: 102, b: 139, x: 0.383630289532294, y: 0.8552361396303901 },
          { r: 71, g: 0, b: 64, x: 0.45879732739420936, y: 0.8141683778234087 },
          { r: 72, g: 0, b: 23, x: 0.6798440979955457, y: 0.22895277207392198 },
          { r: 45, g: 55, b: 162, x: 0.8814031180400891, y: 0.2402464065708419 },
          { r: 201, g: 172, b: 147, x: 0.4665924276169265, y: 0.4086242299794661 },
          { r: 211, g: 106, b: 189, x: 0.6152561247216035, y: 0.01026694045174538 },
          { r: 1, g: 0, b: 8, x: 0.3207126948775056, y: 0.7638603696098563 }
        ]
      },
      {
        id: 'tab1-3',
        img: require('src/images/inspirational-photos/green-thumb/GreenThumb3.jpg'),
        initPins: [
          { r: 99, g: 112, b: 7, x: 0.3145879732739421, y: 0.1591375770020534 },
          { r: 46, g: 54, b: 0, x: 0.9337416481069042, y: 0.13141683778234087 },
          { r: 139, g: 156, b: 0, x: 0.1965478841870824, y: 0.502053388090349 },
          { r: 255, g: 231, b: 195, x: 0.1915367483296214, y: 0.2351129363449692 },
          { r: 255, g: 242, b: 52, x: 0.7522271714922049, y: 0.2864476386036961 },
          { r: 174, g: 158, b: 19, x: 0.6681514476614699, y: 0.4271047227926078 },
          { r: 201, g: 220, b: 15, x: 0.5417594654788419, y: 0.10164271047227925 },
          { r: 4, g: 0, b: 1, x: 0.6096881959910914, y: 0.11601642710472279 }
        ]
      },
      {
        id: 'tab1-4',
        img: require('src/images/inspirational-photos/green-thumb/GreenThumb4.jpg'),
        initPins: [
          { r: 89, g: 111, b: 107, x: 0.2516703786191537, y: 0.08829568788501027 },
          { r: 218, g: 182, b: 125, x: 0.5044543429844098, y: 0.24845995893223818 },
          { r: 204, g: 134, b: 81, x: 0.3930957683741648, y: 0.5605749486652978 },
          { r: 236, g: 154, b: 63, x: 0.5556792873051225, y: 0.2402464065708419 },
          { r: 236, g: 186, b: 80, x: 0.4905345211581292, y: 0.2351129363449692 },
          { r: 229, g: 114, b: 42, x: 0.4521158129175947, y: 0.49589322381930184 },
          { r: 113, g: 68, b: 54, x: 0.5428730512249443, y: 0.30390143737166325 },
          { r: 214, g: 201, b: 173, x: 0.7255011135857461, y: 0.3193018480492813 }
        ]
      },
      {
        id: 'tab1-5',
        img: require('src/images/inspirational-photos/green-thumb/GreenThumb5.jpg'),
        initPins: [
          { r: 118, g: 0, b: 20, x: 0.09743875278396437, y: 0.42505133470225875 },
          { r: 229, g: 74, b: 0, x: 0.8212694877505567, y: 0.555441478439425 },
          { r: 255, g: 106, b: 78, x: 0.2633630289532294, y: 0.8039014373716632 },
          { r: 183, g: 74, b: 48, x: 0.4626948775055679, y: 0.029774127310061602 },
          { r: 93, g: 89, b: 0, x: 0.6792873051224945, y: 0.40349075975359344 },
          { r: 255, g: 191, b: 154, x: 0.2572383073496659, y: 0.7412731006160165 },
          { r: 8, g: 3, b: 4, x: 0.7243875278396437, y: 0.44455852156057496 }
        ]
      }
    ]
  },
  {
    tabId: 'tab2',
    collections: [
      {
        id: 'tab2-1',
        img: require('src/images/inspirational-photos/wildlife/Wildlife1.jpg'),
        initPins: [
          { r: 78, g: 53, b: 31, x: 0.6041202672605791, y: 0.7012320328542094 },
          { r: 223, g: 220, b: 202, x: 0.4298440979955457, y: 0.43634496919917864 },
          { r: 108, g: 72, b: 41, x: 0.8557906458797327, y: 0.7638603696098563 },
          { r: 101, g: 54, b: 29, x: 0.4621380846325167, y: 0.1570841889117043 },
          { r: 100, g: 66, b: 47, x: 0.6542316258351893, y: 0.7546201232032854 },
          { r: 181, g: 160, b: 148, x: 0.42316258351893093, y: 0.6139630390143738 },
          { r: 15, g: 5, b: 0, x: 0.6130289532293987, y: 0.528747433264887 },
          { r: 102, g: 90, b: 77, x: 0.5551224944320713, y: 0.2032854209445585 }
        ]
      },
      {
        id: 'tab2-2',
        img: require('src/images/inspirational-photos/wildlife/Wildlife2.jpg'),
        initPins: [
          { r: 142, g: 182, b: 41, x: 0.4515590200445434, y: 0.01642710472279261 },
          { r: 69, g: 132, b: 22, x: 0.6714922048997772, y: 0.003080082135523614 },
          { r: 90, g: 147, b: 137, x: 0.4782850779510022, y: 0.419917864476386 },
          { r: 115, g: 139, b: 148, x: 0.1520044543429844, y: 0.7238193018480493 },
          { r: 33, g: 52, b: 112, x: 0.26169265033407574, y: 0.4455852156057495 },
          { r: 163, g: 169, b: 60, x: 0.12416481069042316, y: 0.5841889117043121 },
          { r: 178, g: 167, b: 165, x: 0.37806236080178174, y: 0.5143737166324436 },
          { r: 84, g: 120, b: 73, x: 0.4125835189309577, y: 0.20944558521560575 }
        ]
      },
      {
        id: 'tab2-3',
        img: require('src/images/inspirational-photos/wildlife/Wildlife3.jpg'),
        initPins: [
          { r: 7, g: 212, b: 250, x: 0.6631403118040089, y: 0.9168377823408624 },
          { r: 24, g: 173, b: 255, x: 0.2182628062360802, y: 0.7361396303901437 },
          { r: 202, g: 165, b: 255, x: 0.4042316258351893, y: 0.17864476386036962 },
          { r: 154, g: 130, b: 255, x: 0.5545657015590201, y: 0.4989733059548255 },
          { r: 73, g: 11, b: 29, x: 0.4537861915367483, y: 0.057494866529774126 },
          { r: 209, g: 148, b: 207, x: 0.36971046770601335, y: 0.433264887063655 },
          { r: 255, g: 235, b: 161, x: 0.09131403118040089, y: 0.1837782340862423 },
          { r: 7, g: 246, b: 255, x: 0.9237193763919822, y: 0.35010266940451745 }
        ]
      },
      {
        id: 'tab2-4',
        img: require('src/images/inspirational-photos/wildlife/Wildlife4.jpg'),
        initPins: [
          { r: 220, g: 184, b: 169, x: 0.5133630289532294, y: 0.555441478439425 },
          { r: 255, g: 110, b: 31, x: 0.41648106904231624, y: 0.7505133470225873 },
          { r: 125, g: 159, b: 177, x: 0.32962138084632514, y: 0.7515400410677618 },
          { r: 226, g: 49, b: 0, x: 0.22048997772828507, y: 0.34496919917864477 },
          { r: 255, g: 165, b: 3, x: 0.6525612472160356, y: 0.4815195071868583 },
          { r: 229, g: 160, b: 134, x: 0.3262806236080178, y: 0.21971252566735114 },
          { r: 255, g: 132, b: 3, x: 0.4136971046770601, y: 0.12628336755646818 },
          { r: 249, g: 250, b: 255, x: 0.6241648106904232, y: 0.4240246406570842 }
        ]
      },
      {
        id: 'tab2-5',
        img: require('src/images/inspirational-photos/wildlife/Wildlife5.jpg'),
        initPins: [
          { r: 255, g: 231, b: 181, x: 0.34966592427616927, y: 0.9014373716632443 },
          { r: 153, g: 98, b: 0, x: 0.6002227171492205, y: 0.7402464065708418 },
          { r: 196, g: 208, b: 237, x: 0.4086859688195991, y: 0.3275154004106776 },
          { r: 45, g: 0, b: 3, x: 0.3123608017817372, y: 0.3275154004106776 },
          { r: 255, g: 176, b: 182, x: 0.34242761692650336, y: 0.4548254620123203 },
          { r: 255, g: 143, b: 152, x: 0.2817371937639198, y: 0.4948665297741273 },
          { r: 255, g: 108, b: 121, x: 0.34688195991091314, y: 0.47638603696098564 },
          { r: 255, g: 254, b: 248, x: 0.4131403118040089, y: 0.7002053388090349 }
        ]
      }
    ]
  },
  {
    tabId: 'tab3',
    collections: [
      {
        id: 'tab3-1',
        img: require('src/images/inspirational-photos/cuisine/Cuisine1.jpg'),
        initPins: [
          { r: 203, g: 164, b: 199, x: 0.4610244988864143, y: 0.20636550308008214 },
          { r: 151, g: 138, b: 201, x: 0.339086859688196, y: 0.18993839835728954 },
          { r: 147, g: 76, b: 127, x: 0.8279510022271714, y: 0.1837782340862423 },
          { r: 148, g: 141, b: 103, x: 0.7505567928730512, y: 0.7546201232032854 },
          { r: 164, g: 221, b: 107, x: 0.0935412026726058, y: 0.7946611909650924 },
          { r: 184, g: 246, b: 80, x: 0.6943207126948775, y: 0.019507186858316223 },
          { r: 180, g: 200, b: 232, x: 0.1720489977728285, y: 0.10677618069815195 },
          { r: 255, g: 252, b: 254, x: 0.38530066815144765, y: 0.18583162217659138 }
        ]
      },
      {
        id: 'tab3-2',
        img: require('src/images/inspirational-photos/cuisine/Cuisine2.jpg'),
        initPins: [
          { r: 253, g: 137, b: 77, x: 0.4309576837416481, y: 0.48973305954825463 },
          { r: 0, g: 56, b: 48, x: 0.2906458797327394, y: 0.0944558521560575 },
          { r: 255, g: 200, b: 102, x: 0.2182628062360802, y: 0.07494866529774127 },
          { r: 0, g: 180, b: 178, x: 0.732739420935412, y: 0.9147843942505134 },
          { r: 215, g: 59, b: 0, x: 0.4125835189309577, y: 0.27104722792607805 },
          { r: 255, g: 225, b: 185, x: 0.6904231625835189, y: 0.001026694045174538 },
          { r: 0, g: 90, b: 78, x: 0.6815144766146993, y: 0.7792607802874744 },
          { r: 0, g: 16, b: 9, x: 0.34521158129175944, y: 0.8850102669404517 }
        ]
      },
      {
        id: 'tab3-3',
        img: require('src/images/inspirational-photos/cuisine/Cuisine3.jpg'),
        initPins: [
          { r: 180, g: 53, b: 0, x: 0.6770601336302895, y: 0.7412731006160165 },
          { r: 77, g: 3, b: 0, x: 0.7483296213808464, y: 0.5934291581108829 },
          { r: 24, g: 39, b: 3, x: 0.24721603563474387, y: 0.3336755646817248 },
          { r: 255, g: 105, b: 21, x: 0.5194877505567929, y: 0.28542094455852157 },
          { r: 88, g: 113, b: 30, x: 0.1965478841870824, y: 0.2433264887063655 },
          { r: 255, g: 66, b: 12, x: 0.49443207126948774, y: 0.015400410677618069 },
          { r: 204, g: 134, b: 82, x: 0.8034521158129176, y: 0.704312114989733 },
          { r: 100, g: 66, b: 47, x: 0.6937639198218263, y: 0.02566735112936345 }
        ]
      },
      {
        id: 'tab3-4',
        img: require('src/images/inspirational-photos/cuisine/Cuisine4.jpg'),
        initPins: [
          { r: 164, g: 130, b: 127, x: 0.5612472160356348, y: 0.1673511293634497 },
          { r: 131, g: 174, b: 145, x: 0.35412026726057905, y: 0.08316221765913757 },
          { r: 255, g: 175, b: 5, x: 0.41035634743875277, y: 0.528747433264887 },
          { r: 251, g: 149, b: 153, x: 0.15033407572383073, y: 0.3336755646817248 },
          { r: 148, g: 0, b: 1, x: 0.19042316258351893, y: 0.1735112936344969 },
          { r: 255, g: 187, b: 188, x: 0.14643652561247217, y: 0.4127310061601643 },
          { r: 255, g: 142, b: 4, x: 0.5551224944320713, y: 0.6509240246406571 },
          { r: 0, g: 5, b: 4, x: 0.7288418708240535, y: 0.9086242299794661 }
        ]
      },
      {
        id: 'tab3-5',
        img: require('src/images/inspirational-photos/cuisine/Cuisine5.jpg'),
        initPins: [
          { r: 234, g: 216, b: 183, x: 0.6531180400890868, y: 0.6981519507186859 },
          { r: 213, g: 194, b: 119, x: 0.7344097995545658, y: 0.6540041067761807 },
          { r: 188, g: 203, b: 153, x: 0.6581291759465479, y: 0.31519507186858314 },
          { r: 123, g: 136, b: 45, x: 0.7522271714922049, y: 0.3993839835728953 },
          { r: 219, g: 196, b: 81, x: 0.2544543429844098, y: 0.39014373716632444 },
          { r: 188, g: 136, b: 106, x: 0.09075723830734966, y: 0.12833675564681724 },
          { r: 218, g: 142, b: 84, x: 0.7639198218262806, y: 0.27104722792607805 },
          { r: 205, g: 211, b: 208, x: 0.14309576837416482, y: 0.13449691991786447 }
        ]
      }
    ]
  },
  {
    tabId: 'tab4',
    collections: [
      {
        id: 'tab4-1',
        img: require('src/images/inspirational-photos/great-outdoors/GreatOutdoors1.jpg'),
        initPins: [
          { r: 206, g: 172, b: 125, x: 0.2188195991091314, y: 0.7720739219712526 },
          { r: 102, g: 165, b: 191, x: 0.8023385300668151, y: 0.003080082135523614 },
          { r: 91, g: 178, b: 231, x: 0.5573496659242761, y: 0.06673511293634497 },
          { r: 208, g: 203, b: 156, x: 0.35579064587973275, y: 0.7997946611909651 },
          { r: 145, g: 107, b: 113, x: 0.3056792873051225, y: 0.7905544147843943 },
          { r: 219, g: 169, b: 89, x: 0.6614699331848553, y: 0.63347022587269 },
          { r: 46, g: 164, b: 227, x: 0.5100222717149221, y: 0.001026694045174538 },
          { r: 182, g: 211, b: 224, x: 0.7678173719376392, y: 0.09240246406570841 }
        ]
      },
      {
        id: 'tab4-2',
        img: require('src/images/inspirational-photos/great-outdoors/GreatOutdoors2.jpg'),
        initPins: [
          { r: 180, g: 155, b: 118, x: 0.8279510022271714, y: 0.6981519507186859 },
          { r: 221, g: 184, b: 113, x: 0.8507795100222717, y: 0.27002053388090347 },
          { r: 55, g: 22, b: 30, x: 0.755011135857461, y: 0.8706365503080082 },
          { r: 240, g: 245, b: 194, x: 0.9181514476614699, y: 0.2915811088295688 },
          { r: 11, g: 13, b: 45, x: 0.21603563474387527, y: 0.6160164271047228 },
          { r: 211, g: 249, b: 219, x: 0.3123608017817372, y: 0.9245995893223819 },
          { r: 255, g: 254, b: 248, x: 0.5384187082405345, y: 0.6591375770020534 }
        ]
      },
      {
        id: 'tab4-3',
        img: require('src/images/inspirational-photos/great-outdoors/GreatOutdoors3.jpg'),
        initPins: [
          { r: 0, g: 41, b: 62, x: 0.41648106904231624, y: 0.9455852156057495 },
          { r: 220, g: 169, b: 139, x: 0.44320712694877507, y: 0.19404517453798767 },
          { r: 60, g: 52, b: 0, x: 0.8880846325167038, y: 0.8234086242299795 },
          { r: 0, g: 74, b: 79, x: 0.5228285077951003, y: 0.5924024640657084 },
          { r: 85, g: 134, b: 109, x: 0.5779510022271714, y: 0.5862422997946611 },
          { r: 255, g: 221, b: 56, x: 0.9175946547884187, y: 0.8798767967145791 },
          { r: 152, g: 178, b: 122, x: 0.4437639198218263, y: 0.7361396303901437 },
          { r: 145, g: 127, b: 124, x: 0.8190423162583519, y: 0.33675564681724846 }
        ]
      },
      {
        id: 'tab4-4',
        img: require('src/images/inspirational-photos/great-outdoors/GreatOutdoors4.jpg'),
        initPins: [
          { r: 0, g: 48, b: 87, x: 0.8758351893095768, y: 0.8819301848049281 },
          { r: 9, g: 132, b: 193, x: 0.7600222717149221, y: 0.01642710472279261 },
          { r: 255, g: 246, b: 243, x: 0.561804008908686, y: 0.29568788501026694 },
          { r: 255, g: 220, b: 189, x: 0.5250556792873051, y: 0.32238193018480493 },
          { r: 0, g: 55, b: 49, x: 0.6319599109131403, y: 0.5297741273100616 },
          { r: 143, g: 165, b: 136, x: 0.5462138084632516, y: 0.39630390143737165 },
          { r: 224, g: 176, b: 111, x: 0.35634743875278396, y: 0.3870636550308008 },
          { r: 0, g: 23, b: 32, x: 0.8157015590200446, y: 0.7032854209445585 }
        ]
      },
      {
        id: 'tab4-5',
        img: require('src/images/inspirational-photos/great-outdoors/GreatOutdoors5.jpg'),
        initPins: [
          { r: 45, g: 22, b: 0, x: 0.2633630289532294, y: 0.39014373716632444 },
          { r: 142, g: 79, b: 69, x: 0.31570155902004454, y: 0.12628336755646818 },
          { r: 150, g: 47, b: 24, x: 0.38697104677060135, y: 0.7279260780287474 },
          { r: 155, g: 90, b: 39, x: 0.7065701559020044, y: 0.486652977412731 },
          { r: 31, g: 41, b: 0, x: 0.5100222717149221, y: 0.5739219712525667 },
          { r: 255, g: 171, b: 67, x: 0.9304008908685969, y: 0.4055441478439425 },
          { r: 209, g: 71, b: 39, x: 0.46380846325167036, y: 0.22895277207392198 },
          { r: 0, g: 1, b: 7, x: 0.5328507795100222, y: 0.3193018480492813 }
        ]
      }
    ]
  },
  {
    tabId: 'tab5',
    collections: [
      {
        id: 'tab5-1',
        img: require('src/images/inspirational-photos/globetrotting/Globetrotting1.jpg'),
        initPins: [
          { r: 237, g: 55, b: 17, x: 0.4521158129175947, y: 0.4671457905544148 },
          { r: 132, g: 1, b: 0, x: 0.5506681514476615, y: 0.8234086242299795 },
          { r: 255, g: 212, b: 122, x: 0.24888641425389754, y: 0.2032854209445585 },
          { r: 196, g: 133, b: 96, x: 0.14866369710467706, y: 0.09753593429158111 },
          { r: 68, g: 104, b: 0, x: 0.8552338530066815, y: 0.0728952772073922 },
          { r: 255, g: 158, b: 154, x: 0.9298440979955457, y: 0.7104722792607803 },
          { r: 108, g: 143, b: 0, x: 0.9036748329621381, y: 0.3459958932238193 },
          { r: 2, g: 0, b: 1, x: 0.22271714922049, y: 0.8542094455852156 }
        ]
      },
      {
        id: 'tab5-2',
        img: require('src/images/inspirational-photos/globetrotting/Globetrotting2.jpg'),
        initPins: [
          { r: 10, g: 54, b: 172, x: 0.2951002227171492, y: 0.059548254620123205 },
          { r: 208, g: 188, b: 144, x: 0.24443207126948774, y: 0.6139630390143738 },
          { r: 44, g: 132, b: 212, x: 0.8830734966592427, y: 0.06878850102669405 },
          { r: 56, g: 70, b: 139, x: 0.6726057906458798, y: 0.311088295687885 },
          { r: 58, g: 133, b: 179, x: 0.2984409799554566, y: 0.14168377823408623 },
          { r: 225, g: 183, b: 106, x: 0.4732739420935412, y: 0.3798767967145791 },
          { r: 27, g: 165, b: 227, x: 0.39643652561247217, y: 0.3408624229979466 },
          { r: 255, g: 249, b: 238, x: 0.482739420935412, y: 0.6057494866529775 }
        ]
      },
      {
        id: 'tab5-3',
        img: require('src/images/inspirational-photos/globetrotting/Globetrotting3.jpg'),
        initPins: [
          { r: 29, g: 29, b: 22, x: 0.8335189309576837, y: 0.3008213552361396 },
          { r: 3, g: 39, b: 83, x: 0.4755011135857461, y: 0.6242299794661191 },
          { r: 91, g: 184, b: 255, x: 0.6469933184855234, y: 0.19815195071868583 },
          { r: 255, g: 216, b: 89, x: 0.8830734966592427, y: 0.8747433264887063 },
          { r: 66, g: 30, b: 0, x: 0.6553452115812918, y: 0.688911704312115 },
          { r: 2, g: 140, b: 202, x: 0.42037861915367486, y: 0.4702258726899384 },
          { r: 166, g: 166, b: 27, x: 0.8301781737193764, y: 0.012320328542094456 },
          { r: 2, g: 164, b: 255, x: 0.6648106904231625, y: 0.17967145790554415 }
        ]
      },
      {
        id: 'tab5-4',
        img: require('src/images/inspirational-photos/globetrotting/Globetrotting4.jpg'),
        initPins: [
          { r: 147, g: 143, b: 187, x: 0.12750556792873052, y: 0.5595482546201233 },
          { r: 255, g: 213, b: 151, x: 0.5451002227171492, y: 0.1375770020533881 },
          { r: 255, g: 237, b: 204, x: 0.923162583518931, y: 0.06365503080082136 },
          { r: 199, g: 228, b: 253, x: 0.5144766146993318, y: 0 },
          { r: 147, g: 179, b: 245, x: 0.2717149220489978, y: 0.824435318275154 },
          { r: 233, g: 181, b: 166, x: 0.3062360801781737, y: 0.7648870636550308 },
          { r: 109, g: 134, b: 93, x: 0.38028953229398665, y: 0.8408624229979466 },
          { r: 5, g: 0, b: 2, x: 0.40979955456570155, y: 0.6745379876796714 }
        ]
      },
      {
        id: 'tab5-5',
        img: require('src/images/inspirational-photos/globetrotting/Globetrotting5.jpg'),
        initPins: [
          { r: 121, g: 149, b: 0, x: 0.1915367483296214, y: 0.75564681724846 },
          { r: 70, g: 40, b: 0, x: 0.36414253897550114, y: 0.797741273100616 },
          { r: 202, g: 231, b: 244, x: 0.40144766146993316, y: 0.22484599589322382 },
          { r: 255, g: 85, b: 84, x: 0.36915367483296213, y: 0.5944558521560575 },
          { r: 104, g: 134, b: 27, x: 0.938195991091314, y: 0.9188911704312115 },
          { r: 42, g: 63, b: 31, x: 0.17761692650334077, y: 0.6642710472279261 },
          { r: 255, g: 119, b: 126, x: 0.366369710467706, y: 0.12422997946611909 },
          { r: 255, g: 246, b: 243, x: 0.7744988864142539, y: 0.8090349075975359 }
        ]
      }
    ]
  },
  {
    tabId: 'tab6',
    collections: [
      {
        id: 'tab6-1',
        img: require('src/images/inspirational-photos/rustic/Rustic1.jpg'),
        initPins: [
          { r: 13, g: 89, b: 148, x: 0.9376391982182628, y: 0.38295687885010266 },
          { r: 71, g: 187, b: 247, x: 0.3730512249443207, y: 0.6201232032854209 },
          { r: 200, g: 228, b: 255, x: 0.15089086859688197, y: 0.12012320328542095 },
          { r: 249, g: 242, b: 204, x: 0.3307349665924276, y: 0.5143737166324436 },
          { r: 125, g: 45, b: 53, x: 0.6597995545657016, y: 0.26591375770020537 },
          { r: 152, g: 26, b: 28, x: 0.6074610244988864, y: 0.04620123203285421 },
          { r: 147, g: 121, b: 43, x: 0.1358574610244989, y: 0.5882956878850103 },
          { r: 255, g: 251, b: 254, x: 0.32461024498886415, y: 0.4517453798767967 }
        ]
      },
      {
        id: 'tab6-2',
        img: require('src/images/inspirational-photos/rustic/Rustic2.jpg'),
        initPins: [
          { r: 181, g: 203, b: 210, x: 0.5278396436525612, y: 0.7217659137577002 },
          { r: 255, g: 204, b: 187, x: 0.8479955456570156, y: 0.2053388090349076 },
          { r: 183, g: 95, b: 15, x: 0.9326280623608018, y: 0.4455852156057495 },
          { r: 255, g: 241, b: 201, x: 0.6197104677060133, y: 0.39630390143737165 },
          { r: 83, g: 0, b: 1, x: 0.9047884187082406, y: 0.4517453798767967 },
          { r: 30, g: 7, b: 45, x: 0.7917594654788419, y: 0.704312114989733 },
          { r: 172, g: 190, b: 161, x: 0.4933184855233853, y: 0.891170431211499 },
          { r: 170, g: 158, b: 153, x: 0.3674832962138085, y: 0.30390143737166325 }
        ]
      },
      {
        id: 'tab6-3',
        img: require('src/images/inspirational-photos/rustic/Rustic3.jpg'),
        initPins: [
          { r: 205, g: 225, b: 255, x: 0.6197104677060133, y: 0.24229979466119098 },
          { r: 242, g: 222, b: 192, x: 0.7121380846325167, y: 0.4383983572895277 },
          { r: 168, g: 127, b: 65, x: 0.7744988864142539, y: 0.5092402464065708 },
          { r: 143, g: 92, b: 79, x: 0.7010022271714922, y: 0.5595482546201233 },
          { r: 224, g: 158, b: 65, x: 0.23719376391982183, y: 0.09240246406570841 },
          { r: 255, g: 244, b: 182, x: 0.7316258351893096, y: 0.8305954825462012 },
          { r: 47, g: 36, b: 83, x: 0.8084632516703786, y: 0.7731006160164271 },
          { r: 2, g: 0, b: 1, x: 0.7767260579064588, y: 0.03285420944558522 }
        ]
      },
      {
        id: 'tab6-4',
        img: require('src/images/inspirational-photos/rustic/Rustic4.jpg'),
        initPins: [
          { r: 64, g: 13, b: 11, x: 0.544543429844098, y: 0.5051334702258727 },
          { r: 234, g: 34, b: 0, x: 0.7366369710467706, y: 0.5092402464065708 },
          { r: 248, g: 80, b: 12, x: 0.5902004454342984, y: 0.5944558521560575 },
          { r: 216, g: 130, b: 120, x: 0.38585746102449886, y: 0.48254620123203285 },
          { r: 255, g: 90, b: 63, x: 0.42538975501113585, y: 0.6119096509240246 },
          { r: 211, g: 86, b: 73, x: 0.4226057906458797, y: 0.5379876796714579 },
          { r: 255, g: 121, b: 36, x: 0.6403118040089086, y: 0.5595482546201233 },
          { r: 255, g: 246, b: 243, x: 0.6269487750556793, y: 0.5954825462012321 }
        ]
      },
      {
        id: 'tab6-5',
        img: require('src/images/inspirational-photos/rustic/Rustic5.jpg'),
        initPins: [
          { r: 125, g: 141, b: 147, x: 0.7611358574610245, y: 0.043121149897330596 },
          { r: 255, g: 193, b: 50, x: 0.09187082405345212, y: 0.9188911704312115 },
          { r: 135, g: 83, b: 68, x: 0.7060133630289532, y: 0.8347022587268994 },
          { r: 207, g: 170, b: 98, x: 0.38530066815144765, y: 0.9458932238193019 },
          { r: 152, g: 113, b: 0, x: 0.33240534521158127, y: 0.23921971252566734 },
          { r: 255, g: 183, b: 87, x: 0.7338530066815144, y: 0.9399589322381931 },
          { r: 103, g: 85, b: 80, x: 0.5011135857461024, y: 0.7402464065708418 },
          { r: 229, g: 159, b: 104, x: 0.08518930957683742, y: 0.060574948665297744 }
        ]
      }
    ]
  },
  {
    tabId: 'tab7',
    collections: [
      {
        id: 'tab7-1',
        img: require('src/images/inspirational-photos/time-capsule/TimeCapsule1.jpg'),
        initPins: [
          { r: 253, g: 92, b: 3, x: 0.938195991091314, y: 0.5420944558521561 },
          { r: 253, g: 65, b: 36, x: 0.8418708240534521, y: 0.28234086242299794 },
          { r: 174, g: 20, b: 0, x: 0.5657015590200446, y: 0.8562628336755647 },
          { r: 162, g: 71, b: 70, x: 0.8919821826280624, y: 0.014373716632443531 },
          { r: 103, g: 164, b: 251, x: 0.623608017817372, y: 0.3726899383983573 },
          { r: 212, g: 96, b: 52, x: 0.7193763919821826, y: 0.055441478439425054 },
          { r: 255, g: 134, b: 162, x: 0.9309576837416481, y: 0.14476386036960986 },
          { r: 198, g: 197, b: 192, x: 0.6497772828507795, y: 0.7669404517453798 }
        ]
      },
      {
        id: 'tab7-2',
        img: require('src/images/inspirational-photos/time-capsule/TimeCapsule2.jpg'),
        initPins: [
          { r: 240, g: 193, b: 168, x: 0.2583518930957684, y: 0.001026694045174538 },
          { r: 211, g: 131, b: 123, x: 0.8006681514476615, y: 0.011293634496919919 },
          { r: 189, g: 113, b: 159, x: 0.52728285077951, y: 0.5872689938398358 },
          { r: 193, g: 75, b: 94, x: 0.7255011135857461, y: 0.29774127310061604 },
          { r: 121, g: 142, b: 110, x: 0.8028953229398663, y: 0.8182751540041068 },
          { r: 191, g: 79, b: 110, x: 0.7438752783964365, y: 0.2464065708418891 },
          { r: 228, g: 184, b: 198, x: 0.33407572383073497, y: 0.14887063655030802 }
        ]
      },
      {
        id: 'tab7-3',
        img: require('src/images/inspirational-photos/time-capsule/TimeCapsule3.jpg'),
        initPins: [
          { r: 4, g: 37, b: 0, x: 0.6948775055679287, y: 0.13963039014373715 },
          { r: 169, g: 133, b: 116, x: 0.6586859688195991, y: 0.6139630390143738 },
          { r: 163, g: 94, b: 80, x: 0.8853006681514477, y: 0.5318275154004107 },
          { r: 74, g: 127, b: 36, x: 0.8312917594654788, y: 0.2741273100616016 },
          { r: 195, g: 90, b: 52, x: 0.3040089086859688, y: 0.5646817248459959 },
          { r: 105, g: 73, b: 95, x: 0.24721603563474387, y: 0.3921971252566735 },
          { r: 102, g: 0, b: 3, x: 0.28452115812917594, y: 0.29671457905544146 },
          { r: 188, g: 188, b: 193, x: 0.1631403118040089, y: 0.7946611909650924 }
        ]
      },
      {
        id: 'tab7-4',
        img: require('src/images/inspirational-photos/time-capsule/TimeCapsule4.jpg'),
        initPins: [
          { r: 142, g: 180, b: 146, x: 0.272271714922049, y: 0.6324435318275154 },
          { r: 63, g: 38, b: 0, x: 0.6653674832962138, y: 0.6129363449691991 },
          { r: 106, g: 146, b: 154, x: 0.12583518930957685, y: 0.2669404517453799 },
          { r: 255, g: 189, b: 127, x: 0.505011135857461, y: 0.784394250513347 },
          { r: 255, g: 113, b: 103, x: 0.5634743875278396, y: 0.2669404517453799 },
          { r: 212, g: 186, b: 94, x: 0.7711581291759465, y: 0.5379876796714579 },
          { r: 152, g: 167, b: 105, x: 0.7839643652561247, y: 0.5030800821355236 },
          { r: 168, g: 105, b: 81, x: 0.4309576837416481, y: 0.9063449691991786 }
        ]
      },
      {
        id: 'tab7-5',
        img: require('src/images/inspirational-photos/time-capsule/TimeCapsule5.jpg'),
        initPins: [
          { r: 255, g: 1, b: 6, x: 0.2477728285077951, y: 0.33572895277207393 },
          { r: 253, g: 219, b: 201, x: 0.37639198218262804, y: 0.42813141683778233 },
          { r: 31, g: 63, b: 67, x: 0.7126948775055679, y: 0.6683778234086243 },
          { r: 151, g: 104, b: 51, x: 0.17928730512249444, y: 0.5872689938398358 },
          { r: 227, g: 120, b: 0, x: 0.23162583518930957, y: 0.8675564681724846 },
          { r: 129, g: 33, b: 41, x: 0.19320712694877507, y: 0.24127310061601642 },
          { r: 60, g: 123, b: 158, x: 0.5690423162583519, y: 0.6796714579055442 },
          { r: 248, g: 248, b: 253, x: 0.7405345211581291, y: 0.9055441478439425 }
        ]
      }
    ]
  }
]

export const collectionTabs = [
  { id: 'tab1', tabName: 'GREEN THUMB' },
  { id: 'tab2', tabName: 'WILDLIFE' },
  { id: 'tab3', tabName: 'CUISINE' },
  { id: 'tab4', tabName: 'GREAT OUTDOORS' },
  { id: 'tab5', tabName: 'GLOBETROTTING' },
  { id: 'tab6', tabName: 'RUSTIC FINDS' },
  { id: 'tab7', tabName: 'TIME CAPSULE' }
]
