// @flow
import React, { useEffect } from 'react'

type Props = {
  variables: Object,
  children: Node
}

function CSSVariableApplicator ({ variables, children }: Props) {
  useEffect(() => {
    for (let prop in variables) {
      // $FlowIgnore -- flow doesn't know of the style attribute within documentElement
      document.documentElement.style.setProperty(`--${prop}`, variables[prop])
    }
  }, [variables])

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  )
}

export default CSSVariableApplicator
