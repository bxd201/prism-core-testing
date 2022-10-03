// @flow
import React from 'react'
import Prism, {
  CircleLoader as ToolkitCircleLoader,
  GenericOverlay as ToolkitGenericOverlay,
  SimpleTintableScene as ToolkitSimpleTintableScene,
  SpinnerLoader as ToolkitSpinnerLoader} from '@prism/toolkit'

type Props = {
  wrapperClassname?: 'string'
}

export const CircleLoader = ({ wrapperClassname, ...rest }: Props) => <Prism className={wrapperClassname}>
  <ToolkitCircleLoader {...rest} />
</Prism>

export function withPrism (Component: JSX.Element) {
  return (props: {}): JSX.Element => <Component {...props} />
}

export const SpinnerLoader = withPrism(ToolkitSpinnerLoader)
export const SimpleTintableScene = withPrism(ToolkitSimpleTintableScene)
export const GenericOverlay = withPrism(ToolkitGenericOverlay)
GenericOverlay.TYPES = ToolkitGenericOverlay.TYPES
