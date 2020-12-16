// @flow
import React from 'react'

export type ConfigurationContextType = {
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
        navColorCollections?: string,
        navExpertColorPicks?: string,
        navExploreColor?: string,
        navMatchPhoto?: string,
        navPaintedScenes?: string,
        navSamplePhotos?: string,
        navSampleScenes?: string,
        navThumbAndroid?: string,
        navThumbIpad?: string,
        navThumbIphone?: string,
        navThumbMyPhotos?: string,
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
    }
}

const ConfigurationContext: ConfigurationContextType = React.createContext<ConfigurationContextType>()

export default ConfigurationContext
