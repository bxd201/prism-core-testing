// @flow
import React, { useEffect } from 'react'
import normalizeCssPropName from '../shared/utils/normalizeCssPropName.util'
import at from 'lodash/at'

type Props = {
  variables: Object,
  children: any
}

function CSSVariableApplicator ({ variables, children }: Props) {
  const setProperty = at(document, 'documentElement.style.setProperty')[0]

  useEffect(() => {
    if (typeof setProperty !== 'function') {
      return
    }

    for (let prop in variables) {
      setProperty(normalizeCssPropName(prop), variables[prop])
    }
  }, [variables])

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  )
}

export default React.memo<Props>(CSSVariableApplicator)
