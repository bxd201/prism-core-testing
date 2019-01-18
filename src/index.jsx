import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import ReactGA from 'react-ga'

import { GOOGLE_ANALYTICS_UID } from './constants/globals'

import { DEFAULT_CONFIGURATIONS, ConfigurationContextProvider } from './contexts/ConfigurationContext'

// all supported languages
import languages from './translations/translations'

// import the redux store
import store from './store'

// import all mountable components
import APPS from './config/components'

// load all fontawesome fonts we are using
import './config/fontawesome'

// global sass import
import './scss/main.scss'

// initialize Google Analytics
ReactGA.initialize(GOOGLE_ANALYTICS_UID, {})

const renderAppInElement = (el) => {
  if (el.className.indexOf('__react-bound') > -1) {
    return
  }

  const reactComponent = el.getAttribute('data-react-component')

  // if no data attribute specifying the react component exists, let's get out.
  // although if it doesn't have this data attribute, it shouldn't have a __react-root class...
  if (!reactComponent) {
    console.warn(el, ' does not have a data-react-component specified.')
    return
  }

  const App = APPS[reactComponent]

  // if the component doesn't exist, let's get out too
  if (!App) {
    console.warn(`${reactComponent} does is not included. Please import this component into index.jsx.`)
    return
  }

  // get props from elements data attribute, like the post_id
  const props = Object.assign({}, el.dataset)

  // remove the component declaration in the data attributes
  delete props.reactComponent

  // set the language
  const language = props.language || navigator.language || 'en-US'

  // set the page root if it exists
  const pageRoot = props.pageRoot || '/'

  const routeType = props.routeType || 'hash'

  const BrowserRouterRender = (
    <BrowserRouter basename={pageRoot}>
      <ConfigurationContextProvider value={DEFAULT_CONFIGURATIONS}>
        <App {...props} />
      </ConfigurationContextProvider>
    </BrowserRouter>
  )
  const HashRouterRender = (
    <HashRouter>
      <ConfigurationContextProvider value={DEFAULT_CONFIGURATIONS}>
        <App {...props} />
      </ConfigurationContextProvider>
    </HashRouter>
  )
  const RouterRender = (routeType === 'browser') ? BrowserRouterRender : HashRouterRender

  ReactDOM.render(
    <IntlProvider locale={language} messages={languages[language]}>
      <Provider store={store}>
        { RouterRender }
      </Provider>
    </IntlProvider>, el)

  el.classList.add('__react-bound')
}

const bindReactToDOM = () => {
  document.querySelectorAll('.__react-root').forEach(renderAppInElement)
}

bindReactToDOM()

export default bindReactToDOM
