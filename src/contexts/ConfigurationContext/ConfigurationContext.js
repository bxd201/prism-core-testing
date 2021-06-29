// @flow
import React from 'react'
import { type VisualizerNavStructure } from 'src/components/Facets/ColorVisualizerWrapper/ColorVisualizerNav/navStructure'

type Menu = {
  tab?: string,
  title?: string
}

type MenuItem = {
  title?: string,
  content?: string,
  footnote?: string
}

export type ConfigurationContextType = {
  brand: string,
  brandId: string,
  ga_domain_id: string,
  theme: {
    primary: string,
    secondary: string,
    warning: string,
    success: string,
    danger: string,
    error: string,
    grey: string,
    lightGrey: string,
    nearBlack: string,
    black: string,
    white: string
  },
  colorWall: {
    bloomEnabled: boolean,
    gapsBetweenChunks: boolean
  },
  typography: {
    bodyFontFamily: string,
    titleFontFamily: string
  },
  featureExclusions: string[],
  cvw: {
    colorWall?: {
      close?: string,
      searchColor?: string
    },
    downloadSceneDisclaimer1?: string,
    downloadSceneDisclaimer1?: string,
    downloadSceneDisclaimer2?: string,
    downloadSceneDisclaimer2?: string,
    downloadSceneFooterImage?: string,
    downloadSceneFooterImage?: string,
    downloadSceneHeaderImage?: string,
    downloadSceneHeaderImage?: string,
    introBg?: string,
    introLogo?: string,
    menu?: {
      close?: string,
      exploreColors?: {
        ...Menu,
        colorCollections?: MenuItem,
        digitalColorWall?: MenuItem,
        matchAPhoto?: MenuItem
      },
      getInspired?: {
        ...Menu,
        expertColorPicks?: MenuItem,
        inspirationalPhotos?: MenuItem,
        paintedPhotos?: MenuItem
      },
      paintAPhoto?: {
        ...Menu,
        uploadYourPhoto?: MenuItem,
        useOurPhotos?: MenuItem
      }
    },
    navColorCollections?: string,
    navExpertColorPicks?: string,
    navExploreColor?: string,
    navMatchPhoto?: string,
    navPaintedScenes?: string,
    navSamplePhotos?: string,
    navSampleScenes?: string,
    navStructure?: VisualizerNavStructure,
    navThumbAndroid?: string,
    navThumbIpad?: string,
    navThumbIphone?: string,
    navThumbMyPhotos?: string,
    palette?: {
      title?: string,
      compare?: string
    },
    termsOfUseLink?: string,
    help?: {
      addColor1?: string,
      addColor2?: string,
      addColor3?: string,
      addColorBg?: string,
      addColorMobile1?: string,
      addColorMobile2?: string,
      addColorMobile3?: string,
      colorDetail1?: string,
      colorDetail2?: string,
      colorDetailBg?: string,
      colorDetailMobile1?: string,
      colorDetailMobile2?: string,
      myColorPalette1?: string,
      myColorPalette2?: string,
      myColorPalette3?: string,
      myColorPalette4?: string,
      myColorPalette5?: string,
      myColorPaletteBg?: string,
      myColorPaletteMobile1?: string,
      myColorPaletteMobile2?: string,
      myColorPaletteMobile3?: string,
      saving1?: string,
      saving3?: string,
      savingBg?: string,
      savingMobile1?: string,
      savingMobile2?: string
    }
  },
  uiStyle: 'default' | 'minimal'
}

const ConfigurationContext = React.createContext<ConfigurationContextType>({})

export default ConfigurationContext
