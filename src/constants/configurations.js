import { varValues } from 'variables'

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
    black: varValues.colors.black,
    danger: varValues.colors.danger,
    error: varValues.colors.error,
    grey: varValues.colors.grey,
    lightGrey: varValues.colors.lightGrey,
    nearBlack: varValues.colors.nearBlack,
    primary: varValues.colors.primary,
    secondary: varValues.colors.secondary,
    success: varValues.colors.success,
    warning: varValues.colors.warning,
    white: varValues.colors.white
  },
  typography: {
    bodyFontFamily: varValues.typography.bodyFontFamily,
    titleFontFamily: varValues.typography.titleFontFamily
  }
}

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDdLlH1Cm9YdAbt3Cb7eXznbaJZ32SwkeA',
  authDomain: 'dev-prism-cvw.firebaseapp.com',
  databaseURL: 'https://dev-prism-cvw.firebaseio.com',
  projectId: 'dev-prism-cvw',
  storageBucket: 'dev-prism-cvw.appspot.com',
  messagingSenderId: '486817725266',
  appId: '1:486817725266:web:7825d0124632d801b0588b',
  measurementId: 'G-281S2DNW0Q'
}
