// @flow
import React, { type ComponentType, useEffect } from 'react'
import { Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router-dom'
import ErrorBoundary from 'src/helpers/ErrorBoundary/ErrorBoundary'
import { initTrackingOnce } from './facetTracking'
import { type EmbeddedConfiguration } from 'src/shared/types/Configuration'
import ConfigurationContextProvider from 'src/contexts/ConfigurationContext/ConfigurationContextProvider'
import { LiveAnnouncer } from 'react-aria-live'
// all supported languages
import languages from 'src/translations/translations'

import store from 'src/store/store'
import { flattenNestedObject } from '../shared/helpers/DataUtils'

// wraps a react component with the required PRISM HOCs
export const facetMasterWrapper = (Component: ComponentType<any>) => {
  return (props: EmbeddedConfiguration) => {
    useEffect(initTrackingOnce, [])

    // set the language
    const language = props.language || navigator.language || 'en-US'

    // set the page root if it exists
    const pageRoot = props.pageRoot || '/'

    // checks if a default routing type is set, if not we'll use hash routing
    const routeType = props.routeType || 'hash'

    const routerProps = {
      basename: pageRoot
    }

    const BrowserRouterRender = (
      <BrowserRouter {...routerProps}>
        <Component {...props} />
      </BrowserRouter>
    )
    const HashRouterRender = (
      <HashRouter {...routerProps}>
        <Component {...props} />
      </HashRouter>
    )
    const MemoryRouterRender = (
      <MemoryRouter {...routerProps}>
        <Component {...props} />
      </MemoryRouter>
    )
    const RouterRender = (route => {
      switch (route) {
        case 'browser':
          return BrowserRouterRender
        case 'hash':
          return HashRouterRender
        case 'memory':
        default:
          return MemoryRouterRender
      }
    })(routeType)

    const flatLanguages = flattenNestedObject(languages[language])

    // Two levels of error boundary here. The vast majority of errors will hit the inner boundary, which will provide translated messaging.
    // If, for some reason, an error occurs in the IntlProvider (or ErrorBoundary) level, the outer boundary will catch it instead and at least display SOMETHING, although
    // that something will include our message keys.
    return (
      <ErrorBoundary translated={false}>
        <IntlProvider locale={language} messages={flatLanguages} textComponent={React.Fragment}>
          <ErrorBoundary>
            <Provider store={store}>
              <ConfigurationContextProvider {...props}>
                <LiveAnnouncer>
                  { RouterRender }
                </LiveAnnouncer>
              </ConfigurationContextProvider>
            </Provider>
          </ErrorBoundary>
        </IntlProvider>
      </ErrorBoundary>
    )
  }
}
