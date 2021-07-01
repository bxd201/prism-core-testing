// @flow
import React, { Suspense } from 'react'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import { PreLoadingSVG } from './PreLoadingSVG'
import { type CVWPropsType as CVWContentsPropsType } from './ColorVisualizerContents'

// lazy-load the contents of the CVW
const ColorVisualizerContents = React.lazy(() => import('./ColorVisualizerContents'))

type CVWPropsType = CVWContentsPropsType & {
  maxSceneHeight: number,
  brand: string
}

export const ColorVisualizerWrapper = (props: CVWPropsType) =>
  <div className='cvw__root-container'>
    {/* display PreLoadingSVG while CVW contents of CVW load */}
    <Suspense fallback={<PreLoadingSVG brand={props.brand} />}>
      <ColorVisualizerContents {...props} />
    </Suspense>
  </div>

ColorVisualizerWrapper.defaultProps = { ...facetPubSubDefaultProps, ...facetBinderDefaultProps }

export default facetBinder(ColorVisualizerWrapper, 'ColorVisualizer')
