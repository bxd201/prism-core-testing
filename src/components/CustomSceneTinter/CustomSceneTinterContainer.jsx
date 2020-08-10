// @flow
import React from 'react'
import './CustomSceneTinter.scss'
import type { SceneWorkspace } from '../../shared/types/Scene'
import TintableScene from '../SceneManager/TintableScene'

type CustomSceneTinterContainerProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  workspace: SceneWorkspace
}

const customSceneTinterClass = 'custom-scene-tinter'

const CustomSceneTinterContainer = (props: CustomSceneTinterContainerProps) => {
  return (
    <>
      <div className={customSceneTinterClass} />
      {/* <TintableScene sceneName={} height={} width={} background={} surfaceStatus={} type={} sceneId={} /> */}
    </>
  )
}

export default CustomSceneTinterContainer
