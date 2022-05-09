// @flow
import React from 'react'
import Prism, { CircleLoader as ToolkitCircleLoader, SpinnerLoader as ToolkitSpinnerLoader } from '@prism/toolkit'

type Props = {
  wrapperClassname?: 'string'
}

export const CircleLoader = ({ wrapperClassname, ...rest }: Props) => <Prism className={wrapperClassname}>
  <ToolkitCircleLoader {...rest} />
</Prism>

export const SpinnerLoader = (props) => <Prism>
  <ToolkitSpinnerLoader {...props} />
</Prism>
