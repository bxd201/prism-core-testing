import { createColorSelect } from '../shared/ColorSelect'
import { createTabbedScenesFacet } from './TabbedScenesFacet'
import './tabbed-scenes.css'

export function createTabbedScenesWithColorSelect ({ groupNames, defaultColors, maxSceneHeight, prismVersion }) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('tabbed-scene-with-color-select-wrapper')
  const colorSelect = createColorSelect()
  const tabbedScene = createTabbedScenesFacet({ groupNames, defaultColors, maxSceneHeight, prismVersion })
  wrapper.insertAdjacentHTML('beforeend', colorSelect)
  wrapper.appendChild(tabbedScene)

  return wrapper
}
