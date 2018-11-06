import bindReactToDOM from './index'

(function () {
  // add our CSS to the <head>
  const styleTag = document.createElement('link')
  styleTag.rel = 'stylesheet'
  styleTag.type = 'text/css'
  styleTag.href = '//dev-prism-web.ebus.swaws/bundle.css' // TODO: Replace with environment specific URL
  styleTag.media = 'all'
  document.getElementsByTagName('head')[0].appendChild(styleTag)

  // attempt to grab the root div that we are goung to mount to
  const prismRoot = document.querySelector('#prism-root')
  if (prismRoot === null) {
    console.warn('Missing PRISM root mounting element. Please add a container with id="prism-root" and try again.')
    return
  }

  // create PRISM element and populate it's classes & data attributes
  const prismMount = document.createElement('div')
  const prismSettings = prismRoot.dataset

  prismMount.className = '__react-root'
  prismMount.dataset.reactComponent = 'Prism'

  // proxy all user settings into the react root
  for (const attr in prismSettings) {
    if (prismSettings.hasOwnProperty(attr)) {
      prismMount.dataset[attr] = prismSettings[attr]
    }
  }

  // add to prism root
  prismRoot.appendChild(prismMount)

  bindReactToDOM()
})()
