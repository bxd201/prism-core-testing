// @flow
import React, { useEffect } from 'react'
import normalizeCssPropName from '../shared/utils/normalizeCssPropName.util'
import at from 'lodash/at'

type Props = {
  variables: Object,
  children: any
}

const setProperty = at(document, 'documentElement.style.setProperty')[0]

function CSSVariableApplicator ({ variables, children }: Props) {
  useEffect(() => {
    if (typeof setProperty !== 'function') {
      return
    }

    for (let prop in variables) {
      const value = variables[prop]

      // if a value has been defined...
      if (value) {
        // ... set it!
        // $FlowIgnore -- flow doesn't recognize the style prop of documentElement
        document.documentElement.style.setProperty(normalizeCssPropName(prop), value)
      }
    }
  }, [variables])

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  )
}

export default React.memo<Props>(CSSVariableApplicator)
