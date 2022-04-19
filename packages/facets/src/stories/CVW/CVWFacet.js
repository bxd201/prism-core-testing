import { createPrismEmbedScript } from '../shared/utils'

export function createCVWFacet ({ colorWallBgColor, language, selectedColorFamily, maxSceneHeight, prismVersion }) {
  function embedPrism () {
    const embedTarget = document.getElementById('prism-embed-root')
    window.PRISM.embed(embedTarget, {
      bindCallback: ({ publish, subscribe }) => {}
    })
  }

  const wrapper = document.createElement('div')
  const div = document.createElement('div')
  div.id = 'prism-embed-root'
  div.setAttribute('data-prism-facet', 'ColorVisualizer')
  div.setAttribute('data-color-wall-bg-color', colorWallBgColor)
  div.setAttribute('data-language', language)
  div.setAttribute('data-page-root', '/cvw')
  div.setAttribute('data-route-type', 'hash')
  div.setAttribute('data-selected-color-family', selectedColorFamily)
  div.setAttribute('data-max-scene-height', maxSceneHeight)

  const script = createPrismEmbedScript(embedPrism, prismVersion)

  wrapper.appendChild(div)
  wrapper.appendChild(script)

  return wrapper
}
