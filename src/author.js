import bindReactToDOM from './index'

const mutationObserver = new window.MutationObserver(() => {
  // disabling es-lint below for undefined method since this will always be included after bundle.js
  // only in the authoring environment
  // eslint-disable-next-line no-undef
  bindReactToDOM()
})

mutationObserver.observe(document.documentElement, {
  childList: true, // monitors add/removal of child elements
  subtree: true // monitors target and target's descendents
})
