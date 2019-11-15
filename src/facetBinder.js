// @flow
import '@babel/polyfill'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/dist/locale-data/en'
import '@formatjs/intl-relativetimeformat/dist/locale-data/fr'
import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/dist/locale-data/en'
import '@formatjs/intl-pluralrules/dist/locale-data/fr'

import React, { Component } from 'react'
import { mainEntryPointName, cleanslateEntryPointName } from './../webpack/constants'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router-dom'
import ReactGA from 'react-ga'
import toArray from 'lodash/toArray'
import mapValues from 'lodash/mapValues'
import once from 'lodash/once'
import debounce from 'lodash/debounce'
import at from 'lodash/at'
import camelCase from 'lodash/camelCase'
import forOwn from 'lodash/forOwn'
import memoizee from 'memoizee'

import { LiveAnnouncer } from 'react-aria-live'

import { GOOGLE_ANALYTICS_UID } from './constants/globals'

import docReady from 'src/shared/helpers/docReady'
import { type EmbeddedConfiguration } from './shared/types/Configuration'
import ConfigurationContextProvider from './contexts/ConfigurationContext/ConfigurationContextProvider'
import { flattenNestedObject } from './shared/helpers/DataUtils'

// all supported languages
import languages from './translations/translations'

// import the redux store
import store from './store/store'

const HAS_BOUND_CLASS = '__react-bound'
const TO_BIND_CLASS = '__react-root'
const CLEANSLATE_CLASS = 'cleanslate'
const PRISM_CLASS = 'prism'

let [addToEmbedQueue, embedQueue] = [(facetName) => {
  embedQueue.push(facetName)
}, []]

let [flagAsMainBundle, IS_MAIN_BUNDLE] = [() => {
  console.info('This instance of Prism has been flagged as main bundle rather than an individual Facet.')
  IS_MAIN_BUNDLE = true
}, false]

// attaches initial no-display styles for prism elements, and loads cleanslate styles -- only runs one time
const embedGlobalStylesOnce = once(() => {
  const immediateStyleTag = document.createElement('style')
  immediateStyleTag.type = 'text/css'
  // $FlowIgnore -- flow doesn't think body is defined
  document.body.appendChild(immediateStyleTag)
  immediateStyleTag.innerHTML = `.${CLEANSLATE_CLASS}.${PRISM_CLASS} { display: none }`

  const cleanslatePath = `${BASE_PATH}/css/${cleanslateEntryPointName}.css`
  const cleanslateTag = document.createElement('link')
  cleanslateTag.rel = 'stylesheet'
  cleanslateTag.type = 'text/css'
  cleanslateTag.crossOrigin = 'anonymous'
  cleanslateTag.href = cleanslatePath // eslint-disable-line no-undef
  cleanslateTag.media = 'all'
  // $FlowIgnore -- flow doesn't think body is defined
  document.body.appendChild(cleanslateTag)
})

// attaches styles for provided bundle -- only runs once per bundle name
const memoEmbedBundleStyles = memoizee((bundleName) => {
  // create the link to our css
  const fileName = `${camelCase(bundleName)}.css`
  const stylePath = `${BASE_PATH}/css/${fileName}`
  console.info(stylePath)
  const styleTag = document.createElement('link')
  styleTag.rel = 'stylesheet'
  styleTag.type = 'text/css'
  styleTag.crossOrigin = 'anonymous'
  /* eslint-disable no-undef */ styleTag.href = stylePath
  styleTag.media = 'all'

  // add our css to the <head>
  // $FlowIgnore -- flow doesn't think body is defined
  document.body.appendChild(styleTag)
}, { primitive: true, length: 1 })

// initializes tracking -- only runs once
const initTrackingOnce = once(() => {
  ReactGA.initialize([{
    trackingId: GOOGLE_ANALYTICS_UID,
    gaOptions: {
      name: 'GAtrackerPRISM'
    }
  }], { alwaysSendToDefaultTracker: false })
})

// returns Facet instance if it exists in this bundle
const getAppIfAvailable = (facetName) => {
  // if no data attribute specifying the react component exists, let's get out.
  // although if it doesn't have this data attribute, it shouldn't have a __react-root class...
  if (!facetName) {
    console.warn('The specified element does not have the required data-react-component attribute.')
    return
  }

  const APPS: Object | typeof undefined = at(window, 'PRISM.facets')[0]

  if (typeof APPS !== 'object') {
    throw new Error('No Prism facets are available to embed.')
  }

  console.info(`The following Prism Facets are available to embed: ${Object.keys(APPS).join(', ')}`)
  const App = APPS[facetName]

  // if the component doesn't exist, let's get out too
  if (!App) {
    throw new Error(`${facetName} is not included in the available bundled Prism Facets so it cannot be embedded`)
  }

  return App
}

// renders Facet on specified element
const renderAppInElement = (el) => {
  if (el.className.indexOf(HAS_BOUND_CLASS) > -1) {
    return
  }

  console.info('Attempting to embed a Prism Facet in the following element:', el)

  // get props from elements data attribute, like the post_id
  const allProps = mapValues(Object.assign({}, el.dataset), v => v === '' ? true : v)
  const { reactComponent, ...other } = allProps
  const props: EmbeddedConfiguration = other // just doing this for the typing

  const App = getAppIfAvailable(reactComponent)

  if (!App) {
    console.info('Aborting Prism Facet embed operation.')
    return
  }

  embedBundleStyles(reactComponent)

  // set the language
  const language = props.language || navigator.language || 'en-US'

  // set the page root if it exists
  const pageRoot = props.pageRoot || '/'

  // checks if a default routing type is set, if not we'll use hash routing
  const routeType = props.routeType || 'hash'

  const BrowserRouterRender = (
    <BrowserRouter basename={pageRoot}>
      <App {...props} />
    </BrowserRouter>
  )
  const HashRouterRender = (
    <HashRouter>
      <App {...props} />
    </HashRouter>
  )
  const MemoryRouterRender = (
    <MemoryRouter>
      <App {...props} />
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

  render(
    <IntlProvider locale={language} messages={flatLanguages} textComponent={React.Fragment}>
      <Provider store={store}>
        <ConfigurationContextProvider {...props}>
          <LiveAnnouncer>
            { RouterRender }
          </LiveAnnouncer>
        </ConfigurationContextProvider>
      </Provider>
    </IntlProvider>, el)

  el.classList.add(HAS_BOUND_CLASS)
}

// gathers either A) all embed roots, or B) embed roots matching a specified facet name
function gatherReactRoots (facetName?: string, root: Document = document): any[] {
  const nodes: NodeList<any> = (root && root.querySelectorAll && root.querySelectorAll(`.${TO_BIND_CLASS}`))

  if (!nodes) {
    return []
  }

  return toArray(nodes).filter(el => {
    const elFacetName = el.dataset.reactComponent

    // if facetName has been provided...
    if (facetName) {
      // ... only return true if this el matches the provided facet name
      return elFacetName === facetName
    }

    // ... otherwise just return whether or not the data attr exists
    return elFacetName
  })
}

function injectRoot () {
  // attempt to grab the root div that we are goung to mount to
  const prismRoot = document.querySelector('#prism-root')

  if (prismRoot === null) {
    console.warn('Missing PRISM root mounting element. Please add a container with id="prism-root" and try again.')
    return
  }

  const prismUserSettings = prismRoot.dataset
  const prismDefaultSettings = {
    // TODO: do we really want to default to any particular thing? if we do, should it be some kind of default "no component provided" Facet? @cody.richmond
    reactComponent: 'Prism'
  }
  const prismSettings = Object.assign({},
    prismDefaultSettings,
    prismUserSettings
  )

  // create PRISM element and populate its classes & data attributes
  const prismMount = document.createElement('div')
  prismMount.className = `${TO_BIND_CLASS} ${CLEANSLATE_CLASS} ${PRISM_CLASS}`

  // proxy all user settings into the react root
  forOwn(prismSettings, (value, attr) => {
    prismMount.dataset[attr] = value
  })

  // add to prism root
  prismRoot.appendChild(prismMount)
}

function embedAtRoots (override: boolean = false) {
  if (IS_MAIN_BUNDLE) {
    embedBundleStyles(mainEntryPointName)
    if (!override) {
      return
    }
  }

  docReady(bindReactToDOM)
}

// embeds styles for provided facet OR main bundle (internal switch); passes work off to memoized function
// can be safely called multiple times due to downstream embedding
const embedBundleStyles = (bundleName: string) => {
  if (IS_MAIN_BUNDLE) {
    memoEmbedBundleStyles(mainEntryPointName)
  } else {
    memoEmbedBundleStyles(bundleName)
  }
}

// loops over all react roots and attempts to render facet in each -- debounced
const bindReactToDOM = debounce(() => {
  gatherReactRoots().forEach(renderAppInElement)
}, 100)

export {
  bindReactToDOM,
  embedAtRoots,
  flagAsMainBundle,
  gatherReactRoots,
  injectRoot,
  TO_BIND_CLASS
}

export default function (facetDeclaration: typeof Component | Function, facetName: string) {
  const oldFacets = at(window.PRISM, 'facets')[0]
  const oldVersion = at(window.PRISM, 'version')[0]

  // if pre-existing version exists in global PRISM object and it does not match the Facet version we're attempting to bind...
  if (oldVersion && oldVersion !== APP_VERSION) {
    // ... then error out. we can't support multiple versions running in parallel.
    throw new Error(`Prism version mismatch. Attempting to bind ${facetName}@${APP_VERSION} in an ${oldVersion} environment.`)
  }

  window.PRISM = window.PRISM || {
    version: APP_VERSION // eslint-disable-line no-undef
  }

  window.PRISM.facets = {
    ...(oldFacets || {}),
    [facetName]: facetDeclaration
  }

  addToEmbedQueue(facetName)
  embedGlobalStylesOnce()
  initTrackingOnce()
  embedAtRoots()

  return facetDeclaration
}
