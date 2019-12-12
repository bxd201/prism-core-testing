// @flow
import React from 'react'

import LivePalette from '../../LivePalette/LivePalette'
import SceneManager from '../../SceneManager/SceneManager'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'

type Props = FacetBinderMethods & FacetPubSubMethods & {
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

Tinter.defaultProps = {
  ...facetBinderDefaultProps,
  ...facetPubSubDefaultProps
}

export default facetBinder(Tinter, 'Tinter')
