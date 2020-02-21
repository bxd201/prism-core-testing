// @flow
import React, { useMemo } from 'react'
import LiveAnnouncerContext from './LiveAnnouncerContext'

export type LiveAnnouncerProps = {
  announceAssertive: Function,
  announcePolite: Function
}

type Props = LiveAnnouncerProps & {
  children: any
}

function LiveAnnouncerContextProvider (props: Props) {
  const {
    announceAssertive: announceAssertiveOriginal,
    announcePolite: announcePoliteOriginal,
    children
  } = props

  const ctx = useMemo<LiveAnnouncerProps>(() => ({
    // PRISM-506 | create a version of the announceAssertive and announcePolite methods which automatically
    // apply a clearing operation before populating message in order to fix an issue with screen readers
    // where they will not repeat the last message when toggling back and forth
    announceAssertive: (msg, id) => {
      announceAssertiveOriginal('')
      setTimeout(() => {
        announceAssertiveOriginal(msg, id)
      }, 100)
    },
    announcePolite: (msg, id) => {
      announcePoliteOriginal('')
      setTimeout(() => {
        announcePoliteOriginal(msg, id)
      }, 100)
    }
  }), [ announceAssertiveOriginal, announcePoliteOriginal ])

  return (
    <LiveAnnouncerContext.Provider value={ctx}>
      {children}
    </LiveAnnouncerContext.Provider>
  )
}

export default React.memo<Props>(LiveAnnouncerContextProvider)
