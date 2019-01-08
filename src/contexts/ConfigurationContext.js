import React from 'react'

export const DEFAULT_CONFIGURATIONS = {
  ColorWall: {
    displayAddButton: true,
    displayInfoButton: true,
    displayViewDetails: false
  }
}

export const ConfigurationContext = React.createContext()

export const ConfigurationContextProvider = ConfigurationContext.Provider
export const ConfigurationContextConsumer = ConfigurationContext.Consumer
