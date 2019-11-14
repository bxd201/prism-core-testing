import ReactDOM from 'react-dom'
import { flagAsMainBundle, embedAtRoots, TO_BIND_CLASS } from 'src/facetBinder'
import flatten from 'lodash/flatten'

const gatherReactRoots = (nodes) => {
  if (!nodes || !nodes.length) {
    return []
  }

  return flatten(Array.from(nodes).map(node => {
    if (typeof node.className === 'string' && node.className.indexOf(TO_BIND_CLASS) > -1) {
      return node
    } else if (typeof node.getElementsByClassName === 'function' && node.getElementsByClassName(TO_BIND_CLASS).length) {
      return Array.from(node.getElementsByClassName(TO_BIND_CLASS))
    }
  })).filter(node => !!node)
}

const mutationObserver = new window.MutationObserver((mutationsList) => {
  let rebind = false
  for (var mutation of mutationsList) {
    if (mutation.type === 'childList') {
      gatherReactRoots(mutation.removedNodes).forEach(node => {
        try {
          ReactDOM.unmountComponentAtNode(node)
        } catch (err) {
          console.warn('Warning! Unmount component issue', err)
        }
      })

      if (gatherReactRoots(mutation.addedNodes).length) {
        rebind = true
      }
    }
  }

  // disabling es-lint below for undefined method since this will always be included after bundle.js
  // only in the authoring environment
  if (rebind) {
    // eslint-disable-next-line no-undef
    embedAtRoots(true)
  }
})

flagAsMainBundle()

mutationObserver.observe(document.documentElement, {
  childList: true, // monitors add/removal of child elements
  subtree: true // monitors target and target's descendents
})
