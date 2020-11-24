// @flow
import React, { Ref } from 'react'
import uniqueId from 'lodash/uniqueId'
import { StaticTintScene } from '../CompareColor/StaticTintScene'
import { SCENE_VARIANTS } from '../../constants/globals'
import { createPseudoScene, createPseudoSceneMetaData } from '../CustomSceneTinter/CustomSceneTinterContainer'
import type { PaintSceneWorkspace } from '../../store/actions/paintScene'
import type { Color } from '../../shared/types/Colors'

import './SurfaceSelector.scss'

type SurfaceSelectorProp = {
  workspace: PaintSceneWorkspace,
  maskRef: Ref,
  lpColors: Color[],
  colorSurfaceMap: any
}

const surfaceSelectorBase = 'surface-selector'
const surfaceSelectorClassName = `${surfaceSelectorBase}`
const surfaceSelectorListClassName = `${surfaceSelectorBase}__list`

export const SurfaceSelector = (props: SurfaceSelectorProp) => {
  const { workspace, maskRef, lpColors, colorSurfaceMap } = props
  const createSurfaceSelectors = (workspace: PaintSceneWorkspace, maskRef: Ref, lpColors: Color[], colorSurfaceMap: any) => {
    const { bgImageUrl, width, height, layers: surfaces } = workspace

    const surfaceSelectors = surfaces.map((item, i) => {
      const scene = createPseudoScene(bgImageUrl, maskRef, colorSurfaceMap, width, height)
      const { surfaces: sceneStatus } = createPseudoSceneMetaData(scene, lpColors, SCENE_VARIANTS.DAY, i)

      return (
        <div style={{ width: 100, height: 75 }} key={uniqueId('surfsel')}>
          <StaticTintScene
            scene={scene}
            statuses={sceneStatus}
            config={{ isNightScene: false }} />
        </div>
      )
    })

    return surfaceSelectors
  }

  return (
    <>
      <div className={surfaceSelectorClassName}>
        <div className={surfaceSelectorListClassName}>
          {createSurfaceSelectors(workspace, maskRef, lpColors, colorSurfaceMap)}
        </div>
      </div>
    </>
  )
}
