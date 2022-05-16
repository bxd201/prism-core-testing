import React, { CSSProperties } from 'react'
import { Transition } from 'react-transition-group'

export interface InlineStyleTransitionProps {
  timeout: number
  children?: JSX.Element
  // This prop is supplied by TransitionGroup(npm:react-transition-group) when rendered as a child
  //   but should be supplied if rendered separately.. @see:  https://reactcommunity.org/react-transition-group/transition-group
  in?: boolean
  key?: string
  default?: CSSProperties
  entering?: CSSProperties
  entered?:  CSSProperties
  exiting?:  CSSProperties
  exited?:  CSSProperties
}

const InlineStyleTransition = ({
  children,
  timeout,
  key,
  default: defaultProp,
  entering,
  entered,
  exiting,
  exited,
  ...rest
}: InlineStyleTransitionProps): JSX.Element => {
  const states = {
    entering,
    entered,
    exiting,
    exited,
  }

  return children ? <Transition
    key={key}
    timeout={timeout}
    classNames={`__colors__color-`}
    {...rest} >
    {state => (
      <div id={key} style={{
        ...defaultProp,
        ...states[state]
      }}>
        { children }
      </div>
    )}
  </Transition> : null
}
InlineStyleTransition.defaultProps = {
  default: {},
  entering: {},
  entered:  {},
  exiting:  {},
  exited:  {},
}

export default InlineStyleTransition
