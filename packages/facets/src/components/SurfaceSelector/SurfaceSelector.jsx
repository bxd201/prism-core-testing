// @flow
import React, { Ref } from 'react'
import uniqueId from 'lodash/uniqueId'
import type { PaintSceneWorkspace } from '../../store/actions/paintScene'
import type { Color } from '../../shared/types/Colors'

import './SurfaceSelector.scss'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'

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
    // @todo get actual surfaces
    const surfaces = []
    const surfaceSelectors = surfaces.map((item, i) => {
      return (
        <div style={{ width: 100, height: 75 }} key={uniqueId('surfsel')}>
          { /* @todo stub code to remove static tinter from project -RS */ }
          <SingleTintableSceneView
            surfaceColorsFromParents={null}
            selectedSceneUid={null}
            scenesCollection={[]}
            variantsCollection={[]} />
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
