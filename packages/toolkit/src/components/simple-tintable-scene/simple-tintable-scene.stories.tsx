import React from 'react'
import SimpleTintableScene, { SimpleTintableSceneProps } from './simple-tintable-scene'
import { colorOptions } from '../../test-utils/test-utils'
import { shuffle } from 'lodash'

const Template = (args: SimpleTintableSceneProps): JSX.Element => {
  return (
    <div style={{position: 'relative', width: '850px', height: 'auto'}}>
      <SimpleTintableScene
        {...args}
        // @ts-ignore
        surfaceColors={(args.surfaceColors ?? []).map((colorName) => colorOptions[colorName])}
      />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  sceneType: "rooms",
  background: "https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1311)&qlt=92",
  surfaceColors: shuffle(Object.keys(colorOptions)).filter((c, i) => i < 3),
  surfaceIds: [
    1,
    2,
    3
  ],
  surfaceHitAreas: [
    "https://localhost:8080/prism/images/scenes/rooms/livingroom/main.svg",
    "https://localhost:8080/prism/images/scenes/rooms/livingroom/accent.svg",
    "https://localhost:8080/prism/images/scenes/rooms/livingroom/trim.svg"
  ],
  surfaceUrls: [
    "https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1311&req=object&opac=100&fmt=png8&object=wall&color=000000)&fmt=png8&bgColor=FFFFFF&op_invert=1",
    "https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1311&req=object&opac=100&fmt=png8&object=accent&color=000000)&fmt=png8&bgColor=FFFFFF&op_invert=1",
    "https://sherwin.scene7.com/is/image/sw?src=ir(swRender/hd_livingroom6_day?wid=1311&req=object&opac=100&fmt=png8&object=trim&color=000000)&fmt=png8&bgColor=FFFFFF&op_invert=1",
  ],
  highlights: [
    null,
    null,
    null
  ],
  imageValueCurve: "0 0.1 0.15 0.25 0.4 0.5 0.6 0.7 0.84 0.955 1",
  activeColorId: "2906",
  shadows: [
    null,
    null,
    null
  ],
  width: 1311,
  height: 792,
  interactive: false,
}

export default {
  title: 'SimpleTintableScene',
  component: SimpleTintableScene,
  argTypes: {
    surfaceColors: { control: { type: 'multi-select', options: Object.keys(colorOptions).sort() } },
    handleSurfaceInteraction: { action: 'surface click triggered' },
    sceneType: { table: { disable: true, } },
    background: { table: { disable: true, } },
    surfaceIds: { table: { disable: true, } },
    surfaceHitAreas: { table: { disable: true, } },
    surfaceUrls: { table: { disable: true, } },
    shadows: { table: { disable: true, } },
    highlights: { table: { disable: true, } },
    imageValueCurve: { table: { disable: true, } },
    activeColorId: { table: { disable: true, } },
    height: { table: { disable: true, } },
    width: { table: { disable: true, } },
  }
}
