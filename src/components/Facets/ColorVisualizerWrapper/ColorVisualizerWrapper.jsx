// @flow
import React, { Suspense } from 'react'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import { PreLoadingSVG } from './PreLoadingSVG'
import { SHOW_LOADER_ONLY_BRANDS } from '../../../constants/globals'

// lazy-load the contents of the CVW
const ColorVisualizerContents = React.lazy(() => import('./ColorVisualizerContents'))

type CVWPropsType = {
  maxSceneHeight: number,
  brand: string
}

export const ColorVisualizerWrapper = (props: CVWPropsType) => {
  const { brand } = props
  return (
    <div className='cvw__root-container'>
      {/* display PreLoadingSVG while CVW contents of CVW load */}
      <Suspense fallback={<PreLoadingSVG hideSVG={SHOW_LOADER_ONLY_BRANDS.indexOf(brand) > -1} />}>
        <ColorVisualizerContents {...props} />
      </Suspense>
    </div>
  )
}

ColorVisualizerWrapper.defaultProps = { ...facetPubSubDefaultProps, ...facetBinderDefaultProps }

export default facetBinder(ColorVisualizerWrapper, 'ColorVisualizer')
