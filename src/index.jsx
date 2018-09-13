import React from 'react'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

import Prism from './components/Prism'

// list all top level react components here
const APPS = {
  Prism
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

  ReactDOM.render(
    <IntlProvider locale={navigator.language || navigator.languages[0] || 'en-US'}>
      <App {...props} />
    </IntlProvider>, el)

  el.classList.add('__react-bound')
}

const bindReactToDOM = () => {
  document.querySelectorAll('.__react-root').forEach(renderAppInElement)
}

bindReactToDOM()
