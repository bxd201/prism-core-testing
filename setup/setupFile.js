import React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { mount, configure } from 'enzyme'
import languages from 'src/translations/translations'
import { Router, useRouteMatch, useHistory, useParams } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { flattenNestedObject } from 'src/shared/helpers/DataUtils'
import extend from 'lodash/extend'
import store from 'src/store/store'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import 'src/config/fontawesome'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/polyfill-locales'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

// force debounced functions to execute immediately in tests
jest.mock('lodash/debounce', () => jest.fn(fn => fn))

jest.useFakeTimers()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: jest.fn(),
  useHistory: jest.fn(),
  useParams: jest.fn()
}))

global.URL.createObjectURL = jest.fn()
global.URL.revokeObjectURL = jest.fn()

/**
 * Mocks react-router-dom and react-redux hooks with provided values or defaults and returns a properly wrapped and enzyme-mounted component
 *
 * example: mocked(<Component />)
 *   - standard mocked component where useSelector(store => store) === require('src/store/store') && useRouteParams().url === '/' && useParams() === {}
 * example: mocked(<Component />, { mockedStoreValues: { a: 1, b: '' } })
 *   - mocked component where useSelector(store => store) === { ...require('src/store/store'), ...{ a: 1, b: '' } }
 * example: mocked(<Component />, { url: '/search/blue', routeParams: { query: blue } })
 *   - mocked component where useRouteParams().url === '/search/blue' && useParams() === { query: blue }
 * example: mocked(<Component />).history
 *   - history object associated with a mocked object
 */
window.mocked = (mockedComponent, nonDefaultParams = {}) => {
  const {
    routeParams = {},
    mockedStoreValues = {},
    url = '/',
    path = url,
    history = createMemoryHistory({ initialEntries: [url] })
  } = nonDefaultParams

  history.entries.forEach(entry => entry.key = '') // prevent entry key from being a randomly generated hash, so that test snapshots match

  useRouteMatch.mockReturnValue({ path: path, url: url, params: routeParams })
  useHistory.mockReturnValue(history)
  useParams.mockReturnValue(routeParams)

  const defaultState = store.getState()
  store.getState = () => ({ ...defaultState, ...mockedStoreValues })

  return extend(mount(
    <IntlProvider locale='en-US' messages={flattenNestedObject(languages['en-US'])}>
      <Provider store={store}>
        <Router history={history}>
          <ConfigurationContext.Provider value={{ brandId: 'sherwin', theme: {} }}>
            {mockedComponent}
          </ConfigurationContext.Provider>
        </Router>
      </Provider>
    </IntlProvider>
  ), { history: history })
}
