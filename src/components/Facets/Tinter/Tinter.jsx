// @flow
import React from 'react'

import LivePalette from '../../LivePalette/LivePalette'
import SceneManager from '../../SceneManager/SceneManager'

type Props = {
  sceneSet?: string
}

export function Tinter ({ sceneSet }: Props) {
  return (
    <React.Fragment>
      <SceneManager type={sceneSet} />
      <LivePalette />
    </React.Fragment>
  )
}

export default Tinter
