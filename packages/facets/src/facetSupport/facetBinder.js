// @flow
import React, { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { FIREBASE_CONFIG } from 'constants/configurations'
import mapValues from 'lodash/mapValues'
import { type EmbeddedConfiguration } from 'src/shared/types/Configuration.js.flow'
import './facetPolyfills'
import dressUpForPrism from './utils/dressUpForPrism'
import { getFromGlobalPrismObject, updateGlobalPrismObject } from './utils/globalPrismObject'
// import the redux store
import { HAS_BOUND_CLASS } from './facetConstants'
import { initFirebaseOnce } from './facetFirebase'
import { type BoundFacet, addInstance, getInstance, unmount } from './facetInstance'
import { facetMasterWrapper } from './facetMasterWrapper'
import facetPubSub from './facetPubSub'

// renders Facet on specified element
const renderAppInElement = (el: HTMLElement, explicitProps: Object = {}, App) => {
  console.info('Attempting to embed a Prism Facet in the following element:', { embeddingIn: el })

  if (!el) {
    console.warn('Element not found, cannot embed')
    return
  }

  if (el.className.indexOf(HAS_BOUND_CLASS) > -1) {
    console.warn('Element already contains an embedded facet, cannot embed again.')
    return
  }

  // give all necessary default attributes and classnames
  dressUpForPrism(el)

  const getArrayFromString = (value: any) => {
    if (value?.length > 1 && value[0] === '[' && value[value.length - 1] === ']') {
      return value.length > 2
        ? value
            .substring(1, value.length - 1)
            .split(',')
            .map((item) => (typeof item === 'string' ? item.trim() : item))
        : []
    }
    return value
  }

  const getPOJOFromString = (value: any) => {
    // smallest possible value is 7 chars ie: {'a':1}
    if (value?.length > 6 && value[0] === '{' && value[value.length - 1] === '}') {
      const val = value.replace(/'/g, '"')

      return JSON.parse(val)
    }

    return value
  }

  /*
  getTypedValue uses the value's formatting to infer type.
  supported types:
  numeric - any string representation of a number ie: "1.00" "42" "7.548" will be converted to a float or int
  array - any string value that begins with "['" and ends with "]" will return an array using a comma as a delimiter.
  It will also trim any string spacing
  object - if a JSON-like ("{'foo': 42}")string is present it convert to an object
   */
  const getTypedValue = (value: any) => {
    // convert string to object
    const objVal = getPOJOFromString(value)
    if (objVal !== value) {
      return objVal
    }

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

  const valueMapHandler = (v) => getTypedValue(v)

  // make sure numeric string are converted to ints/floats do this both for embedded data attributes and js props
  const jsProps = mapValues({ ...explicitProps }, valueMapHandler)

  // get props from elements data attribute, like the post_id
  const attrProps = mapValues(Object.assign({}, el.dataset), valueMapHandler)

  const {
    reactComponent,
    prismFacet,
    bindCallback,
    ...props
  }: {
    bindCallback: Function,
    props: EmbeddedConfiguration
  } = {
    ...attrProps,
    ...jsProps
  }

  if (!App) {
    console.info('No associated facet found. Aborting Prism Facet embed operation.')
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

  console.info(`Successfully rendered this facet with the following configuration.`, { in: el, facet: Component, props: props, bindProps: bindProps })
}

export default function facetBinder(FacetDeclaration: BoundFacet, facetName: string): BoundFacet {
  console.info(`${facetName} bound in Prism`)
  const oldFacets = getFromGlobalPrismObject('facets') || {}

  function FacetDeclarationWrapper(props: any): BoundFacet {
    const { bindCallback, el, ...passthruProps } = props

    // NOTE: I need to mimic componentWillMount behavior here, so I'm using useMemo in order to
    // execute immediately
    useMemo(() => {
      addInstance(
        {
          component: FacetDeclaration,
          el
        },
        bindCallback
      )
    }, [])

    return <FacetDeclaration unmount={unmount(el)} {...passthruProps} />
  }

  console.info(`(1/2) Defining renderAppInElement function for ${facetName}. Original facets list:`, oldFacets)
  updateGlobalPrismObject('version', APP_VERSION)
  updateGlobalPrismObject('at', getInstance)
  const newFacets = {
    ...oldFacets,
    [facetName]: (el, props) => renderAppInElement(el, props, FacetDeclarationWrapper)
  }
  updateGlobalPrismObject('facets', newFacets)
  console.info(`(2/2) Defined renderAppInElement function for ${facetName}. Updated facets list:`, newFacets)

  initFirebaseOnce(FIREBASE_CONFIG)

  return FacetDeclarationWrapper
}
