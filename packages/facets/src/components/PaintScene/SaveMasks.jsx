// @flow

/**
 * This component exists to smooth out the UX for the potentially long mask saving operations.
 * Without calling the action during the initialization as a renderless component a very noticeable delay occurs
 * due to idiosyncrasies in the react/redux lifecycle
 */
import React, { useEffect } from 'react'

type SaveMasksProps = {
  processMasks: Function
}

const SaveMasks = (props: SaveMasksProps) => {
  useEffect(() => {
    props.processMasks()
  }, [])

  return (<></>)
}

export default SaveMasks
