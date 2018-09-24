import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { IntlProvider, addLocaleData } from 'react-intl'
import { HashRouter } from 'react-router-dom'
import localeEN from 'react-intl/locale-data/en'
import localeES from 'react-intl/locale-data/es'

import en from './translations/en.json'
import es from './translations/es.json'

import store from './store'

import Prism from './components/Prism'
import ColorPath from './components/ColorPath/ColorPath'

import './scss/main.scss'

// list all supported languages & associate with their JSON
const messages = {
  'en': en,
  'es': es
}
// add locale data when using react-intl to format numbers/times/ect..
addLocaleData([
  ...localeEN,
  ...localeES
])

// list all top level react components here
const APPS = {
  Prism,
  ColorPath
}

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

  // generate language without the country code
  const language = navigator.language.split(/[-_]/)[0] || 'en'

  ReactDOM.render(
    <IntlProvider locale={language} messages={messages[language]}>
      <Provider store={store}>
        <HashRouter>
          <App {...props} />
        </HashRouter>
      </Provider>
    </IntlProvider>, el)

  el.classList.add('__react-bound')
}

const bindReactToDOM = () => {
  document.querySelectorAll('.__react-root').forEach(renderAppInElement)
}

bindReactToDOM()
