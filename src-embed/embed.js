// @flow
import { EMBED_ROOT_SELECTOR_DEPRECATED, EMBED_ROOT_SELECTOR } from 'src/facetSupport/facetConstants'
import addHideStyles from 'src/facetSupport/styles/addHideStyles'
import dressUpForPrism from 'src/facetSupport/utils/dressUpForPrism'
import embedScript from 'src/facetSupport/scripts/embedScript'
import embedStyle from 'src/facetSupport/styles/embedStyle'
import mapValues from 'lodash/mapValues'
import updateGlobalPrismObject from 'src/facetSupport/utils/updateGlobalPrismObject'

const prismManifest = require('embedWorking/prismManifest.json') // eslint-disable-line

const promiseFor = {}
const getPromiseFor = (facetName: string) => {
  if (promiseFor[facetName]) return promiseFor[facetName]

  const scriptPromises = []
  const targetedDependencies = prismManifest.filter(mod => {
    // if GENERATE_FACET_ASSETS global is true, try to load provided facet by name
    if (GENERATE_FACET_ASSETS) {
      return mod.name === facetName
    }
    // otherwise just load the main bundle
    return mod.main
  }).map(mod => mod.dependencies).reduce((accum, next) => next, undefined)

  if (!targetedDependencies) {
    throw new Error(`Invalid embed attempted for unknown Prism facet '${facetName}'.`)
  }

  targetedDependencies.forEach(dep => {
    if (dep.match(/\.css$/)) {
      embedStyle(dep)
    } else if (dep.match(/\.js$/)) {
      scriptPromises.push(embedScript(dep))
    }
  })

  promiseFor[facetName] = Promise.all(scriptPromises)
    .then(() => new Promise((resolve, reject) => {
      const timeout = Date.now() + 10000 // 10s timeout to locate embed method
      const checkForEmbedMethod = () => {
        const method = window.PRISM && window.PRISM.facets && window.PRISM.facets[facetName] // look for internal embed method created by bundle.js
        if (typeof method === 'function') resolve(method)
        if (Date.now() > timeout) return reject(new Error(`Prism embed method not found for facet '${facetName}'.`))
        setTimeout(checkForEmbedMethod, 100)
      }

      checkForEmbedMethod()
    }))

  return promiseFor[facetName]
}

// eslint-disable-next-line
const prismPromise = new Promise((resolvePrism, rejectPrism) => {
  const embedQueue = new function () {
    const embedMethodFor = {}
    const embedRequestsFor = {}

    this.add = (...args) => {
      const [el, props = {}] = args

      if (!el) {
        throw new Error('no element')
      }

      // targeted Prism Facet should be identified by either dataset.prismFacet or props.prismFacet
      // if not, I guess we can drop this particular request?
      const attrProps: {[key: string]: string} = mapValues(Object.assign({}, el.dataset), v => v === '' ? true : v)
      const { reactComponent, prismFacet } = attrProps
      // eslint-disable-next-line
      const chosenFacet: string | typeof undefined = props.prismFacet || prismFacet || reactComponent

      if (!chosenFacet) {
        throw new Error('no facet')
      }
      if (typeof embedMethodFor[chosenFacet] === 'function') return embedMethodFor[chosenFacet].apply(undefined, args)
      if (!embedRequestsFor[chosenFacet]) embedRequestsFor[chosenFacet] = []
      embedRequestsFor[chosenFacet].push(args)

      getPromiseFor(chosenFacet).then(embedMethod => {
        embedMethodFor[chosenFacet] = embedMethod
        embedMethod.apply(undefined, args)
      })
    }

    return this
  }()

  updateGlobalPrismObject('status', 202)
  updateGlobalPrismObject('embed', embedQueue.add)
  updateGlobalPrismObject('verify', 1641840639586)

  addHideStyles()

  const prismRootLegacy = Array.from(document.querySelectorAll(EMBED_ROOT_SELECTOR_DEPRECATED))
  const prismRootModern = Array.from(document.querySelectorAll(EMBED_ROOT_SELECTOR))
  const allRoots = [
    ...prismRootLegacy,
    ...prismRootModern
  ]

  if (allRoots.length > 0) {
    allRoots.map(el => dressUpForPrism(el)).map(el => embedQueue.add(el))
  }
})
