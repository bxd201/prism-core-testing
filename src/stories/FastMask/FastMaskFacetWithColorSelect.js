import { createFastMaskFacet } from './FastMaskFacet'
import { createColorSelect } from '../shared/ColorSelect'

import './fastmask.css'

export function createFastMaskWithColorSelect ({ groupNames, forceSquare, showLoader, sceneName, defaultImage, defaultMask, maxSceneHeight, uploadButtonText, color, prismVersion }) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('fastmask-with-color-select-wrapper')
  const colorSelect = createColorSelect()
  const fastMask = createFastMaskFacet({ groupNames, forceSquare, showLoader, sceneName, defaultImage, defaultMask, maxSceneHeight, uploadButtonText, color, prismVersion })
  wrapper.insertAdjacentHTML('beforeend', colorSelect)
  wrapper.appendChild(fastMask)

  return wrapper
}
