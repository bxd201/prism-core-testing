// @flow
import './facetPolyfills'

import React, { useMemo } from 'react'

import { render } from 'react-dom'
import toArray from 'lodash/toArray'
import mapValues from 'lodash/mapValues'
import debounce from 'lodash/debounce'
import at from 'lodash/at'

import docReady from 'src/shared/helpers/docReady'
import { type EmbeddedConfiguration } from 'src/shared/types/Configuration.js.flow'
import facetPubSub from './facetPubSub'
import { addInstance, getInstance, unmount, type BoundFacet } from './facetInstance'
import { initFirebaseOnce } from './facetFirebase'

// import the redux store
import { HAS_BOUND_CLASS, TO_BIND_CLASS } from './facetConstants'
import { facetMasterWrapper } from './facetMasterWrapper'
import { FIREBASE_CONFIG } from 'constants/configurations'
import dressUpForPrism from './utils/dressUpForPrism'
import updateGlobalPrismObject from './utils/updateGlobalPrismObject'

let [addToEmbedQueue, embedQueue] = [(facetName) => {
  embedQueue.push(facetName)
}, []]

// returns Facet instance if it exists in this bundle
const getAppIfAvailable = (facetName) => {
  // if no data attribute specifying the react component exists, let's get out.
  // although if it doesn't have this data attribute, it shouldn't have a __react-root class...
  if (!facetName) {
    console.warn('The specified element does not have the required Prism facet specifying attribute.')
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
const renderAppInElement = (el: HTMLElement, explicitProps: Object = {}) => {
  if (!el) {
    return
  }

  if (el.className.indexOf(HAS_BOUND_CLASS) > -1) {
    return
  }

  console.info('Attempting to embed a Prism Facet in the following element:', el)

  // give all necessary default attributes and classnames
  dressUpForPrism(el)

  // get props from elements data attribute, like the post_id
  const attrProps = mapValues(Object.assign({}, el.dataset), v => v === '' ? true : v)
  const { reactComponent, prismFacet, bindCallback, ...props }: {
    reactComponent: string,
    prismFacet: string,
    bindCallback: Function,
    props: EmbeddedConfiguration
  } = {
    ...attrProps,
    ...explicitProps
  }
  const facet = prismFacet || reactComponent // TODO: deprecate "reactComponent" in favor of "prismFacet"
  const App = getAppIfAvailable(facet)

  console.info('app bound to', App, el, props)

  if (!App) {
    console.info('Aborting Prism Facet embed operation.')
    return
  }

  const bindProps: {
    el: HTMLElement,
    bindCallback: Function
  } = {
    el,
    bindCallback // a callback which will be passed a (FacetPubSubMethods & FacetBinderMethods) object on bind
  }

  const Component = facetMasterWrapper(facetPubSub(App))

  render(<Component {...props} {...bindProps} />, el)

  el.classList.add(HAS_BOUND_CLASS)
}

// gathers either A) all embed roots, or B) embed roots matching a specified facet name
function gatherReactRoots (facetName?: string, root: Document = document): any[] {
  const nodes: NodeList<any> = (root && root.querySelectorAll && root.querySelectorAll(`.${TO_BIND_CLASS}`))
  if (!nodes) {
    return []
  }

  return toArray(nodes).filter(el => {
    const elFacetName = el.dataset.prismFacet || el.dataset.reactComponent // TODO: deprecate "reactComponent" in favor of "prismFacet"

    // if facetName has been provided...
    if (facetName) {
      // ... only return true if this el matches the provided facet name
      return elFacetName === facetName
    }

    // ... otherwise just return whether or not the data attr exists
    return elFacetName
  })
}

function embedAtRoots (override: boolean = false) {
  if (!override) {
    return
  }

  docReady(bindReactToDOM)
}

function embedAtElement (el: HTMLElement, props: Object = {}) {
  docReady(() => {
    renderAppInElement(el, props)
  })
}

// loops over all react roots and attempts to render facet in each -- debounced
const bindReactToDOM = debounce(() => {
  gatherReactRoots().forEach((el) => renderAppInElement(el))
}, 100)

export {
  bindReactToDOM,
  embedAtElement,
  embedAtRoots,
  gatherReactRoots
}

export default function facetBinder (FacetDeclaration: BoundFacet, facetName: string): BoundFacet {
  const oldFacets = at(window.PRISM, 'facets')[0]
  const oldVersion = at(window.PRISM, 'version')[0]

  function BF (props: any): BoundFacet {
    const { bindCallback, el, ...passthruProps } = props

    // NOTE: I need to mimic componentWillMount behavior here, so I'm using useMemo in order to
    // execute immediately
    useMemo(() => {
      addInstance({
        component: FacetDeclaration,
        el
      }, bindCallback)
    }, [])

    return <FacetDeclaration unmount={unmount(el)} {...passthruProps} />
  }

  // if pre-existing version exists in global PRISM object and it does not match the Facet version we're attempting to bind...
  if (oldVersion && oldVersion !== APP_VERSION) {
    // ... then error out. we can't support multiple versions running in parallel.
    throw new Error(`Prism version mismatch. Attempting to bind ${facetName}@${APP_VERSION} in an ${oldVersion} environment.`)
  }

  updateGlobalPrismObject('version', APP_VERSION)
  updateGlobalPrismObject('at', getInstance)
  updateGlobalPrismObject('facets', {
    ...(oldFacets || {}),
    [facetName]: BF
  })

  // make this facet available to be embedded
  addToEmbedQueue(facetName)

  initFirebaseOnce(FIREBASE_CONFIG)

  embedAtRoots()

  return BF
}
