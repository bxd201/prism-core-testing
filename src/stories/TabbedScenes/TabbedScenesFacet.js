import { createPrismEmbedScript } from '../shared/utils'

export function createTabbedScenesFacet ({ groupNames, defaultColors, maxSceneHeight, prismVersion }) {
  function embedPrism () {
    const embedTarget = document.getElementById('prism-embed-root')
    window.PRISM.embed(embedTarget, {
      bindCallback: ({ publish, subscribe }) => {
        // represents colors changing from elsewhere on the page
        const colorSelect = document.querySelector('#color_select')
        if (colorSelect) {
          colorSelect.addEventListener('change', e => {
            // using timestamp is ok for prism template and also since this is invoked by user input and not programmatically
            publish('SV_COLOR_UPDATE', { eventId: `tsv_event_id_${Date.now()}`, data: e.target.value })
          })
        }
      }
    })
  }

  const wrapper = document.createElement('div')
  const div = document.createElement('div')
  div.id = 'prism-embed-root'
  div.setAttribute('data-prism-facet', 'TabbedSceneVisualizerFacet')
  div.setAttribute('data-group-names', groupNames)
  div.setAttribute('data-page-root', '/tsv')
  div.setAttribute('data-default-colors', defaultColors)
  div.setAttribute('data-max-scene-height', maxSceneHeight)

  const script = createPrismEmbedScript(embedPrism, prismVersion)

  wrapper.appendChild(div)
  wrapper.appendChild(script)

  return wrapper
}
