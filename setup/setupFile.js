import React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import languages from 'src/translations/translations'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { flattenNestedObject } from 'src/shared/helpers/DataUtils'
import store from 'src/store/store'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { DEFAULT_CONFIGURATION } from 'src/constants/configurations'
import { render } from '@testing-library/react'
import { LiveAnnouncer, LiveMessenger } from 'react-aria-live'
import LiveAnnouncerContextProvider from 'src/contexts/LiveAnnouncerContext/LiveAnnouncerContextProvider'
import 'src/config/fontawesome'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/polyfill-locales'
import '@testing-library/jest-dom/extend-expect'

// force debounced functions to execute immediately in tests
jest.mock('lodash/debounce', () => jest.fn(fn => fn))

// jest.useFakeTimers()

// jest.mock('react-router-dom', () => ({
//   ...jest.requireActual('react-router-dom'),
//   useRouteMatch: jest.fn(),
//   useHistory: jest.fn(),
//   useParams: jest.fn()
// }))

// global.URL.createObjectURL = jest.fn()
// global.URL.revokeObjectURL = jest.fn()

window.render = (component, { route = '/', history = createMemoryHistory({ initialEntries: [route] }) } = {}) => {
  return {
    ...render(
      <Router history={history}>
        <IntlProvider locale='en-US' messages={flattenNestedObject(languages['en-US'])}>
          <ConfigurationContext.Provider value={{ ...DEFAULT_CONFIGURATION, brandId: 'sherwin' }}>
            <Provider store={store}>
              <LiveAnnouncer>
                <LiveMessenger>
                  {({ announcePolite, announceAssertive }) => (
                    <LiveAnnouncerContextProvider announcePolite={announcePolite} announceAssertive={announceAssertive}>
                      {component}
                    </LiveAnnouncerContextProvider>
                  )}
                </LiveMessenger>
              </LiveAnnouncer>
            </Provider>
          </ConfigurationContext.Provider>
        </IntlProvider>
      </Router>
    ),
    history
  }
}
