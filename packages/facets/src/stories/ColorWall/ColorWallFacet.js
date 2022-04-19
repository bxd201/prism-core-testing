import { createPrismEmbedScript } from '../shared/utils'

export function createColorWallFacet ({ language, cdpPageRoot, prismVersion }) {
  const wrapper = document.createElement('div')
  const div = document.createElement('div')
  div.id = 'prism-embed-root'

  const script = createPrismEmbedScript((e) => void (0), prismVersion)
  div.setAttribute('prism-auto-embed', 'true')
  div.classList.add('prism-color-wall')
  div.setAttribute('data-prism-facet', 'ColorWallFacet')
  div.setAttribute('data-language', language)
  div.setAttribute('data-page-root', '/')
  div.setAttribute('data-color-detail-page-root',
    cdpPageRoot)
  div.setAttribute('data-route-type', 'hash')

  wrapper.appendChild(div)
  wrapper.appendChild(script)

  return wrapper
}
