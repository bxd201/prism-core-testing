// @flow
import React from 'react'

import LivePalette from '../../LivePalette/LivePalette'
import SceneManager from '../../SceneManager/SceneManager'

import { withDragDropContext } from '../../../helpers/WithDragDropContext'

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

export default withDragDropContext(Tinter)
