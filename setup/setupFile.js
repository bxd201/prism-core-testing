import React, { useContext } from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import languages from 'src/translations/translations'
import { Router, useRouteMatch, useHistory, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { createMemoryHistory } from 'history'
import { flattenNestedObject } from 'src/shared/helpers/DataUtils'
import extend from 'lodash/extend'
import defaultsDeep from 'lodash/defaultsDeep'
import store from 'src/store/store'

jest.useFakeTimers()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: jest.fn(),
  useHistory: jest.fn(),
  useParams: jest.fn()
}));

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
  const { routeParams = {}, mockedStoreValues = {}, url = '/', history = createMemoryHistory({ initialEntries: [url] }) } = nonDefaultParams

  history.entries[0].key = "" // prevent entry key from being a randomly generated hash, so that test snapshots match

  useRouteMatch.mockReturnValue({ url: '/', params: routeParams })
  useHistory.mockReturnValue(history)
  useParams.mockReturnValue(routeParams)

  const defaultState = store.getState()
  store.getState = () => ({...defaultState, ...mockedStoreValues})

  return extend(mount(
    <IntlProvider locale="en-US" messages={flattenNestedObject(languages['en-US'])}>
      <Provider store={store}>
        <Router history={history}>
          {mockedComponent}
        </Router>
      </Provider>
    </IntlProvider>
  ), { history: history })
}
