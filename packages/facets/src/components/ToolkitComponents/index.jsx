// @flow
import React from 'react'
import Prism, {
  PrismProps,
  CircleLoader as ToolkitCircleLoader,
  SpinnerLoader as ToolkitSpinnerLoader,
  GenericOverlay as ToolkitGenericOverlay,
  SimpleTintableScene as ToolkitSimpleTintableScene
} from '@prism/toolkit'

type Props = {
  wrapperClassname?: 'string'
}

export const CircleLoader = ({ wrapperClassname, ...rest }: Props) => <Prism className={wrapperClassname}>
  <ToolkitCircleLoader {...rest} />
</Prism>

export function withPrism (Component: JSX.Element, prismProps: PrismProps) {
  return (props: {}): JSX.Element => <Prism {...prismProps}>
    <Component {...props} />
  </Prism>
}

export const SpinnerLoader = withPrism(ToolkitSpinnerLoader)
export const SimpleTintableScene = withPrism(ToolkitSimpleTintableScene)
export const GenericOverlay = withPrism(ToolkitGenericOverlay)
GenericOverlay.TYPES = ToolkitGenericOverlay.TYPES
