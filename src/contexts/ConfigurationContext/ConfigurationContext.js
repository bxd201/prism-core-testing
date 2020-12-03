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
        termsOfUseLink?: string,
        downloadSceneDisclaimer1?: string,
        downloadSceneDisclaimer2?: string,
        downloadSceneFooterImage?: string,
        downloadSceneHeaderImage?: string,
        introBG?: string,
        introLogo?: string,
        navColorCollections?: string,
        navExpertColorPicks?: string,
        navExploreColors?: string,
        navMatchPhoto?: string,
        navPaintedScenes?: string,
        navSamplePhoto?: string,
        navSampleScenes?: string,
        navThumbAndroid?: string,
        navThumbIpad?: string,
        navThumbIphone?: string,
        navThumbMyPhotos?: string
    }
}

const ConfigurationContext: ConfigurationContextType = React.createContext<ConfigurationContextType>()

export default ConfigurationContext
