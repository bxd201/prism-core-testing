import React from 'react'
import { BUTTON_POSITIONS, SCENE_TYPES, SCENE_VARIANTS } from '../../constants'
import { sw6084, sw7005, sw9053 } from '../../test-utils/mock-data'
import { Color } from '../../types'
import { createMiniColorFromColor } from '../../utils/tintable-scene'
import SceneView, { SceneViewContent } from './scene-view'

const selectedUid = 'scene-1'

const dayBackgroundUrl = 'https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1311)&qlt=92'
const nightBackgroundUrl =
  'https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_night?wid=1311)&qlt=92'

const surface1Url =
  'https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000)&fmt=png8&bgColor=FFFFFF&op_invert=1'

const surface1 = {
  id: 1,
  role: '',
  thumb: '',
  hitArea: 'https://prism.sherwin-williams.com/prism/images/scenes/rooms/livingroom/main.svg',
  shadows: '',
  highlights: '',
  surfaceBlobUrl: surface1Url
}

const scenes = [
  {
    id: 1,
    width: 600,
    height: 375,
    variantNames: [SCENE_VARIANTS.DAY, SCENE_VARIANTS.NIGHT],
    sceneType: SCENE_TYPES.ROOM,
    uid: selectedUid,
    description: 'A nice living room'
  }
]

const variants = [
  {
    id: 1,
    sceneUid: selectedUid,
    sceneId: 1,
    variantName: SCENE_VARIANTS.DAY,
    sceneType: SCENE_TYPES.ROOM,
    surfaces: [surface1],
    image: dayBackgroundUrl,
    thumb: '',
    normalizedImageValueCurve: '',
    sceneCategories: null,
    expertColorPicks: null,
    isFirstOfKind: true
  },
  {
    id: 2,
    sceneUid: selectedUid,
    sceneId: 1,
    variantName: SCENE_VARIANTS.NIGHT,
    sceneType: SCENE_TYPES.ROOM,
    surfaces: [surface1],
    image: nightBackgroundUrl,
    thumb: '',
    normalizedImageValueCurve: '',
    sceneCategories: null,
    expertColorPicks: null,
    isFirstOfKind: true
  }
]

const getContent = (text: string): SceneViewContent => {
  return { clearAreaText: text ?? 'clear area' }
}

const getColor = (colorStr: string): Color => {
  switch (colorStr) {
    case 'SW-7005':
      return sw7005
    case 'SW-6084':
      return sw6084
    default:
      return sw9053
  }
}

const Template = (args): JSX.Element => {
  const { content, surfaceColorsFromParents, allowVariantSwitch, showClearButton, buttonPosition, interactive } = args
  const color = getColor(surfaceColorsFromParents)

  return (
    <div style={{ width: '75%' }}>
      <SceneView
        interactive={interactive}
        buttonPosition={buttonPosition}
        allowVariantSwitch={allowVariantSwitch}
        showClearButton={showClearButton}
        surfaceColorsFromParents={[createMiniColorFromColor(color)]}
        selectedSceneUid={selectedUid}
        scenesCollection={scenes}
        variantsCollection={variants}
        content={getContent(content)}
      />
    </div>
  )
}

export const sceneView = Template.bind({})
sceneView.args = {}

export default {
  title: 'Components/SceneView',
  component: SceneView,
  argTypes: {
    content: {
      type: 'string',
      description: 'This text sets the "clearAreaText" property of a POJO.'
    },
    surfaceColorsFromParents: {
      control: {
        type: 'select',
        options: ['SW-7005', 'SW-6084', 'SW-9053']
      }
    },
    allowVariantSwitch: {
      control: 'boolean'
    },
    showClearButton: {
      control: 'boolean'
    },
    interactive: {
      control: 'boolean'
    },
    buttonPosition: {
      control: {
        type: 'select',
        options: [BUTTON_POSITIONS.BOTTOM, BUTTON_POSITIONS.TOP]
      }
    }
  }
}
