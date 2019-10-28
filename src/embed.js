import bindReactToDOM from './index'

function swPrismEmbed () {
  // attempt to grab the root div that we are goung to mount to
  const prismRoot = document.querySelector('#prism-root')
  if (prismRoot === null) {
    console.warn('Missing PRISM root mounting element. Please add a container with id="prism-root" and try again.')
    return
  }

  const prismUserSettings = prismRoot.dataset
  const prismDefaultSettings = {
    reactComponent: 'Prism'
  }
  const prismSettings = Object.assign({},
    prismDefaultSettings,
    prismUserSettings
  )

  // create PRISM element and populate its classes & data attributes
  const prismMount = document.createElement('div')
  prismMount.className = '__react-root cleanslate prism'

  // proxy all user settings into the react root
  for (const attr in prismSettings) {
    if (prismSettings.hasOwnProperty(attr)) {
      prismMount.dataset[attr] = prismSettings[attr]
    }
  }

  // add to prism root
  prismRoot.appendChild(prismMount)

  bindReactToDOM()
}

function swPrismStyles () {
  // add styles that need to be immediately applied before our CSS finishes loading
  const immediateStyleTag = document.createElement('style')
  immediateStyleTag.type = 'text/css'
  document.body.appendChild(immediateStyleTag)
  immediateStyleTag.innerHTML = '.cleanslate.prism { display: none }'

  // create the link to our css
  const styleTag = document.createElement('link')
  styleTag.rel = 'stylesheet'
  styleTag.type = 'text/css'
  /* eslint-disable no-undef */ styleTag.href = `${BASE_PATH}/bundle.css`
  styleTag.media = 'all'

  // create the link to the cleanslate css
  const cleanslateTag = document.createElement('link')
  cleanslateTag.rel = 'stylesheet'
  cleanslateTag.type = 'text/css'
  cleanslateTag.href = `${BASE_PATH}/css/cleanslate.css` // eslint-disable-line no-undef
  cleanslateTag.media = 'all'

  // add our css to the <head>
  document.body.appendChild(cleanslateTag)
  document.body.appendChild(styleTag)
}

(function () {
  swPrismStyles()
  swPrismEmbed()
})()

window['swPrismStyles'] = swPrismStyles
window['swPrismEmbed'] = swPrismEmbed
