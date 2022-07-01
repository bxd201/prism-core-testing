// @flow
import './facetPolyfills'

import React, { useMemo } from 'react'

import { createRoot } from 'react-dom/client'
import mapValues from 'lodash/mapValues'
import at from 'lodash/at'

import { type EmbeddedConfiguration } from 'src/shared/types/Configuration.js.flow'
import facetPubSub from './facetPubSub'
import { addInstance, getInstance, unmount, type BoundFacet } from './facetInstance'
import { initFirebaseOnce } from './facetFirebase'

// import the redux store
import { HAS_BOUND_CLASS } from './facetConstants'
import { facetMasterWrapper } from './facetMasterWrapper'
import { FIREBASE_CONFIG } from 'constants/configurations'
import dressUpForPrism from './utils/dressUpForPrism'
import updateGlobalPrismObject from './utils/updateGlobalPrismObject'

// renders Facet on specified element
const renderAppInElement = (el: HTMLElement, explicitProps: Object = {}, App) => {
  if (!el) {
    return
  }

  if (el.className.indexOf(HAS_BOUND_CLASS) > -1) {
    return
  }

  console.info('Attempting to embed a Prism Facet in the following element:', el)

  // give all necessary default attributes and classnames
  dressUpForPrism(el)

  const getArrayFromString = (value: any) => {
    if (value?.length > 1 && value[0] === '[' && value[value.length - 1] === ']') {
      return value.length > 2 ? value.substring(1, value.length - 1)
        .split(',').map(item => typeof item === 'string' ? item.trim() : item) : []
    }
    return value
  }

  /*
  getTypedValue uses the value's formatting to infer type.
  supported types:
  numeric - any string representation of a number ie: "1.00" "42" "7.548" will be converted to a float or int
  array - any string value that begins with "['" and ends with "]" will return an array using a comma as a delimiter.
  It will also trim any string spacing
   */
  const getTypedValue = (value: any) => {
    // convert string to array
    const arrayVal = getArrayFromString(value)
    if (arrayVal !== value) {
      return arrayVal
    }
    // convert strings to floats if they are numeric strings
    const convertedVal = parseFloat(value)
    if (value === '') {
      return true
    }
    // this is intentional loose equality to allow values like "1.00" to equal 1
    // eslint-disable-next-line eqeqeq
    if (`${convertedVal}` == value) {
      return convertedVal
    }

    return value
  }

  const valueMapHandler = v => getTypedValue(v)

  // make sure numeric string are converted to ints/floats do this both for embedded data attributes and js props
  const jsProps = mapValues({ ...explicitProps }, valueMapHandler)

  // get props from elements data attribute, like the post_id
  const attrProps = mapValues(Object.assign({}, el.dataset), valueMapHandler)

  const { reactComponent, prismFacet, bindCallback, ...props }: {
    bindCallback: Function,
    props: EmbeddedConfiguration
  } = {
    ...attrProps,
    ...jsProps
  }

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

  const root = createRoot(el)
  root.render(<Component {...props} {...bindProps} />)

  el.classList.add(HAS_BOUND_CLASS)
}

export default function facetBinder (FacetDeclaration: BoundFacet, facetName: string): BoundFacet {
  const oldFacets = at(window.PRISM, 'facets')[0] || {}

  function FacetDeclarationWrapper (props: any): BoundFacet {
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

  updateGlobalPrismObject('version', APP_VERSION)
  updateGlobalPrismObject('at', getInstance)
  updateGlobalPrismObject('facets', {
    ...oldFacets,
    [facetName]: (el, props) => renderAppInElement(el, props, FacetDeclarationWrapper)
  })

  initFirebaseOnce(FIREBASE_CONFIG)

  return FacetDeclarationWrapper
}
