import bindReactToDOM from './index'

(function () {
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
  /* eslint-disable no-undef */ cleanslateTag.href = `${BASE_PATH}/css/cleanslate.css`
  cleanslateTag.media = 'all'

  // add our css to the <head>
  document.getElementsByTagName('head')[0].appendChild(cleanslateTag)
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

  prismMount.className = '__react-root cleanslate prism'
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
