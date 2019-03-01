// @flow
import React, { useEffect } from 'react'

function CSSVariableApplicator ({ variables, children }: Props) {
  useEffect(() => {
    for (let prop in variables) {
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
