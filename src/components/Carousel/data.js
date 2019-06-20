// This is temporary use for mock carousel data from api
// @flow
import type { Color } from '../types/Colors'
import * as Colors from '../../../__mocks__/data/color/Colors'
const colors = Colors.getAllColors()
const getExpertColors = (colors: Color, colorList: array) => {
  let data = []
  for (var i = 0; i < colorList.length; i = i + 3) {
    let tmp = []
    let j = 0
    while (j !== 3) {
      const color = Object.values(colors).find((color) => {
        return (colorList[i + j] === color.colorNumber)
      })
      tmp.push(color)
      j++
    }
    data.push(tmp)
  }
  return data
}
export const colorList = [
  '0071', '6039', '0053', '6232', '0041', '9171',
  '6496', '7063', '6747', '7579', '2739', '7502',
  '7701', '9174', '7636', '0063', '7006', '6808',
  '7622', '8917', '9110', '9178', '7538', '7578',
  '6732', '7000', '6797', '7623', '6039', '9179',
  '6224', '9175', '0034', '6839', '6071', '6656',
  '6774', '7675', '9101', '7568', '7048', '6044',
  '6424', '6573', '6680', '7592', '6244', '0037',
  '6265', '7613', '7577', '6557', '6169', '6720',
  '2844', '6221', '7104', '7001', '6650', '6967',
  '0007', '7076', '6222', '0064', '7030', '6263',
  '6052', '7566', '7666', '6788', '6841', '6156',
  '0077', '6258', '7647', '7612', '7697', '7057',
  '6510', '6131', '6199', '6464', '6556', '6771',
  '6921', '6859', '7018', '6963', '6711', '7036',
  '0073', '6463', '6353', '6164', '0012', '7674',
  '6840', '7602', '6109', '6988', '6768', '7006',
  '6759', '6344', '6802', '6349', '6020', '6307',
  '6545', '6417', '7592', '6026', '6117', '6467',
  '6247', '7031', '6155', '6979', '6725', '6963',
  '6479', '0071', '6249', '6607', '6107', '7083',
  '6018', '7058', '6256', '0056', '7662', '7135',
  '6265', '7071', '6010', '0015', '6113', '7604'
]

export const allCollectionsData = [
  {
    tabId: 'tab1',
    tabName: 'MOST POPULAR',
    collections: [
      {
        id: '1',
        name: '2019 Aficionado',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['7579', '2739', '6404', '6407', '7705', '7502', '2704']
      },
      {
        id: '2',
        name: '2019 Naturalist',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['6289', '9031', '6860', '9171', '6232', '9173', '0041']
      },
      {
        id: '3',
        name: '2019 Naturalist',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['6289', '9031', '6860', '9171', '6232', '9173', '0041']
      },
      {
        id: '3',
        name: '2019 Naturalist',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['6289', '9031', '6860', '9171', '6232', '9173', '0041']
      },
      {
        id: '3',
        name: '2019 Naturalist',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['6289', '9031', '6860', '9171', '6232', '9173', '0041']
      },
      {
        id: '3',
        name: '2019 Naturalist',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['6289', '9031', '6860', '9171', '6232', '9173', '0041']
      },
      {
        id: '3',
        name: '2019 Naturalist',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['6289', '9031', '6860', '9171', '6232', '9173', '0041']
      },
      {
        id: '3',
        name: '2019 Naturalist',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['6289', '9031', '6860', '9171', '6232', '9173', '0041']
      },
      {
        id: '3',
        name: '2019 Naturalist',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['6289', '9031', '6860', '9171', '6232', '9173', '0041']
      }, {
        id: '3',
        name: '2019 Naturalist',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['6289', '9031', '6860', '9171', '6232', '9173', '0041']
      },
      {
        id: '3',
        name: '2019 Naturalist',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: ['6289', '9031', '6860', '9171', '6232', '9173', '0041']
      }
    ]
  },
  {
    tabId: 'tab2',
    tabName: 'COLOR ID',
    collections: [
      {
        id: '1',
        name: 'Free Spirit',
        img: 'https://www.sherwin-williams.com/dist/cvt/assets/images/collections/2019-shapeshifter-thumb.jpg',
        colorCollections: [
          '6060', '0059', '7625', '6404',
          '7743', '9169', '9086', '6116',
          '0079', '6049', '7735', '9006',
          '7640', '6369', '7551', '6992'
        ]
      }
    ]
  }
]
export const getColorCollectionsData = (colors: Color, allCollectionsData: any, tabId: string) => {
  let result = []
  let collection = allCollectionsData.find((data) => {
    return data.tabId === tabId
  })
  // temporarily added, following if condition should be removed once all collections data is available
  if (!collection) {
    collection = allCollectionsData.find((data) => {
      return data.tabId === 'tab1'
    })
  }
  collection && collection.collections.forEach((data) => {
    let tmp = {
      name: data.name,
      img: data.img,
      collections: []
    }
    for (let i = 0; i < data.colorCollections.length; i++) {
      const tmpColor = Object.values(colors).find((color) => {
        return color.colorNumber === data.colorCollections[i]
      })
      tmp.collections.push(tmpColor)
    }
    result.push(tmp)
  })
  return result
}

export const colorCollectionsData = getColorCollectionsData(colors, allCollectionsData, 'tab1')
export const expertColorsData = getExpertColors(colors, colorList)
export const collectionTabs = [
  { id: 'tab1', tabName: 'Most Popular' },
  { id: 'tab2', tabName: 'Color ID' },
  { id: 'tab3', tabName: 'Our Finest Whites' },
  { id: 'tab4', tabName: 'Color Forecast' },
  { id: 'tab5', tabName: 'Pottery Barn' },
  { id: 'tab6', tabName: 'West Elm' },
  { id: 'tab7', tabName: 'Lifestyle' },
  { id: 'tab8', tabName: `Kids' Colors` }
]
