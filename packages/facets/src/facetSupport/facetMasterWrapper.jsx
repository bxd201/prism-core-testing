// @flow
import React, { type ComponentType, useMemo } from 'react'
import { LiveAnnouncer, LiveMessenger } from 'react-aria-live'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router-dom'
import ConfigurationContextProvider from 'src/contexts/ConfigurationContext/ConfigurationContextProvider'
import LiveAnnouncerContextProvider from 'src/contexts/LiveAnnouncerContext/LiveAnnouncerContextProvider'
import ErrorBoundary from 'src/helpers/ErrorBoundary/ErrorBoundary'
import { type EmbeddedConfiguration } from 'src/shared/types/Configuration.js.flow'
import { setLanguage } from 'src/store/actions/language'
import { setCWV3 } from 'src/store/actions/loadColors'
import store from 'src/store/store'
// all supported languages
import languages from 'src/translations/translations'
import AuthObserver from '../components/AuthObserver/AuthObserver'
import { flattenNestedObject } from '../shared/helpers/DataUtils'
// import cleanslate styles, overrides, and defaults
import 'src/cleanslate/cleanslate.scss'
import 'src/cleanslate/_default-styles.scss'
import 'src/cleanslate/_cleanslate-overrides.scss'
import './styles/embed-override.scss'
import 'tailwindcss/tailwind.css'
import '@prism/toolkit/dist/index.css'

/*
 * Declaring tailwind css media-query used on toolkit components to precompile their payloads:
 * LivePalette - md:absolute md:block md:flex md:h-full md:hidden md:items-start md:m-2 md:right-0.5 md:top-0.5 md:w-32
 * Do not delete this comment
 */

// wraps a react component with the required PRISM HOCs
export const facetMasterWrapper = (Component: ComponentType<any>) => {
  return (props: EmbeddedConfiguration) => {
    // set the language
    const language = props.language || navigator.language || 'en-US'

    // set the page root if it exists
    const pageRoot = props.pageRoot || '/'

    // checks if a default routing type is set, if not we'll use hash routing
    const routeType = props.routeType || 'hash'

    const routerProps = useMemo(
      () => ({
        basename: pageRoot
      }),
      [pageRoot]
    )

    const configurationProps = {
      ...props,
      language,
      pageRoot,
      routeType
    }

    const {
      b: BrowserRouterRender,
      h: HashRouterRender,
      m: MemoryRouterRender
    } = useMemo(
      () => ({
        b: (
          <BrowserRouter {...routerProps}>
            <Component {...props} />
          </BrowserRouter>
        ),
        h: (
          <HashRouter {...routerProps}>
            <Component {...props} />
          </HashRouter>
        ),
        m: (
          <MemoryRouter {...routerProps}>
            <Component {...props} />
          </MemoryRouter>
        )
      }),
      [routerProps, props]
    )

    const RouterRender = useMemo(() => {
      switch (routeType) {
        case 'browser':
          return BrowserRouterRender
        case 'hash':
          return HashRouterRender
        case 'memory':
        default:
          return MemoryRouterRender
      }
    }, [routeType])

    const flatLanguages = useMemo(() => flattenNestedObject(languages[language]), [languages, language])

    // define chosen language within redux -- this is used for API requests
    // this will need to update if language changes in realtime
    store.dispatch(setLanguage(language))

    // set whether or not we are using cwv3 endpoints and structure in this facet
    // using this on a page with multiple facets WILL result in a race condition
    store.dispatch(setCWV3(!!props.cwv3))

    // Two levels of error boundary here. The vast majority of errors will hit the inner boundary, which will provide translated messaging.
    // If, for some reason, an error occurs in the IntlProvider (or ErrorBoundary) level, the outer boundary will catch it instead and at least display SOMETHING, although
    // that something will include our message keys.

    return (
      <div lang={language}>
        <ErrorBoundary translated={false}>
          <IntlProvider
            locale={language}
            defaultLocale={language}
            messages={flatLanguages}
            textComponent={React.Fragment}
          >
            <ErrorBoundary>
              <Provider store={store}>
                <ConfigurationContextProvider {...configurationProps}>
                  <LiveAnnouncer>
                    <LiveMessenger>
                      {({ announcePolite, announceAssertive }) => {
                        return (
                          <LiveAnnouncerContextProvider
                            announcePolite={announcePolite}
                            announceAssertive={announceAssertive}
                          >
                            <AuthObserver />
                            {RouterRender}
                          </LiveAnnouncerContextProvider>
                        )
                      }}
                    </LiveMessenger>
                  </LiveAnnouncer>
                </ConfigurationContextProvider>
              </Provider>
            </ErrorBoundary>
          </IntlProvider>
        </ErrorBoundary>
      </div>
    )
  }
}
