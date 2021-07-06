// @flow
import { varValues } from 'src/shared/withBuild/variableDefs'

// live palette max colors allowed to be added
export const LP_MAX_COLORS_ALLOWED = 8
export const MIN_COMPARE_COLORS_ALLOWED = 2
// default configuration object if no configuration is loaded or if the network is slow
export const DEFAULT_CONFIGURATION = {
  ga_domain_id: 'defaultPrismWebsite',
  colorWall: {
    bloomRadius: 2
  },
  theme: {
    black: varValues._colors.black,
    danger: varValues._colors.danger,
    grey: varValues._colors.grey,
    info: varValues._colors.info,
    lightGrey: varValues._colors.lightGrey,
    nearBlack: varValues._colors.nearBlack,
    menuBg: varValues._colors.menuBg,
    menuTxt: varValues._colors.menuTxt,
    menuTxtHover: varValues._colors.menuTxtHover,
    primary: varValues._colors.primary,
    secondary: varValues._colors.secondary,
    success: varValues._colors.success,
    warning: varValues._colors.warning,
    white: varValues._colors.white
  },
  typography: {
    bodyFontFamily: varValues.typography.bodyFontFamily,
    titleFontFamily: varValues.typography.titleFontFamily
  },
  loadingConfiguration: false,
  error: false
}

export type FirebaseConfig = {
  [key: string]: string
}

export const FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: 'AIzaSyDdLlH1Cm9YdAbt3Cb7eXznbaJZ32SwkeA',
  authDomain: 'dev-prism-cvw.firebaseapp.com',
  databaseURL: 'https://dev-prism-cvw.firebaseio.com',
  projectId: 'dev-prism-cvw',
  storageBucket: 'dev-prism-cvw.appspot.com',
  messagingSenderId: '486817725266',
  appId: '1:486817725266:web:7825d0124632d801b0588b',
  measurementId: 'G-281S2DNW0Q'
}

export type FeatureExclusionsType = {
  [key: string]: string
}
export const FEATURE_EXCLUSIONS: FeatureExclusionsType = {
  fastMask: 'fastMask', // this will exclude
  documentSaving: 'documentSaving', // this will exclude myideas and the save button
  download: 'download', // this removes the download feature from the app
  inspirationalPhotos: 'inspirationalPhotos', // this excludes inspirational photos from get inspired
  expertColorPicks: 'expertColorPicks', // this excludes expert color picks from get inspired
  paintedPhotos: 'paintedPhotos', // this excludes the painted photos from get inspired
  getInspired: 'getInspired', // removes get inspired from the nav
  exploreColors: 'exploreColors', //  removes explore colors from the nav
  paintAPhoto: 'paintAPhoto', // removes paint a photo from the nav
  useOurPhotos: 'useOurPhotos', // remove use our photos from the paint a photo submenu
  uploadYourPhoto: 'uploadYourPhoto', // remove upload your photos from the paint a photo submenu
  colorWall: 'colorWall', // removes color wall from explore colors submenu
  colorCollections: 'colorCollections', // this will exclude color collections from explore colors
  matchAPhoto: 'matchAPhoto', // removes match a photo from explore colors submenu,
  splashScreen: 'splashScreen', // Excluded the animated splash page,
  paletteSaving: 'paletteSaving', // disable saving of color palettes
  colorDetailsSubtitles: 'colorDetailsSubtitles' // disable subtitles Interior / Exterior and Location Number of color details viewer
}
