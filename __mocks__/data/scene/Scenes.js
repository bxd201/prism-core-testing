// @flow
import cloneDeep from 'lodash/cloneDeep'
import sample from 'lodash/sample'

import { type Scene, type Surface } from '../../../src/shared/types/Scene'

export const Scenes: Array<Scene> = [
  {
    "id": 1,
    "image": "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_night?wid=1280}",
    "thumb": "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_night?wid=300}",
    "width": 1200,
    "height": 725,
    "surfaces": [
      {
        "id": 1,
        "mask": "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_night?wid=1280&req=object&opac=100&fmt=png-alpha&object=wall&color=FFFFFF}&fmt=png-alpha",
        "hitArea": "/prism/images/scenes/rooms/4/1.svg"
      },
      {
        "id": 2,
        "mask": "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_night?wid=1280&req=object&opac=100&fmt=png-alpha&object=accent&color=FFFFFF}&fmt=png-alpha",
        "hitArea": "/prism/images/scenes/rooms/4/2.svg"
      },
      {
        "id": 3,
        "mask": "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_night?wid=1280&req=object&opac=100&fmt=png-alpha&object=trim&color=FFFFFF}&fmt=png-alpha",
        "hitArea": "/prism/images/scenes/rooms/4/3.svg"
      }
    ]
  },
  {
    "id": 2,
    "image": "/prism/images/scenes/rooms/2/scene.jpg",
    "thumb": "/prism/images/scenes/rooms/2/scene.jpg",
    "width": 1200,
    "height": 725,
    "surfaces": [
      {
        "id": 1,
        "mask": "/prism/images/scenes/rooms/2/s1.png",
        "hitArea": "/prism/images/scenes/rooms/2/m1.svg"
      },
      {
        "id": 2,
        "mask": "/prism/images/scenes/rooms/2/s2.png",
        "hitArea": "/prism/images/scenes/rooms/2/m2.svg"
      },
      {
        "id": 3,
        "mask": "/prism/images/scenes/rooms/2/s3.png",
        "hitArea": "/prism/images/scenes/rooms/2/m3.svg"
      }
    ]
  },
  {
    "id": 3,
    "image": "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom5?wid=1800}",
    "thumb": "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom5?wid=300}",
    "width": 1200,
    "height": 725,
    "surfaces": [
      {
        "id": 1,
        "mask": "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom5?wid=1200&req=object&opac=100&fmt=png-alpha&object=wall&color=FFFFFF}&fmt=png-alpha",
        "hitArea": "/prism/images/scenes/rooms/3/1.svg"
      },
      {
        "id": 2,
        "mask": "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom5?wid=1200&req=object&opac=100&fmt=png-alpha&object=accent&color=FFFFFF}&fmt=png-alpha",
        "hitArea": "/prism/images/scenes/rooms/3/2.svg"
      },
      {
        "id": 3,
        "mask": "https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom5?wid=1200&req=object&opac=100&fmt=png-alpha&object=trim&color=FFFFFF}&fmt=png-alpha",
        "hitArea": "/prism/images/scenes/rooms/3/3.svg"
      }
    ]
  }
]

export function getScenes (): Array<Scene> {
  return cloneDeep(Scenes)
}

export function getScene (): Scene {
  return sample(getScenes())
}

export function getSurfaces (): Array<Surface> {
  return getScene().surfaces
}

export function getSurface (): Surface {
  return sample(getSurfaces())
}