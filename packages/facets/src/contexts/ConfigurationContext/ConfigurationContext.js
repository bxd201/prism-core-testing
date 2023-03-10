// @flow
import React from 'react'
import { type VisualizerNavStructure } from 'src/components/Facets/ColorVisualizerWrapper/ColorVisualizerNav/navStructure'

type HelpSectionItems = {
  icon?: string,
  title?: string,
  content?: string
}
type Menu = {
  showIcon: boolean,
  tab?: string,
  title?: string,
  subtitle?: string
}

type MenuItem = {
  title?: string,
  content?: string,
  footnote?: string
}

export type AnalyticsConfig = {
  host: string, // the hostname of the page
  type: string // the name of the analytics allows ie: UA, GA4, GTM
}

export type ConfigurationContextType = {
  allowedAnalytics: AnalyticsConfig[],
  alwaysShowColorFamilies?: boolean,
  brand: string,
  brandKeyNumberSeparator: string,
  brandId: string,
  colorDetailsAddColor?: boolean,
  ga_domain_id: string,
  theme: {
    primary: string,
    secondary: string,
    primaryBg: string,
    secondaryBg: string,
    tertiaryBg: string,
    primaryBorder: string,
    secondaryBorder: string,
    warning: string,
    success: string,
    danger: string,
    error: string,
    grey: string,
    lightGrey: string,
    nearBlack: string,
    menuBg: string,
    menuContentTitle: string,
    menuContentDescription: string,
    menuTxt: string,
    menuTxtHover: string,
    black: string,
    white: string,
    buttonBgColor: string,
    buttonBorder: string,
    buttonBorderRadius: string,
    buttonColor: string,
    buttonHoverBgColor: string,
    buttonHoverBorder: string,
    buttonHoverColor: string,
    buttonActiveBgColor: string,
    buttonActiveBorder: string,
    buttonActiveColor: string,
    buttonBarBorder: string
  },
  colorWall: {
    bloomEnabled: boolean,
    colorSwatch?: {
      colorNumOnBottom?: boolean,
      houseShaped?: boolean,
      infoBtn?: {
        icon?: string
      }
    },
    gapsBetweenChunks: boolean,
    minWallSize: number,
    searchColor?: string,
    selectSectionText?: string
  },
  typography: {
    bodyFontFamily: string,
    titleFontFamily: string,
    titleFontStyle: string,
    titleTextTransform: string,
    buttonFontWeight: string,
    buttonTextTransform: string,
    textInputBorderRadius: string
  },
  featureExclusions: string[],
  cvw: {
    backBtn?: {
      icon?: string
    },
    carouselBtn?: {
      iconLeft?: string,
      iconRight?: string
    },
    closeBtn?: {
      showArrow?: boolean,
      text?: string
    },
    colorCollections?: {
      pagerPosition?: string,
      scrollArrows?: boolean,
      showDescriptionMobile?: boolean,
      subtitle?: string
    },
    downloadSceneDisclaimer1?: string,
    downloadSceneDisclaimer1?: string,
    downloadSceneDisclaimer2?: string,
    downloadSceneDisclaimer2?: string,
    downloadSceneFooterImage?: string,
    downloadSceneFooterImage?: string,
    downloadSceneHeaderImage?: string,
    downloadSceneHeaderImage?: string,
    expertColorPicks?: {
      collectionsSelectLabel?: string,
      title?: string
    },
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
      contents?: string[],
      contentsHiddenMobile?: string[],
      iconsButtons?: {
        addColor?: HelpSectionItems,
        trashAColor?: HelpSectionItems,
        moreScenes?: HelpSectionItems,
        colorDetails?: HelpSectionItems,
        grabReorder?: HelpSectionItems,
        paintScene?: HelpSectionItems
      },
      myColorPalette1?: string,
      myColorPalette2?: string,
      myColorPalette3?: string,
      myColorPalette4?: string,
      myColorPalette5?: string,
      myColorPaletteBg?: string,
      myColorPaletteMobile1?: string,
      myColorPaletteMobile2?: string,
      myColorPaletteMobile3?: string,
      paintingMyOwnPhoto?: {
        title?: string,
        subtitle?: string,
        paintArea?: HelpSectionItems,
        paintbrush?: HelpSectionItems,
        select?: HelpSectionItems,
        erase?: HelpSectionItems,
        defineArea?: HelpSectionItems,
        removeArea?: HelpSectionItems,
        zoom?: HelpSectionItems,
        undoRedo?: HelpSectionItems,
        redo?: HelpSectionItems,
        hidePaint?: HelpSectionItems,
        info?: HelpSectionItems,
        deleteGroup?: HelpSectionItems,
        group?: HelpSectionItems,
        ungroup?: HelpSectionItems
      },
      saving1?: string,
      saving3?: string,
      savingBg?: string,
      savingMobile1?: string,
      savingMobile2?: string,
      scrollContentPosition?: string
    },
    inspirationalPhotos?: {
      collectionsSelectLabel?: string,
      title?: string
    },
    introBg?: string,
    introLogo?: string,
    menu?: {
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
      help?: {
        tab?: string
      },
      overlay: boolean,
      paintAPhoto?: {
        ...Menu,
        uploadYourPhoto?: MenuItem,
        useOurPhotos?: MenuItem
      }
    },
    modal?: {
      danger?: boolean
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
      compare?: string,
      downloadBtn?: {
        title?: string,
        icon?: string
      },
      firstEmptySlot?: string
    },
    scene?: {
      moreScenesBtn?: {
        showIcon: boolean
      },
      paintThisSceneBtn?: {
        showIcon: boolean
      }
    },
    termsOfUseLink?: string,
    useOurPhotos?: {
      collectionsSelectLabel?: string,
      title?: string
    }
  },
  uiStyle: 'default' | 'minimal'
}

const ConfigurationContext = React.createContext<ConfigurationContextType>({})

export default ConfigurationContext
