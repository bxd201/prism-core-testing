// @flow
import React, { type Element, lazy, Suspense, useEffect, useState } from 'react'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import { type CVWPropsType as CVWContentsPropsType } from './ColorVisualizerContents'
import { PreLoadingSVG } from './PreLoadingSVG'

// lazy-load the contents of the CVW
const ColorVisualizerContents = lazy(() => import('./ColorVisualizerContents'))

type CVWPropsType = CVWContentsPropsType & {
  brand: string,
  language: string,
  maxSceneHeight: number
}

export const ColorVisualizerWrapper = (props: CVWPropsType) => {
  const [loading, setLoading] = useState<Element<typeof PreLoadingSVG> | null>(null)

  useEffect(() => {
    setLoading(<PreLoadingSVG brand={props.brand} />)
  }, [])

  return (
    <div className='cvw__root-container' id='cvw-container'>
      <Suspense fallback={loading}>
        <ColorVisualizerContents {...props} />
      </Suspense>
    </div>
  )
}

ColorVisualizerWrapper.defaultProps = { ...facetPubSubDefaultProps, ...facetBinderDefaultProps }

export default facetBinder(ColorVisualizerWrapper, 'ColorVisualizer')
