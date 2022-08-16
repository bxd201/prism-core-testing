import { FastMaskOpenCache, FlatScene, FlatVariant, ReferenceDimensions, Surface } from '../../types'

export const API_URL = '/prism-ml/'
export const API_URL_ERR = '/prism-ml-error/'
export const API_URL_NO_MASK = '/prism-no-mask/'
export const API_URL_FAIL_BLOB = '/prism-fail-blob/'

export const PAYLOAD_200 = {
  memchange: 0,
  per_img_resp: [
    [
      {
        payload: {
          id: '9215ab48-8dab-4b2b-8acf-95447ee643f0',
          lumped_path: '',
          mask_path0: 'https://s3.us-east-2.amazonaws.com/sw-prism-fastmask/static/files/img.jpg',
          orig_path: 'https://s3.us-east-2.amazonaws.com/sw-prism-fastmask/static/files/img.jpg',
          ran_realcolor: 'False',
          tinted_path: 'https://s3.us-east-2.amazonaws.com/sw-prism-fastmask/static/files/img.jpg'
        },
        seconds_to_detect: '5.0'
      },
      200
    ]
  ],
  total_time: '4.97'
}

export const PAYLOAD_FAIL_BLOB = {
  memchange: 0,
  per_img_resp: [
    [
      {
        payload: {
          id: '9215ab48-8dab-4b2b-8acf-95447ee643f0',
          lumped_path: '',
          mask_path0: 'https://s3.us-east-2.amazonaws.com/sw-prism-fastmask/static/files/fail.jpg',
          orig_path: 'https://s3.us-east-2.amazonaws.com/sw-prism-fastmask/static/files/fail.jpg',
          ran_realcolor: 'False',
          tinted_path: 'https://s3.us-east-2.amazonaws.com/sw-prism-fastmask/static/files/fail.jpg'
        },
        seconds_to_detect: '5.0'
      },
      200
    ]
  ],
  total_time: '4.97'
}

export const PAYLOAD_NO_MASK = {
  memchange: 0,
  per_img_resp: [],
  total_time: '4.97'
}

export const COLOR_1 = {
  colorNumber: '6787',
  coordinatingColors: {
    coord1ColorId: '2837',
    coord2ColorId: '11280',
    whiteColorId: '2471'
  },
  description: ['Soft', 'Fairly Bright'],
  id: '2474',
  isExterior: true,
  isInterior: true,
  name: 'Fountain',
  lrv: 39.448,
  brandedCollectionNames: [],
  colorFamilyNames: ['Blue'],
  brandKey: 'SW',
  red: 86,
  green: 181,
  blue: 202,
  hue: 0.5301724137931034,
  saturation: 0.5225225225225224,
  lightness: 0.5647058823529412,
  hex: '#56b5ca',
  isDark: false,
  storeStripLocator: '167-C4',
  similarColors: ['2467', '11228', '2481', '2639', '2461', '2460', '2468', '2180', '2636', '2635'],
  ignore: false,
  archived: false,
  lab: {
    L: 68.96002878880431,
    A: -21.95795490141206,
    B: -19.13408386294475
  }
}

export const CONTENT = {
  userUploadAlt: 'The user uploaded this image',
  sceneView: {
    clearAreaText: 'Wipe Out'
  }
}

export const REF_DIMS: ReferenceDimensions = {
  imageHeight: 0,
  imageWidth: 0,
  isPortrait: false,
  landscapeHeight: 0,
  landscapeWidth: 0,
  originalImageHeight: 0,
  originalImageWidth: 0,
  originalIsPortrait: false,
  portraitHeight: 0,
  portraitWidth: 0
}

const SCENE: FlatScene = {
  description: '',
  height: 0,
  id: 0,
  sceneType: '',
  uid: '123',
  variantNames: [],
  variants: [],
  width: 0
}

const SURFACE: Surface = {
  highlights: '',
  hitArea: '',
  id: 0,
  role: '',
  shadows: '',
  surfaceBlobUrl: '',
  thumb: ''
}

const VARIANT: FlatVariant = {
  expertColorPicks: [],
  image: '',
  isFirstOfKind: false,
  normalizedImageValueCurve: '',
  sceneCategories: [],
  sceneId: 0,
  sceneType: '',
  sceneUid: '123',
  surfaces: [SURFACE],
  thumb: '',
  variantName: ''
}

export const SAVE_DATA: FastMaskOpenCache = {
  scene: SCENE,
  surfaceColors: [null],
  variant: VARIANT
}
